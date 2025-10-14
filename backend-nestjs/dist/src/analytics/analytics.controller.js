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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getAnalytics(req, ballotId, timeRange) {
        const userId = req.user?.id;
        return this.analyticsService.getAnalyticsData(ballotId, timeRange, userId);
    }
    async getPositionAnalytics(ballotId, timeRange) {
        const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
        return data.positionAnalytics;
    }
    async getDepartmentAnalytics(ballotId, timeRange) {
        const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
        return data.departmentAnalytics;
    }
    async getPartylistAnalytics(ballotId, timeRange) {
        const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
        return data.partylistAnalytics;
    }
    async getVotingPatterns(ballotId, timeRange) {
        const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
        return data.votingPatterns;
    }
    async getTimeAnalytics(ballotId, timeRange) {
        const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
        return data.timeAnalytics;
    }
    async getSummaryAnalytics(ballotId, timeRange) {
        const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
        return data.summary;
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('ballotId')),
    __param(2, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('positions'),
    __param(0, (0, common_1.Query)('ballotId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPositionAnalytics", null);
__decorate([
    (0, common_1.Get)('departments'),
    __param(0, (0, common_1.Query)('ballotId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDepartmentAnalytics", null);
__decorate([
    (0, common_1.Get)('partylists'),
    __param(0, (0, common_1.Query)('ballotId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPartylistAnalytics", null);
__decorate([
    (0, common_1.Get)('patterns'),
    __param(0, (0, common_1.Query)('ballotId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getVotingPatterns", null);
__decorate([
    (0, common_1.Get)('time'),
    __param(0, (0, common_1.Query)('ballotId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTimeAnalytics", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('ballotId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSummaryAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map