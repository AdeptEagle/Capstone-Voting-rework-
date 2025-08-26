import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ElectionService } from '../election/election.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly electionService: ElectionService) {}

  // Run every minute to check for expired elections
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoEndElections() {
    try {
      this.logger.log('🕐 Checking for expired elections...');
      const result = await this.electionService.checkAndAutoEndElections();
      
      if (result.autoEndedElections.length > 0) {
        this.logger.log(`✅ Auto-ended ${result.autoEndedElections.length} election(s)`);
        result.autoEndedElections.forEach(election => {
          this.logger.log(`   📊 ${election.election.title}: ${election.finalResults.totalVotes} votes, ${election.finalResults.uniqueVoters} voters`);
        });
      } else {
        this.logger.log('✅ No expired elections found');
      }
    } catch (error) {
      this.logger.error('❌ Error in auto-end elections check:', error);
    }
  }

  // Run every 5 minutes to log election status
  @Cron(CronExpression.EVERY_5_MINUTES)
  async logElectionStatus() {
    try {
      const activeElections = await this.electionService.getActiveElections();
      const now = new Date();
      
      if (activeElections.length > 0) {
        this.logger.log(`📊 Active elections: ${activeElections.length}`);
        activeElections.forEach(election => {
          const endDate = new Date(election.endDate);
          const timeRemaining = Math.max(0, endDate.getTime() - now.getTime());
          const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          
          this.logger.log(`   🗳️ ${election.Election_Title}: ${hoursRemaining}h ${minutesRemaining}m remaining`);
        });
      }
    } catch (error) {
      this.logger.error('❌ Error logging election status:', error);
    }
  }
} 