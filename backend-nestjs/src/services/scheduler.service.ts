import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BallotService } from '../ballot/ballot.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly ballotService: BallotService,
    private readonly prisma: PrismaService
  ) {}

  // Run every minute to check for ballots that should start
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoStartBallots() {
    try {
      this.logger.log('🕐 Checking for ballots that should start...');
      const result = await this.ballotService.checkAndAutoStartBallots();
      
      if (result.autoStartedBallots.length > 0) {
        this.logger.log(`✅ Auto-started ${result.autoStartedBallots.length} ballot(s)`);
        result.autoStartedBallots.forEach(ballot => {
          this.logger.log(`   📊 ${ballot.Ballot_Title}: Started at ${ballot.Ballot_StartDate}`);
        });
      } else {
        this.logger.log('✅ No ballots ready to start');
      }
    } catch (error) {
      this.logger.error('❌ Error in auto-start ballots check:', error);
    }
  }

  // Run every minute to check for expired ballots
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoEndBallots() {
    try {
      this.logger.log('🕐 Checking for expired ballots...');
      const result = await this.ballotService.checkAndAutoEndBallots();
      
      if (result.autoEndedBallots.length > 0) {
        this.logger.log(`✅ Auto-ended ${result.autoEndedBallots.length} ballot(s)`);
        result.autoEndedBallots.forEach(ballot => {
          this.logger.log(`   📊 ${ballot.Ballot_Title}: ${ballot._count?.votes || 0} votes, ${ballot._count?.userHistory || 0} voters`);
        });
      } else {
        this.logger.log('✅ No expired ballots found');
      }
    } catch (error) {
      this.logger.error('❌ Error in auto-end ballots check:', error);
    }
  }

  // Run every 5 minutes to log ballot status
  @Cron(CronExpression.EVERY_5_MINUTES)
  async logBallotStatus() {
    try {
      // TODO: Implement ballot status logging
      const activeBallots = [];
      const now = new Date();
      
      if (activeBallots.length > 0) {
        this.logger.log(`📊 Active ballots: ${activeBallots.length}`);
        activeBallots.forEach(ballot => {
          const endDate = new Date(ballot.Ballot_EndDate);
          const timeRemaining = Math.max(0, endDate.getTime() - now.getTime());
          const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          
          this.logger.log(`   🗳️ ${ballot.Ballot_Title}: ${hoursRemaining}h ${minutesRemaining}m remaining`);
        });
      }
    } catch (error) {
      this.logger.error('❌ Error logging ballot status:', error);
    }
  }

  // Run every 5 minutes to clean up inactive user sessions
  @Cron('0 */5 * * * *') // Every 5 minutes
  async cleanupInactiveSessions() {
    try {
      this.logger.log('🧹 Cleaning up inactive user sessions...');
      
      // Find sessions that have been active for more than 30 minutes (simple timeout)
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
      
      const inactiveSessions = await this.prisma.userLoginLog.findMany({
        where: {
          isActive: true,
          loginTime: {
            lt: thirtyMinutesAgo
          }
        },
        include: {
          user: true
        }
      });
      
      if (inactiveSessions.length > 0) {
        this.logger.log(`📊 Found ${inactiveSessions.length} inactive sessions to clean up`);
        
        const now = new Date();
        let cleanedCount = 0;
        
        for (const session of inactiveSessions) {
          const duration = Math.floor((now.getTime() - session.loginTime.getTime()) / 1000);
          
          await this.prisma.userLoginLog.update({
            where: { id: session.id },
            data: {
              logoutTime: now,
              duration: duration,
              isActive: false,
            },
          });
          
          this.logger.log(`✅ Auto-logged out: ${session.user.Voter_Name} (${Math.floor(duration/60)}m ${duration%60}s)`);
          cleanedCount++;
        }
        
        this.logger.log(`✅ Cleaned up ${cleanedCount} inactive sessions`);
      } else {
        this.logger.log('✅ No inactive sessions found');
      }
      
    } catch (error) {
      this.logger.error('❌ Error cleaning up inactive sessions:', error);
    }
  }
} 