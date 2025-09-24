/**
 * Timezone utility functions for Philippine Time (GMT+8)
 */

export class TimezoneUtil {
  private static readonly PHILIPPINES_TIMEZONE = 'Asia/Manila';
  
  /**
   * Get current time in Philippine timezone
   */
  static getCurrentPhilippineTime(): Date {
    return new Date(new Date().toLocaleString("en-US", { timeZone: TimezoneUtil.PHILIPPINES_TIMEZONE }));
  }
  
  /**
   * Convert any date to Philippine timezone
   */
  static toPhilippineTime(date: Date | string): Date {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    return new Date(inputDate.toLocaleString("en-US", { timeZone: TimezoneUtil.PHILIPPINES_TIMEZONE }));
  }
  
  /**
   * Check if a date is in the past relative to Philippine time
   */
  static isInPast(date: Date | string): boolean {
    const checkDate = TimezoneUtil.toPhilippineTime(date);
    const now = TimezoneUtil.getCurrentPhilippineTime();
    return checkDate < now;
  }
  
  /**
   * Format date for Philippine timezone display
   */
  static formatPhilippineTime(date: Date | string): string {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    return inputDate.toLocaleString("en-PH", { 
      timeZone: TimezoneUtil.PHILIPPINES_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  /**
   * Add minutes buffer to current Philippine time (useful for minimum start time)
   */
  static getPhilippineTimeWithBuffer(bufferMinutes: number = 5): Date {
    const now = TimezoneUtil.getCurrentPhilippineTime();
    return new Date(now.getTime() + (bufferMinutes * 60 * 1000));
  }
}
