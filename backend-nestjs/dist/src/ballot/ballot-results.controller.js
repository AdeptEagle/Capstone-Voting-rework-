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
exports.BallotResultsController = void 0;
const common_1 = require("@nestjs/common");
const ballot_results_service_1 = require("./ballot-results.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let BallotResultsController = class BallotResultsController {
    constructor(ballotResultsService) {
        this.ballotResultsService = ballotResultsService;
    }
    getBallotsWithResults(req) {
        return this.ballotResultsService.getBallotsWithResults(req.user.id);
    }
    getBallotResults(id) {
        return this.ballotResultsService.getBallotResults(id);
    }
    getLiveBallotResults(id) {
        return this.ballotResultsService.getLiveBallotResults(id);
    }
    refreshBallotResults(id) {
        return this.ballotResultsService.refreshBallotResults(id);
    }
    getPartylistResults(id) {
        return this.ballotResultsService.getPartylistResults(id);
    }
    getBallotAnalytics(id) {
        return this.ballotResultsService.getBallotAnalytics(id);
    }
};
exports.BallotResultsController = BallotResultsController;
__decorate([
    (0, common_1.Get)('results'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BallotResultsController.prototype, "getBallotsWithResults", null);
__decorate([
    (0, common_1.Get)(':id/results'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotResultsController.prototype, "getBallotResults", null);
__decorate([
    (0, common_1.Get)(':id/results/live'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotResultsController.prototype, "getLiveBallotResults", null);
__decorate([
    (0, common_1.Post)(':id/results/refresh'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotResultsController.prototype, "refreshBallotResults", null);
__decorate([
    (0, common_1.Get)(':id/results/partylist'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotResultsController.prototype, "getPartylistResults", null);
__decorate([
    (0, common_1.Get)(':id/results/analytics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BallotResultsController.prototype, "getBallotAnalytics", null);
exports.BallotResultsController = BallotResultsController = __decorate([
    (0, common_1.Controller)('ballots'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ballot_results_service_1.BallotResultsService])
], BallotResultsController);
//# sourceMappingURL=ballot-results.controller.js.map