"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimezoneService = void 0;
const common_1 = require("@nestjs/common");
const moment = require("moment-timezone");
let TimezoneService = class TimezoneService {
    constructor() {
        this.PHILIPPINE_TIMEZONE = 'Asia/Manila';
        this.PHILIPPINE_TIMEZONE_ABBR = 'PHT';
    }
    getCurrentPhilippineTime() {
        return moment().tz(this.PHILIPPINE_TIMEZONE).toDate();
    }
    convertToPhilippineTime(utcDate) {
        return moment(utcDate).tz(this.PHILIPPINE_TIMEZONE).toDate();
    }
    convertToUTC(philippineDate) {
        return moment.tz(philippineDate, this.PHILIPPINE_TIMEZONE).utc().toDate();
    }
    formatPhilippineTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
        return moment(date).tz(this.PHILIPPINE_TIMEZONE).format(format);
    }
    formatPhilippineTimeForDisplay(date) {
        return moment(date).tz(this.PHILIPPINE_TIMEZONE).format('MMMM DD, YYYY h:mm A');
    }
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
    isPastInPhilippineTime(date) {
        const philippineNow = moment().tz(this.PHILIPPINE_TIMEZONE);
        const philippineDate = moment(date).tz(this.PHILIPPINE_TIMEZONE);
        return philippineDate.isBefore(philippineNow);
    }
    isFutureInPhilippineTime(date) {
        const philippineNow = moment().tz(this.PHILIPPINE_TIMEZONE);
        const philippineDate = moment(date).tz(this.PHILIPPINE_TIMEZONE);
        return philippineDate.isAfter(philippineNow);
    }
    getTimeDifferenceInPhilippineTime(targetDate) {
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
    formatTimeDifference(milliseconds) {
        const absMs = Math.abs(milliseconds);
        const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
        const parts = [];
        if (days > 0)
            parts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours > 0)
            parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0)
            parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        if (seconds > 0 && days === 0 && hours === 0)
            parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
        const timeString = parts.join(', ');
        return milliseconds < 0 ? `${timeString} ago` : `in ${timeString}`;
    }
    createPhilippineDate(year, month, day, hour = 0, minute = 0, second = 0) {
        return moment.tz([year, month - 1, day, hour, minute, second], this.PHILIPPINE_TIMEZONE).toDate();
    }
    getPhilippineTimezoneOffset() {
        return moment().tz(this.PHILIPPINE_TIMEZONE).utcOffset();
    }
};
exports.TimezoneService = TimezoneService;
exports.TimezoneService = TimezoneService = __decorate([
    (0, common_1.Injectable)()
], TimezoneService);
//# sourceMappingURL=timezone.service.js.map