import { Injectable } from '@nestjs/common';

export interface LogCleanupConfig {
  // Login logs retention (in days)
  userLoginLogRetentionDays: number;
  adminLoginLogRetentionDays: number;
  
  // Audit logs retention (in days)
  auditLogRetentionDays: number;
  criticalAuditLogRetentionDays: number;
  
  // Session cleanup (in minutes)
  inactiveSessionTimeoutMinutes: number;
  
  // Cleanup schedules
  dailyCleanupHour: number; // 0-23 (24-hour format)
  weeklyCleanupDay: number; // 0-6 (Sunday = 0)
  weeklyCleanupHour: number; // 0-23 (24-hour format)
}

@Injectable()
export class LogCleanupConfigService {
  private readonly config: LogCleanupConfig;

  constructor() {
    // Load configuration from environment variables or use defaults
    this.config = {
      // Login logs retention - 3 days by default
      userLoginLogRetentionDays: parseInt(process.env.USER_LOGIN_LOG_RETENTION_DAYS || '3'),
      adminLoginLogRetentionDays: parseInt(process.env.ADMIN_LOGIN_LOG_RETENTION_DAYS || '3'),
      
      // Audit logs retention - 30 days for regular, 90 days for critical
      auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '30'),
      criticalAuditLogRetentionDays: parseInt(process.env.CRITICAL_AUDIT_LOG_RETENTION_DAYS || '90'),
      
      // Session cleanup - 30 minutes timeout
      inactiveSessionTimeoutMinutes: parseInt(process.env.INACTIVE_SESSION_TIMEOUT_MINUTES || '30'),
      
      // Cleanup schedules - Daily at 2 AM, Weekly on Sunday at 3 AM
      dailyCleanupHour: parseInt(process.env.DAILY_CLEANUP_HOUR || '2'),
      weeklyCleanupDay: parseInt(process.env.WEEKLY_CLEANUP_DAY || '0'), // Sunday
      weeklyCleanupHour: parseInt(process.env.WEEKLY_CLEANUP_HOUR || '3'),
    };
  }

  getConfig(): LogCleanupConfig {
    return this.config;
  }

  getUserLoginLogRetentionDays(): number {
    return this.config.userLoginLogRetentionDays;
  }

  getAdminLoginLogRetentionDays(): number {
    return this.config.adminLoginLogRetentionDays;
  }

  getAuditLogRetentionDays(): number {
    return this.config.auditLogRetentionDays;
  }

  getCriticalAuditLogRetentionDays(): number {
    return this.config.criticalAuditLogRetentionDays;
  }

  getInactiveSessionTimeoutMinutes(): number {
    return this.config.inactiveSessionTimeoutMinutes;
  }

  getDailyCleanupHour(): number {
    return this.config.dailyCleanupHour;
  }

  getWeeklyCleanupDay(): number {
    return this.config.weeklyCleanupDay;
  }

  getWeeklyCleanupHour(): number {
    return this.config.weeklyCleanupHour;
  }

  /**
   * Get cron expression for daily cleanup
   */
  getDailyCleanupCron(): string {
    return `0 ${this.config.dailyCleanupHour} * * *`;
  }

  /**
   * Get cron expression for weekly cleanup
   */
  getWeeklyCleanupCron(): string {
    return `0 ${this.config.weeklyCleanupHour} * * ${this.config.weeklyCleanupDay}`;
  }

  /**
   * Calculate date X days ago
   */
  getDateDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  /**
   * Calculate date X minutes ago
   */
  getDateMinutesAgo(minutes: number): Date {
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutes);
    return date;
  }
}
