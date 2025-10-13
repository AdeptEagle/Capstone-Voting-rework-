export declare class TimezoneService {
    private readonly PHILIPPINE_TIMEZONE;
    private readonly PHILIPPINE_TIMEZONE_ABBR;
    getCurrentPhilippineTime(): Date;
    convertToPhilippineTime(utcDate: Date | string): Date;
    convertToUTC(philippineDate: Date | string): Date;
    formatPhilippineTime(date: Date | string, format?: string): string;
    formatPhilippineTimeForDisplay(date: Date | string): string;
    getPhilippineTimezoneInfo(): {
        timezone: string;
        abbreviation: string;
        currentTime: string;
        currentTimeDisplay: string;
        offset: string;
        isDST: boolean;
    };
    isPastInPhilippineTime(date: Date | string): boolean;
    isFutureInPhilippineTime(date: Date | string): boolean;
    getTimeDifferenceInPhilippineTime(targetDate: Date | string): {
        milliseconds: number;
        seconds: number;
        minutes: number;
        hours: number;
        days: number;
        isPast: boolean;
        isFuture: boolean;
        formatted: string;
    };
    private formatTimeDifference;
    createPhilippineDate(year: number, month: number, day: number, hour?: number, minute?: number, second?: number): Date;
    getPhilippineTimezoneOffset(): number;
}
