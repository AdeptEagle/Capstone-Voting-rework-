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
exports.VoteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vote_service_1 = require("./vote.service");
const dto_1 = require("./dto");
let VoteController = class VoteController {
    constructor(voteService) {
        this.voteService = voteService;
    }
    async getAllVotes() {
        return this.voteService.getAllVotes();
    }
    async createVote(createVoteDto) {
        return this.voteService.createVote(createVoteDto);
    }
    async confirmVote(createVoteDto) {
        return this.voteService.confirmVote(createVoteDto);
    }
    async getActiveElectionResults() {
        return this.voteService.getActiveElectionResults();
    }
    async getRealTimeStats() {
        return this.voteService.getRealTimeStats();
    }
    async getVoteTimeline() {
        return this.voteService.getVoteTimeline();
    }
    async getVoterVotingStatus(voterId, electionId) {
        return this.voteService.getVoterVotingStatus(voterId, electionId);
    }
    async getVotesByElection(electionId) {
        return this.voteService.getVotesByElection(electionId);
    }
    async getVotesByVoter(voterId) {
        return this.voteService.getVotesByVoter(voterId);
    }
    async getVoteResults(electionId) {
        return this.voteService.getVoteResults(electionId);
    }
    async getComprehensiveVoteAnalytics(electionId) {
        return this.voteService.getComprehensiveVoteAnalytics(electionId);
    }
    async getDepartmentVotingResults(electionId) {
        return this.voteService.getDepartmentVotingResults(electionId);
    }
    async getVoteById(id) {
        return this.voteService.getVoteById(id);
    }
    async deleteVote(id) {
        return this.voteService.deleteVote(id);
    }
    async resetVoterStatus(voterId) {
        return this.voteService.resetVoterStatus(voterId);
    }
};
exports.VoteController = VoteController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all votes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all votes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getAllVotes", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cast a vote' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vote cast successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Voter has already voted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid vote data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateVoteDto]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "createVote", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm vote before casting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote confirmation details' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Voter has already voted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid vote data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateVoteDto]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "confirmVote", null);
__decorate([
    (0, common_1.Get)('active-results'),
    (0, swagger_1.ApiOperation)({ summary: 'Get results for currently active elections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active election results' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getActiveElectionResults", null);
__decorate([
    (0, common_1.Get)('real-time-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time voting statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Real-time voting statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getRealTimeStats", null);
__decorate([
    (0, common_1.Get)('vote-timeline'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vote timeline for the last 24 hours' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote timeline data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVoteTimeline", null);
__decorate([
    (0, common_1.Get)('voter/:voterId/election/:electionId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voter voting status and lockout information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter voting status' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter or election not found' }),
    __param(0, (0, common_1.Param)('voterId')),
    __param(1, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVoterVotingStatus", null);
__decorate([
    (0, common_1.Get)('election/:electionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get votes by election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Votes for election' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVotesByElection", null);
__decorate([
    (0, common_1.Get)('voter/:voterId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get votes by voter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Votes by voter' }),
    __param(0, (0, common_1.Param)('voterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVotesByVoter", null);
__decorate([
    (0, common_1.Get)('results/:electionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vote results for election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote results' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVoteResults", null);
__decorate([
    (0, common_1.Get)('analytics/:electionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive vote analytics for election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comprehensive vote analytics' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getComprehensiveVoteAnalytics", null);
__decorate([
    (0, common_1.Get)('results/:electionId/departments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get department-based voting results for election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department-based voting results' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getDepartmentVotingResults", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vote by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vote not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVoteById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete vote' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vote not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "deleteVote", null);
__decorate([
    (0, common_1.Put)('reset-voter/:voterId'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset voter voting status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter status reset successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Voter not found' }),
    __param(0, (0, common_1.Param)('voterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "resetVoterStatus", null);
exports.VoteController = VoteController = __decorate([
    (0, swagger_1.ApiTags)('Vote'),
    (0, common_1.Controller)('votes'),
    __metadata("design:paramtypes", [vote_service_1.VoteService])
], VoteController);
//# sourceMappingURL=vote.controller.js.map