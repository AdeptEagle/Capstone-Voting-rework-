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
exports.BallotController = void 0;
const common_1 = require("@nestjs/common");
const ballot_service_1 = require("./ballot.service");
const create_ballot_dto_1 = require("./dto/create-ballot.dto");
const update_ballot_dto_1 = require("./dto/update-ballot.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let BallotController = class BallotController {
    constructor(ballotService) {
        this.ballotService = ballotService;
    }
    createBallot(createBallotDto, req) {
        console.log('🔐 Ballot creation auth check:');
        console.log('User object:', req.user);
        console.log('User role:', req.user?.role);
        console.log('User ID:', req.user?.id);
        console.log('User type:', req.user?.type);
        return this.ballotService.createBallot(createBallotDto, req.user.id);
    }
    getBallots(status, isActive, createdBy) {
        const filters = {};
        if (status)
            filters.status = status;
        if (isActive !== undefined)
            filters.isActive = isActive === 'true';
        if (createdBy)
            filters.createdBy = createdBy;
        return this.ballotService.getBallots(filters);
    }
    getAvailableBallots(req) {
        return this.ballotService.getAvailableBallotsForUser(req.user.id);
    }
    getUpcomingBallots(req) {
        return this.ballotService.getUpcomingBallotsForUser(req.user.id);
    }
    getUserBallotHistoryFromAuth(req) {
        return this.ballotService.getUserBallotHistory(req.user.id);
    }
    castBallotVote(voteData, req) {
        return this.ballotService.castBallotVote(voteData, req.user.id);
    }
    getBallotById(id) {
        return this.ballotService.getBallotById(id);
    }
    updateBallot(id, updateBallotDto, req) {
        return this.ballotService.updateBallot(id, updateBallotDto, req.user.id);
    }
    deleteBallot(id, req) {
        return this.ballotService.deleteBallot(id, req.user.id);
    }
    activateBallot(id, req) {
        return this.ballotService.activateBallot(id, req.user.id);
    }
    pauseBallot(id, req) {
        return this.ballotService.pauseBallot(id, req.user.id);
    }
    endBallot(id, req) {
        return this.ballotService.endBallot(id, req.user.id);
    }
    getAvailableBallotsForUser(userId) {
        return this.ballotService.getAvailableBallotsForUser(userId);
    }
    getUserBallotHistory(userId) {
        return this.ballotService.getUserBallotHistory(userId);
    }
    bulkActivateBallots(ballotIds, req) {
        return this.ballotService.bulkActivateBallots(ballotIds, req.user.id);
    }
    bulkPauseBallots(ballotIds, req) {
        return this.ballotService.bulkPauseBallots(ballotIds, req.user.id);
    }
    bulkEndBallots(ballotIds, req) {
        return this.ballotService.bulkEndBallots(ballotIds, req.user.id);
    }
    bulkDeleteBallots(ballotIds, req) {
        return this.ballotService.bulkDeleteBallots(ballotIds, req.user.id);
    }
    bulkUpdateBallotStatus(ballotIds, status, req) {
        return this.ballotService.bulkUpdateBallotStatus(ballotIds, status, req.user.id);
    }
};
exports.BallotController = BallotController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ballot_dto_1.CreateBallotDto, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "createBallot", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('isActive')),
    __param(2, (0, common_1.Query)('createdBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "getBallots", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "getAvailableBallots", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "getUpcomingBallots", null);
__decorate([
    (0, common_1.Get)('user-history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "getUserBallotHistoryFromAuth", null);
__decorate([
    (0, common_1.Post)('cast-vote'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "castBallotVote", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "getBallotById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ballot_dto_1.UpdateBallotDto, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "updateBallot", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "deleteBallot", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "activateBallot", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "pauseBallot", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "endBallot", null);
__decorate([
    (0, common_1.Get)('available/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "getAvailableBallotsForUser", null);
__decorate([
    (0, common_1.Get)('history/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "getUserBallotHistory", null);
__decorate([
    (0, common_1.Post)('bulk/activate'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Body)('ballotIds')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "bulkActivateBallots", null);
__decorate([
    (0, common_1.Post)('bulk/pause'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Body)('ballotIds')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "bulkPauseBallots", null);
__decorate([
    (0, common_1.Post)('bulk/end'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Body)('ballotIds')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "bulkEndBallots", null);
__decorate([
    (0, common_1.Post)('bulk/delete'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Body)('ballotIds')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "bulkDeleteBallots", null);
__decorate([
    (0, common_1.Post)('bulk/update-status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Body)('ballotIds')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Object]),
    __metadata("design:returntype", void 0)
], BallotController.prototype, "bulkUpdateBallotStatus", null);
exports.BallotController = BallotController = __decorate([
    (0, common_1.Controller)('ballots'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ballot_service_1.BallotService])
], BallotController);
//# sourceMappingURL=ballot.controller.js.map