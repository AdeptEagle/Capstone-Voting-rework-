import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BallotService } from '../ballot/ballot.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogCleanupConfigService } from './log-cleanup-config.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly ballotService: BallotService,
    private readonly prisma: PrismaService,
    private readonly logCleanupConfig: LogCleanupConfigService
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
      
      // Find sessions that have been active for more than configured timeout
      const timeoutMinutes = this.logCleanupConfig.getInactiveSessionTimeoutMinutes();
      const timeoutDate = this.logCleanupConfig.getDateMinutesAgo(timeoutMinutes);
      
      const inactiveSessions = await this.prisma.userLoginLog.findMany({
        where: {
          isActive: true,
          loginTime: {
            lt: timeoutDate
          }
        },
        include: {
          user: true
        }
      });
      
      if (inactiveSessions.length > 0) {
        this.logger.log(`📊 Found ${inactiveSessions.length} inactive user sessions to clean up`);
        
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
        
        this.logger.log(`✅ Cleaned up ${cleanedCount} inactive user sessions`);
      } else {
        this.logger.log('✅ No inactive user sessions found');
      }
      
    } catch (error) {
      this.logger.error('❌ Error cleaning up inactive user sessions:', error);
    }
  }

  // Run every 5 minutes to clean up inactive admin sessions
  @Cron('0 */5 * * * *') // Every 5 minutes
  async cleanupInactiveAdminSessions() {
    try {
      this.logger.log('🧹 Cleaning up inactive admin sessions...');
      
      // Find admin sessions that have been active for more than configured timeout
      const timeoutMinutes = this.logCleanupConfig.getInactiveSessionTimeoutMinutes();
      const timeoutDate = this.logCleanupConfig.getDateMinutesAgo(timeoutMinutes);
      
      const inactiveAdminSessions = await this.prisma.adminLoginLog.findMany({
        where: {
          isActive: true,
          loginTime: {
            lt: timeoutDate
          }
        },
        include: {
          admin: true
        }
      });
      
      if (inactiveAdminSessions.length > 0) {
        this.logger.log(`📊 Found ${inactiveAdminSessions.length} inactive admin sessions to clean up`);
        
        const now = new Date();
        let cleanedCount = 0;
        
        for (const session of inactiveAdminSessions) {
          const duration = Math.floor((now.getTime() - session.loginTime.getTime()) / 1000);
          
          await this.prisma.adminLoginLog.update({
            where: { id: session.id },
            data: {
              logoutTime: now,
              duration: duration,
              isActive: false,
            },
          });
          
          this.logger.log(`✅ Auto-logged out admin: ${session.admin.Admin_Username} (${Math.floor(duration/60)}m ${duration%60}s)`);
          cleanedCount++;
        }
        
        this.logger.log(`✅ Cleaned up ${cleanedCount} inactive admin sessions`);
      } else {
        this.logger.log('✅ No inactive admin sessions found');
      }
      
    } catch (error) {
      this.logger.error('❌ Error cleaning up inactive admin sessions:', error);
    }
  }

  // Run daily at configured time to clean up old login logs
  @Cron('0 2 * * *') // Daily at 2:00 AM (will be updated to use config)
  async cleanupOldLoginLogs() {
    try {
      this.logger.log('🧹 Starting daily cleanup of old login logs...');
      
      // Get retention periods from configuration
      const userLogRetentionDays = this.logCleanupConfig.getUserLoginLogRetentionDays();
      const adminLogRetentionDays = this.logCleanupConfig.getAdminLoginLogRetentionDays();
      const auditLogRetentionDays = this.logCleanupConfig.getAuditLogRetentionDays();
      
      // Calculate dates based on configuration
      const userLogCutoffDate = this.logCleanupConfig.getDateDaysAgo(userLogRetentionDays);
      const adminLogCutoffDate = this.logCleanupConfig.getDateDaysAgo(adminLogRetentionDays);
      const auditLogCutoffDate = this.logCleanupConfig.getDateDaysAgo(auditLogRetentionDays);
      
      // Clean up User Login Logs older than configured retention period
      const deletedUserLogs = await this.prisma.userLoginLog.deleteMany({
        where: {
          createdAt: {
            lt: userLogCutoffDate
          }
        }
      });
      
      // Clean up Admin Login Logs older than configured retention period
      const deletedAdminLogs = await this.prisma.adminLoginLog.deleteMany({
        where: {
          createdAt: {
            lt: adminLogCutoffDate
          }
        }
      });
      
      // Clean up Audit Logs older than configured retention period (login-related only)
      const deletedAuditLogs = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: auditLogCutoffDate
          },
          eventType: {
            in: ['LOGIN_ATTEMPT', 'SECURITY_ALERT']
          }
        }
      });
      
      const totalDeleted = deletedUserLogs.count + deletedAdminLogs.count + deletedAuditLogs.count;
      
      if (totalDeleted > 0) {
        this.logger.log(`✅ Cleaned up old login logs:`);
        this.logger.log(`   👤 User login logs: ${deletedUserLogs.count} deleted`);
        this.logger.log(`   👨‍💼 Admin login logs: ${deletedAdminLogs.count} deleted`);
        this.logger.log(`   🔍 Audit logs (login-related): ${deletedAuditLogs.count} deleted`);
        this.logger.log(`   📊 Total logs cleaned: ${totalDeleted}`);
      } else {
        this.logger.log('✅ No old login logs found to clean up');
      }
      
    } catch (error) {
      this.logger.error('❌ Error cleaning up old login logs:', error);
    }
  }

  // Run weekly on Sunday at 3 AM to clean up very old audit logs
  @Cron('0 3 * * 0') // Weekly on Sunday at 3:00 AM (will be updated to use config)
  async cleanupOldAuditLogs() {
    try {
      this.logger.log('🧹 Starting weekly cleanup of old audit logs...');
      
      // Get retention periods from configuration
      const auditLogRetentionDays = this.logCleanupConfig.getAuditLogRetentionDays();
      const criticalAuditLogRetentionDays = this.logCleanupConfig.getCriticalAuditLogRetentionDays();
      
      // Calculate dates based on configuration
      const auditLogCutoffDate = this.logCleanupConfig.getDateDaysAgo(auditLogRetentionDays);
      const criticalAuditLogCutoffDate = this.logCleanupConfig.getDateDaysAgo(criticalAuditLogRetentionDays);
      
      // Clean up old audit logs (keep critical logs longer)
      const deletedAuditLogs = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: auditLogCutoffDate
          },
          severity: {
            not: 'CRITICAL' // Keep critical logs longer
          }
        }
      });
      
      // Clean up very old critical audit logs
      const deletedCriticalAuditLogs = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: criticalAuditLogCutoffDate
          },
          severity: 'CRITICAL'
        }
      });
      
      const totalDeleted = deletedAuditLogs.count + deletedCriticalAuditLogs.count;
      
      if (totalDeleted > 0) {
        this.logger.log(`✅ Cleaned up old audit logs:`);
        this.logger.log(`   🔍 Non-critical audit logs: ${deletedAuditLogs.count} deleted`);
        this.logger.log(`   🚨 Critical audit logs: ${deletedCriticalAuditLogs.count} deleted`);
        this.logger.log(`   📊 Total audit logs cleaned: ${totalDeleted}`);
      } else {
        this.logger.log('✅ No old audit logs found to clean up');
      }
      
    } catch (error) {
      this.logger.error('❌ Error cleaning up old audit logs:', error);
    }
  }
} 