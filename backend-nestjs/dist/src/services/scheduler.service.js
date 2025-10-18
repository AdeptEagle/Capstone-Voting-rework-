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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const ballot_service_1 = require("../ballot/ballot.service");
const prisma_service_1 = require("../prisma/prisma.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    constructor(ballotService, prisma) {
        this.ballotService = ballotService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(SchedulerService_1.name);
    }
    async handleAutoStartBallots() {
        try {
            this.logger.log('🕐 Checking for ballots that should start...');
            const result = await this.ballotService.checkAndAutoStartBallots();
            if (result.autoStartedBallots.length > 0) {
                this.logger.log(`✅ Auto-started ${result.autoStartedBallots.length} ballot(s)`);
                result.autoStartedBallots.forEach(ballot => {
                    this.logger.log(`   📊 ${ballot.Ballot_Title}: Started at ${ballot.Ballot_StartDate}`);
                });
            }
            else {
                this.logger.log('✅ No ballots ready to start');
            }
        }
        catch (error) {
            this.logger.error('❌ Error in auto-start ballots check:', error);
        }
    }
    async handleAutoEndBallots() {
        try {
            this.logger.log('🕐 Checking for expired ballots...');
            const result = await this.ballotService.checkAndAutoEndBallots();
            if (result.autoEndedBallots.length > 0) {
                this.logger.log(`✅ Auto-ended ${result.autoEndedBallots.length} ballot(s)`);
                result.autoEndedBallots.forEach(ballot => {
                    this.logger.log(`   📊 ${ballot.Ballot_Title}: ${ballot._count?.votes || 0} votes, ${ballot._count?.userHistory || 0} voters`);
                });
            }
            else {
                this.logger.log('✅ No expired ballots found');
            }
        }
        catch (error) {
            this.logger.error('❌ Error in auto-end ballots check:', error);
        }
    }
    async logBallotStatus() {
        try {
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
        }
        catch (error) {
            this.logger.error('❌ Error logging ballot status:', error);
        }
    }
    async cleanupInactiveSessions() {
        try {
            this.logger.log('🧹 Cleaning up inactive user sessions...');
            const thirtyMinutesAgo = new Date();
            thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
            const inactiveSessions = await this.prisma.userLoginLog.findMany({
                where: {
                    isActive: true,
                    loginTime: {
                        lt: thirtyMinutesAgo
                    }
                },
                include: {
                    user: true
                }
            });
            if (inactiveSessions.length > 0) {
                this.logger.log(`📊 Found ${inactiveSessions.length} inactive sessions to clean up`);
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
                    this.logger.log(`✅ Auto-logged out: ${session.user.Voter_Name} (${Math.floor(duration / 60)}m ${duration % 60}s)`);
                    cleanedCount++;
                }
                this.logger.log(`✅ Cleaned up ${cleanedCount} inactive sessions`);
            }
            else {
                this.logger.log('✅ No inactive sessions found');
            }
        }
        catch (error) {
            this.logger.error('❌ Error cleaning up inactive sessions:', error);
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleAutoStartBallots", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleAutoEndBallots", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "logBallotStatus", null);
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "cleanupInactiveSessions", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ballot_service_1.BallotService,
        prisma_service_1.PrismaService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map