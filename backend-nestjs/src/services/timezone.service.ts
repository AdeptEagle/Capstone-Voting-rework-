import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';

@Injectable()
export class TimezoneService {
  private readonly PHILIPPINE_TIMEZONE = 'Asia/Manila';
  private readonly PHILIPPINE_TIMEZONE_ABBR = 'PHT';

  /**
   * Get current Philippine time
   */
  getCurrentPhilippineTime(): Date {
    return moment().tz(this.PHILIPPINE_TIMEZONE).toDate();
  }

  /**
   * Convert UTC date to Philippine time
   */
  convertToPhilippineTime(utcDate: Date | string): Date {
    return moment(utcDate).tz(this.PHILIPPINE_TIMEZONE).toDate();
  }

  /**
   * Convert Philippine time to UTC
   */
  convertToUTC(philippineDate: Date | string): Date {
    return moment.tz(philippineDate, this.PHILIPPINE_TIMEZONE).utc().toDate();
  }

  /**
   * Format date in Philippine timezone with custom format
   */
  formatPhilippineTime(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return moment(date).tz(this.PHILIPPINE_TIMEZONE).format(format);
  }

  /**
   * Format date for display in Philippine timezone
   */
  formatPhilippineTimeForDisplay(date: Date | string): string {
    return moment(date).tz(this.PHILIPPINE_TIMEZONE).format('MMMM DD, YYYY h:mm A');
  }

  /**
   * Get Philippine timezone info
   */
  getPhilippineTimezoneInfo() {
    const now = moment().tz(this.PHILIPPINE_TIMEZONE);
    return {
      timezone: this.PHILIPPINE_TIMEZONE,
      abbreviation: this.PHILIPPINE_TIMEZONE_ABBR,
      currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
      currentTimeDisplay: now.format('MMMM DD, YYYY h:mm A'),
      offset: now.format('Z'),
      isDST: now.isDST(),
    };
  }

  /**
   * Check if a date is in the past relative to Philippine time
   */
  isPastInPhilippineTime(date: Date | string): boolean {
    const philippineNow = moment().tz(this.PHILIPPINE_TIMEZONE);
    const philippineDate = moment(date).tz(this.PHILIPPINE_TIMEZONE);
    return philippineDate.isBefore(philippineNow);
  }

  /**
   * Check if a date is in the future relative to Philippine time
   */
  isFutureInPhilippineTime(date: Date | string): boolean {
    const philippineNow = moment().tz(this.PHILIPPINE_TIMEZONE);
    const philippineDate = moment(date).tz(this.PHILIPPINE_TIMEZONE);
    return philippineDate.isAfter(philippineNow);
  }

  /**
   * Get time difference in Philippine timezone
   */
  getTimeDifferenceInPhilippineTime(targetDate: Date | string): {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    isPast: boolean;
    isFuture: boolean;
    formatted: string;
  } {
    const philippineNow = moment().tz(this.PHILIPPINE_TIMEZONE);
    const philippineTarget = moment(targetDate).tz(this.PHILIPPINE_TIMEZONE);
    const diff = philippineTarget.diff(philippineNow);

    const isPast = diff < 0;
    const isFuture = diff > 0;
    const absDiff = Math.abs(diff);

    return {
      milliseconds: diff,
      seconds: Math.floor(absDiff / 1000),
      minutes: Math.floor(absDiff / (1000 * 60)),
      hours: Math.floor(absDiff / (1000 * 60 * 60)),
      days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
      isPast,
      isFuture,
      formatted: this.formatTimeDifference(diff),
    };
  }

  /**
   * Format time difference in human-readable format
   */
  private formatTimeDifference(milliseconds: number): string {
    const absMs = Math.abs(milliseconds);
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absMs % (1000 * 60)) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);

    const timeString = parts.join(', ');
    return milliseconds < 0 ? `${timeString} ago` : `in ${timeString}`;
  }

  /**
   * Create a date in Philippine timezone
   */
  createPhilippineDate(year: number, month: number, day: number, hour: number = 0, minute: number = 0, second: number = 0): Date {
    return moment.tz([year, month - 1, day, hour, minute, second], this.PHILIPPINE_TIMEZONE).toDate();
  }

  /**
   * Get Philippine timezone offset in minutes
   */
  getPhilippineTimezoneOffset(): number {
    return moment().tz(this.PHILIPPINE_TIMEZONE).utcOffset();
  }
} 