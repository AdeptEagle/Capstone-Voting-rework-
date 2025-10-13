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
exports.ElectionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const election_service_1 = require("./election.service");
const dto_1 = require("./dto");
const prisma_service_1 = require("../prisma/prisma.service");
let ElectionController = class ElectionController {
    constructor(electionService, prisma) {
        this.electionService = electionService;
        this.prisma = prisma;
    }
    async getAllElections() {
        console.warn('⚠️ DEPRECATED: Election endpoints are deprecated. Use ballot system instead.');
        return this.electionService.getAllElections();
    }
    async getElectionHistory() {
        return this.electionService.getElectionHistory();
    }
    async createElection(createElectionDto, req) {
        try {
            const superadmin = await this.prisma.admin.findFirst({
                where: { role: 'SUPERADMIN' },
                select: { id: true, Admin_Username: true, role: true }
            });
            if (!superadmin) {
                throw new common_1.HttpException('No superadmin found in the system. Please create a superadmin first.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(`🔧 [ElectionController] Using superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
            return this.electionService.createElection(createElectionDto, superadmin.id);
        }
        catch (error) {
            console.error('❌ [ElectionController] Error creating election:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create election. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getElectionById(id) {
        return this.electionService.getElectionById(id);
    }
    async updateElection(id, updateElectionDto) {
        return this.electionService.updateElection(id, updateElectionDto);
    }
    async deleteElection(id) {
        return this.electionService.deleteElection(id);
    }
    async getDeletedElections() {
        return this.electionService.getDeletedElections();
    }
    async restoreElection(id) {
        return this.electionService.restoreElection(id);
    }
    async permanentlyDeleteElection(id) {
        return this.electionService.permanentlyDeleteElection(id);
    }
    async activateElection(id) {
        return this.electionService.activateElection(id);
    }
    async deactivateElection(id) {
        return this.electionService.deactivateElection(id);
    }
    async checkAndAutoEndElections() {
        return this.electionService.checkAndAutoEndElections();
    }
    async getElectionTimeStatus(id) {
        return this.electionService.getElectionTimeStatus(id);
    }
    async scheduleAutoEndCheck() {
        return this.electionService.scheduleAutoEndCheck();
    }
    async addPositionToElection(id, addPositionDto) {
        return this.electionService.addPositionToElection(id, addPositionDto);
    }
    async addCandidateToElection(id, addCandidateDto) {
        return this.electionService.addCandidateToElection(id, addCandidateDto);
    }
    async removePositionFromElection(id, positionId) {
        return this.electionService.removePositionFromElection(id, positionId);
    }
    async removeCandidateFromElection(id, candidateId) {
        return this.electionService.removeCandidateFromElection(id, candidateId);
    }
};
exports.ElectionController = ElectionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all elections (DEPRECATED - Use ballot system instead)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all elections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "getAllElections", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get election history - comprehensive data for ended elections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election history retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "getElectionHistory", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new election' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Election created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Election already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateElectionDto, Object]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "createElection", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get election by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "getElectionById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateElectionDto]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "updateElection", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete election (soft delete - moves to trash)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election moved to trash successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "deleteElection", null);
__decorate([
    (0, common_1.Get)('trash/deleted'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted elections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of deleted elections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "getDeletedElections", null);
__decorate([
    (0, common_1.Post)('trash/restore/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "restoreElection", null);
__decorate([
    (0, common_1.Delete)('trash/permanent/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete election (cannot be undone)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete election with voting history' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "permanentlyDeleteElection", null);
__decorate([
    (0, common_1.Put)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "activateElection", null);
__decorate([
    (0, common_1.Put)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "deactivateElection", null);
__decorate([
    (0, common_1.Post)('auto-end-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check and auto-end expired elections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Auto-end check completed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "checkAndAutoEndElections", null);
__decorate([
    (0, common_1.Get)(':id/time-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get election time status and voting window information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Time status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "getElectionTimeStatus", null);
__decorate([
    (0, common_1.Post)('schedule-auto-end'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule automatic end check (for cron jobs)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Auto-end check scheduled successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "scheduleAutoEndCheck", null);
__decorate([
    (0, common_1.Post)(':id/positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Add position to election' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Position added to election successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election or position not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Position already added to election' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddPositionDto]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "addPositionToElection", null);
__decorate([
    (0, common_1.Post)(':id/candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Add candidate to election' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidate added to election successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election or candidate not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Candidate already added to election' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddCandidateDto]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "addCandidateToElection", null);
__decorate([
    (0, common_1.Delete)(':id/positions/:positionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove position from election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position removed from election successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found in election' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('positionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "removePositionFromElection", null);
__decorate([
    (0, common_1.Delete)(':id/candidates/:candidateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove candidate from election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate removed from election successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found in election' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionController.prototype, "removeCandidateFromElection", null);
exports.ElectionController = ElectionController = __decorate([
    (0, swagger_1.ApiTags)('Election'),
    (0, common_1.Controller)('elections'),
    __metadata("design:paramtypes", [election_service_1.ElectionService,
        prisma_service_1.PrismaService])
], ElectionController);
//# sourceMappingURL=election.controller.js.map