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
exports.ElectionAssignmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const election_assignment_service_1 = require("./election-assignment.service");
const dto_1 = require("./dto");
let ElectionAssignmentController = class ElectionAssignmentController {
    constructor(electionAssignmentService) {
        this.electionAssignmentService = electionAssignmentService;
    }
    async getAllElectionAssignments(electionId, candidateId) {
        return this.electionAssignmentService.getAllElectionAssignments(electionId, candidateId);
    }
    async createElectionAssignment(createElectionAssignmentDto) {
        return this.electionAssignmentService.createElectionAssignment(createElectionAssignmentDto);
    }
    async getElectionAssignmentById(id) {
        return this.electionAssignmentService.getElectionAssignmentById(id);
    }
    async updateElectionAssignment(id, updateElectionAssignmentDto) {
        return this.electionAssignmentService.updateElectionAssignment(id, updateElectionAssignmentDto);
    }
    async deleteElectionAssignment(id) {
        return this.electionAssignmentService.deleteElectionAssignment(id);
    }
    async getCandidatesForElection(electionId) {
        return this.electionAssignmentService.getCandidatesForElection(electionId);
    }
    async getElectionsForCandidate(candidateId) {
        return this.electionAssignmentService.getElectionsForCandidate(candidateId);
    }
    async bulkAssignCandidates(assignments) {
        return this.electionAssignmentService.bulkAssignCandidates(assignments);
    }
    async removeCandidateFromElection(electionId, candidateId) {
        return this.electionAssignmentService.removeCandidateFromElection(electionId, candidateId);
    }
    async getElectionPositions(electionId) {
        return this.electionAssignmentService.getElectionPositions(electionId);
    }
    async getUnassignedPositions(electionId) {
        return this.electionAssignmentService.getUnassignedPositions(electionId);
    }
    async getPositionAssignmentStatus(electionId) {
        return this.electionAssignmentService.getPositionAssignmentStatus(electionId);
    }
    async assignPositionToElection(electionId, positionId) {
        return this.electionAssignmentService.assignPositionToElection(electionId, positionId);
    }
    async removePositionFromElection(electionId, positionId) {
        return this.electionAssignmentService.removePositionFromElection(electionId, positionId);
    }
    async getUnassignedCandidates(electionId) {
        return this.electionAssignmentService.getUnassignedCandidates(electionId);
    }
    async getCandidateAssignmentStatus(electionId) {
        return this.electionAssignmentService.getCandidateAssignmentStatus(electionId);
    }
    async assignCandidateToElection(electionId, candidateId) {
        return this.electionAssignmentService.assignCandidateToElection(electionId, candidateId);
    }
    async getElectionBallot(electionId) {
        return this.electionAssignmentService.getElectionBallot(electionId);
    }
};
exports.ElectionAssignmentController = ElectionAssignmentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all election assignments' }),
    (0, swagger_1.ApiQuery)({ name: 'electionId', required: false, description: 'Filter by election ID' }),
    (0, swagger_1.ApiQuery)({ name: 'candidateId', required: false, description: 'Filter by candidate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all election assignments' }),
    __param(0, (0, common_1.Query)('electionId')),
    __param(1, (0, common_1.Query)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getAllElectionAssignments", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new election assignment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Election assignment created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateElectionAssignmentDto]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "createElectionAssignment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get election assignment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election assignment found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election assignment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getElectionAssignmentById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update election assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election assignment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election assignment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateElectionAssignmentDto]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "updateElectionAssignment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete election assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election assignment deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election assignment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "deleteElectionAssignment", null);
__decorate([
    (0, common_1.Get)('election/:electionId/candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all candidates for a specific election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidates for election retrieved successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getCandidatesForElection", null);
__decorate([
    (0, common_1.Get)('candidate/:candidateId/elections'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all elections for a specific candidate' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Elections for candidate retrieved successfully' }),
    __param(0, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getElectionsForCandidate", null);
__decorate([
    (0, common_1.Post)('bulk-assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk assign candidates to elections' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk assignment completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "bulkAssignCandidates", null);
__decorate([
    (0, common_1.Delete)('election/:electionId/candidate/:candidateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove candidate from election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate removed from election successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __param(1, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "removeCandidateFromElection", null);
__decorate([
    (0, common_1.Get)('election/:electionId/positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all positions assigned to an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election positions retrieved successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getElectionPositions", null);
__decorate([
    (0, common_1.Get)('election/:electionId/unassigned-positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all positions NOT assigned to an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unassigned positions retrieved successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getUnassignedPositions", null);
__decorate([
    (0, common_1.Get)('election/:electionId/position-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignment status for positions in an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position assignment status retrieved successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getPositionAssignmentStatus", null);
__decorate([
    (0, common_1.Post)('election/:electionId/assign-position/:positionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a position to an election' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Position assigned to election successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __param(1, (0, common_1.Param)('positionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "assignPositionToElection", null);
__decorate([
    (0, common_1.Delete)('election/:electionId/position/:positionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove position from election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position removed from election successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __param(1, (0, common_1.Param)('positionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "removePositionFromElection", null);
__decorate([
    (0, common_1.Get)('election/:electionId/unassigned-candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all candidates NOT assigned to an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unassigned candidates retrieved successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getUnassignedCandidates", null);
__decorate([
    (0, common_1.Get)('election/:electionId/candidate-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignment status for candidates in an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate assignment status retrieved successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getCandidateAssignmentStatus", null);
__decorate([
    (0, common_1.Post)('election/:electionId/assign-candidate/:candidateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a candidate to an election' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidate assigned to election successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __param(1, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "assignCandidateToElection", null);
__decorate([
    (0, common_1.Get)('election/:electionId/ballot'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete ballot for an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ballot retrieved successfully' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getElectionBallot", null);
exports.ElectionAssignmentController = ElectionAssignmentController = __decorate([
    (0, swagger_1.ApiTags)('Election Assignment'),
    (0, common_1.Controller)('election-assignments'),
    __metadata("design:paramtypes", [election_assignment_service_1.ElectionAssignmentService])
], ElectionAssignmentController);
//# sourceMappingURL=election-assignment.controller.js.map