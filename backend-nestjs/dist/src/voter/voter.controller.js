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
exports.VoterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const voter_service_1 = require("./voter.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let VoterController = class VoterController {
    constructor(voterService) {
        this.voterService = voterService;
    }
    async getAllVoters() {
        return this.voterService.getAllVoters();
    }
    async createVoter(createVoterDto) {
        return this.voterService.createVoter(createVoterDto);
    }
    async getVoterById(id) {
        return this.voterService.getVoterById(id);
    }
    async getVoterByStudentId(studentId) {
        return this.voterService.getVoterByStudentId(studentId);
    }
    async updateVoter(id, updateVoterDto) {
        return this.voterService.updateVoter(id, updateVoterDto);
    }
    async deleteVoter(id) {
        return this.voterService.deleteVoter(id);
    }
    async markVoterAsVoted(id) {
        return this.voterService.markVoterAsVoted(id);
    }
    async resetVoterVoteStatus(id) {
        return this.voterService.resetVoterVoteStatus(id);
    }
    async getVoterPassword(id) {
        return this.voterService.getVoterPassword(id);
    }
    async resetVoterPassword(id) {
        return this.voterService.resetVoterPassword(id);
    }
    async getVoterHistory(id) {
        return this.voterService.getVoterHistory(id);
    }
    async getVoterBallotHistory(id) {
        return this.voterService.getVoterBallotHistory(id);
    }
    async getVoterVotingDetails(id) {
        return this.voterService.getVoterVotingDetails(id);
    }
};
exports.VoterController = VoterController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all voters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all voters' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "getAllVoters", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new voter' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Voter created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Voter already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateVoterDto]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "createVoter", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voter by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "getVoterById", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voter by student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "getVoterByStudentId", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update voter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateVoterDto]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "updateVoter", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete voter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "deleteVoter", null);
__decorate([
    (0, common_1.Put)(':id/mark-voted'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark voter as voted' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter marked as voted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "markVoterAsVoted", null);
__decorate([
    (0, common_1.Put)(':id/reset-vote-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset voter vote status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter vote status reset' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "resetVoterVoteStatus", null);
__decorate([
    (0, common_1.Get)(':id/password'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voter password (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter password retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "getVoterPassword", null);
__decorate([
    (0, common_1.Put)(':id/reset-password'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset voter password to student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "resetVoterPassword", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed voter history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "getVoterHistory", null);
__decorate([
    (0, common_1.Get)(':id/ballot-history'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voter ballot participation history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ballot history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "getVoterBallotHistory", null);
__decorate([
    (0, common_1.Get)(':id/voting-details'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed voting information for a voter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voting details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoterController.prototype, "getVoterVotingDetails", null);
exports.VoterController = VoterController = __decorate([
    (0, swagger_1.ApiTags)('Voter'),
    (0, common_1.Controller)('voters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [voter_service_1.VoterService])
], VoterController);
//# sourceMappingURL=voter.controller.js.map