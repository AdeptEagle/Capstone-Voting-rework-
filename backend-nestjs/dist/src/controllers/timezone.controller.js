"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimezoneController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const timezone_service_1 = require("../services/timezone.service");
let TimezoneController = class TimezoneController {
    constructor(timezoneService) {
        this.timezoneService = timezoneService;
    }
    async getPhilippineTime() {
        const currentTime = this.timezoneService.getCurrentPhilippineTime();
        const timezoneInfo = this.timezoneService.getPhilippineTimezoneInfo();
        return {
            currentTime: this.timezoneService.formatPhilippineTimeForDisplay(currentTime),
            timezone: timezoneInfo,
            utcTime: currentTime.toISOString(),
        };
    }
    async getPhilippineTimezoneInfo() {
        return this.timezoneService.getPhilippineTimezoneInfo();
    }
    async convertToPhilippineTime(date) {
        const philippineTime = this.timezoneService.convertToPhilippineTime(date);
        return {
            originalDate: date,
            philippineTime: this.timezoneService.formatPhilippineTimeForDisplay(philippineTime),
            utcTime: philippineTime.toISOString(),
            timezoneInfo: this.timezoneService.getPhilippineTimezoneInfo(),
        };
    }
};
exports.TimezoneController = TimezoneController;
__decorate([
    (0, common_1.Get)('philippine-time'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current Philippine time' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current Philippine time retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimezoneController.prototype, "getPhilippineTime", null);
__decorate([
    (0, common_1.Get)('philippine-timezone-info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Philippine timezone information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Philippine timezone information retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimezoneController.prototype, "getPhilippineTimezoneInfo", null);
__decorate([
    (0, common_1.Get)('convert/:date'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert date to Philippine time' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Date converted to Philippine time successfully' }),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimezoneController.prototype, "convertToPhilippineTime", null);
exports.TimezoneController = TimezoneController = __decorate([
    (0, swagger_1.ApiTags)('Timezone'),
    (0, common_1.Controller)('timezone'),
    __metadata("design:paramtypes", [timezone_service_1.TimezoneService])
], TimezoneController);
//# sourceMappingURL=timezone.controller.js.map