import { TimezoneService } from '../services/timezone.service';
export declare class TimezoneController {
    private readonly timezoneService;
    constructor(timezoneService: TimezoneService);
    getPhilippineTime(): Promise<{
        currentTime: string;
        timezone: {
            timezone: string;
            abbreviation: string;
            currentTime: string;
            currentTimeDisplay: string;
            offset: string;
            isDST: boolean;
        };
        utcTime: string;
    }>;
    getPhilippineTimezoneInfo(): Promise<{
        timezone: string;
        abbreviation: string;
        currentTime: string;
        currentTimeDisplay: string;
        offset: string;
        isDST: boolean;
    }>;
    convertToPhilippineTime(date: string): Promise<{
        originalDate: string;
        philippineTime: string;
        utcTime: string;
        timezoneInfo: {
            timezone: string;
            abbreviation: string;
            currentTime: string;
            currentTimeDisplay: string;
            offset: string;
            isDST: boolean;
        };
    }>;
}
