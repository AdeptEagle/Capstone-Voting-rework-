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
    async getAllBallotAssignments(ballotId, candidateId) {
        return this.electionAssignmentService.getAllElectionAssignments(ballotId, candidateId);
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
    async getCandidatesForBallot(ballotId) {
        return this.electionAssignmentService.getCandidatesForElection(ballotId);
    }
    async getBallotsForCandidate(candidateId) {
        return this.electionAssignmentService.getElectionsForCandidate(candidateId);
    }
    async bulkAssignCandidates(assignments) {
        return this.electionAssignmentService.bulkAssignCandidates(assignments);
    }
    async removeCandidateFromBallot(ballotId, candidateId) {
        return this.electionAssignmentService.removeCandidateFromElection(ballotId, candidateId);
    }
    async getBallotPositions(ballotId) {
        return this.electionAssignmentService.getElectionPositions(ballotId);
    }
    async getUnassignedPositions(ballotId) {
        return this.electionAssignmentService.getUnassignedPositions(ballotId);
    }
    async getPositionAssignmentStatus(ballotId) {
        return this.electionAssignmentService.getPositionAssignmentStatus(ballotId);
    }
    async assignPositionToBallot(ballotId, positionId) {
        return this.electionAssignmentService.assignPositionToElection(ballotId, positionId);
    }
    async removePositionFromBallot(ballotId, positionId) {
        return this.electionAssignmentService.removePositionFromElection(ballotId, positionId);
    }
    async getUnassignedCandidates(ballotId) {
        return this.electionAssignmentService.getUnassignedCandidates(ballotId);
    }
    async getCandidateAssignmentStatus(ballotId) {
        return this.electionAssignmentService.getCandidateAssignmentStatus(ballotId);
    }
    async assignCandidateToBallot(ballotId, candidateId) {
        return this.electionAssignmentService.assignCandidateToElection(ballotId, candidateId);
    }
    async getBallotDetails(ballotId) {
        return this.electionAssignmentService.getElectionBallot(ballotId);
    }
};
exports.ElectionAssignmentController = ElectionAssignmentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ballot assignments' }),
    (0, swagger_1.ApiQuery)({ name: 'ballotId', required: false, description: 'Filter by ballot ID' }),
    (0, swagger_1.ApiQuery)({ name: 'candidateId', required: false, description: 'Filter by candidate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all ballot assignments' }),
    __param(0, (0, common_1.Query)('ballotId')),
    __param(1, (0, common_1.Query)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getAllBallotAssignments", null);
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
    (0, common_1.Get)('ballot/:ballotId/candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all candidates for a specific ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidates for ballot retrieved successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getCandidatesForBallot", null);
__decorate([
    (0, common_1.Get)('candidate/:candidateId/ballots'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ballots for a specific candidate' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ballots for candidate retrieved successfully' }),
    __param(0, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getBallotsForCandidate", null);
__decorate([
    (0, common_1.Post)('bulk-assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk assign candidates to ballots' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk assignment completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "bulkAssignCandidates", null);
__decorate([
    (0, common_1.Delete)('ballot/:ballotId/candidate/:candidateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove candidate from ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate removed from ballot successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __param(1, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "removeCandidateFromBallot", null);
__decorate([
    (0, common_1.Get)('ballot/:ballotId/positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all positions assigned to a ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ballot positions retrieved successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getBallotPositions", null);
__decorate([
    (0, common_1.Get)('ballot/:ballotId/unassigned-positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all positions NOT assigned to a ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unassigned positions retrieved successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getUnassignedPositions", null);
__decorate([
    (0, common_1.Get)('ballot/:ballotId/position-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignment status for positions in a ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position assignment status retrieved successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getPositionAssignmentStatus", null);
__decorate([
    (0, common_1.Post)('ballot/:ballotId/assign-position/:positionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a position to a ballot' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Position assigned to ballot successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __param(1, (0, common_1.Param)('positionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "assignPositionToBallot", null);
__decorate([
    (0, common_1.Delete)('ballot/:ballotId/position/:positionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove position from ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position removed from ballot successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __param(1, (0, common_1.Param)('positionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "removePositionFromBallot", null);
__decorate([
    (0, common_1.Get)('ballot/:ballotId/unassigned-candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all candidates NOT assigned to a ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unassigned candidates retrieved successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getUnassignedCandidates", null);
__decorate([
    (0, common_1.Get)('ballot/:ballotId/candidate-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assignment status for candidates in a ballot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate assignment status retrieved successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getCandidateAssignmentStatus", null);
__decorate([
    (0, common_1.Post)('ballot/:ballotId/assign-candidate/:candidateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a candidate to a ballot' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidate assigned to ballot successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __param(1, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "assignCandidateToBallot", null);
__decorate([
    (0, common_1.Get)('ballot/:ballotId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete ballot details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ballot retrieved successfully' }),
    __param(0, (0, common_1.Param)('ballotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElectionAssignmentController.prototype, "getBallotDetails", null);
exports.ElectionAssignmentController = ElectionAssignmentController = __decorate([
    (0, swagger_1.ApiTags)('Ballot Assignment'),
    (0, common_1.Controller)('ballot-assignments'),
    __metadata("design:paramtypes", [election_assignment_service_1.ElectionAssignmentService])
], ElectionAssignmentController);
//# sourceMappingURL=election-assignment.controller.js.map