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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const audit_service_1 = require("../services/audit.service");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getAllAuditLogs() {
        try {
            const auditLogs = await this.auditService.getAllAuditLogs();
            return {
                success: true,
                message: 'Audit logs retrieved successfully',
                data: auditLogs,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to retrieve audit logs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyVoteIntegrity(voteId) {
        try {
            const result = await this.auditService.verifyVoteIntegrity(voteId);
            return {
                success: true,
                message: 'Vote integrity verification completed',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to verify vote integrity', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getVoteAuditTrail(voteId) {
        try {
            const auditTrail = await this.auditService.getVoteAuditTrail(voteId);
            return {
                success: true,
                message: 'Vote audit trail retrieved',
                data: {
                    voteId,
                    auditTrail,
                    eventCount: auditTrail.length,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to retrieve vote audit trail', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getElectionAuditReport(electionId) {
        try {
            const report = await this.auditService.getElectionAuditReport(electionId);
            return {
                success: true,
                message: 'Election audit report generated',
                data: report,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to generate election audit report', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getVoterHistory(voterId) {
        try {
            const history = await this.auditService.getVoterHistory(voterId);
            return {
                success: true,
                message: 'Voter history retrieved',
                data: history,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to retrieve voter history', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSecurityAlerts(electionId) {
        try {
            const alerts = await this.auditService.detectSuspiciousPatterns(electionId);
            return {
                success: true,
                message: 'Security alerts retrieved',
                data: {
                    electionId,
                    alerts,
                    alertCount: alerts.length,
                    criticalAlerts: alerts.filter(alert => alert.severity === 'CRITICAL').length,
                    highAlerts: alerts.filter(alert => alert.severity === 'HIGH').length,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to retrieve security alerts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async exportAuditData(electionId) {
        try {
            const exportData = await this.auditService.exportAuditData(electionId);
            return {
                success: true,
                message: 'Audit data exported successfully',
                data: exportData,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to export audit data', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyVoteByCode(verificationCode) {
        try {
            const vote = await this.auditService['prisma'].vote.findFirst({
                where: { verificationCode },
                include: {
                    voter: true,
                    candidate: true,
                    ballot: true,
                    position: true,
                },
            });
            if (!vote) {
                return {
                    success: false,
                    message: 'Vote not found with this verification code',
                    data: null,
                };
            }
            const integrityResult = await this.auditService.verifyVoteIntegrity(vote.id);
            return {
                success: true,
                message: 'Vote verification completed',
                data: {
                    voteId: vote.id,
                    verificationCode: vote.verificationCode,
                    voterName: vote.voter.Voter_Name,
                    candidateName: vote.candidate.Candidate_Name,
                    ballotTitle: vote.ballot.Ballot_Title,
                    positionTitle: vote.position.Position_Title,
                    timestamp: vote.createdAt,
                    integrityVerified: integrityResult.verified,
                    auditTrail: integrityResult.auditTrail,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to verify vote by code', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getComplianceStatus(electionId) {
        try {
            const report = await this.auditService.getElectionAuditReport(electionId);
            const complianceStatus = {
                electionId,
                integrityScore: report.integrityScore,
                complianceStatus: report.complianceStatus,
                totalVotes: report.totalVotes,
                verifiedVotes: report.verifiedVotes,
                disputedVotes: report.disputedVotes,
                securityAlerts: report.securityAlerts.length,
                criticalAlerts: report.securityAlerts.filter(alert => alert.severity === 'CRITICAL').length,
                recommendations: this.generateComplianceRecommendations(report),
            };
            return {
                success: true,
                message: 'Compliance status retrieved',
                data: complianceStatus,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to retrieve compliance status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    generateComplianceRecommendations(report) {
        const recommendations = [];
        if (report.integrityScore < 95) {
            recommendations.push('Review disputed votes to ensure election integrity');
        }
        if (report.securityAlerts.some(alert => alert.severity === 'CRITICAL')) {
            recommendations.push('Investigate critical security alerts immediately');
        }
        if (report.securityAlerts.some(alert => alert.severity === 'HIGH')) {
            recommendations.push('Review high-severity security alerts');
        }
        if (report.disputedVotes > 0) {
            recommendations.push('Audit disputed votes to verify their legitimacy');
        }
        if (report.integrityScore >= 95 && report.securityAlerts.length === 0) {
            recommendations.push('Election appears to be compliant with security standards');
        }
        return recommendations;
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all audit logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all audit logs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAllAuditLogs", null);
__decorate([
    (0, common_1.Get)('verify-vote/:voteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify vote integrity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote verification result' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vote not found' }),
    __param(0, (0, common_1.Param)('voteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "verifyVoteIntegrity", null);
__decorate([
    (0, common_1.Get)('vote-trail/:voteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete audit trail for a vote' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote audit trail' }),
    __param(0, (0, common_1.Param)('voteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getVoteAuditTrail", null);
__decorate([
    (0, common_1.Get)('election-report/:electionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive audit report for an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election audit report' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getElectionAuditReport", null);
__decorate([
    (0, common_1.Get)('voter-history/:voterId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete voting history for a voter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter history' }),
    __param(0, (0, common_1.Param)('voterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getVoterHistory", null);
__decorate([
    (0, common_1.Get)('security-alerts/:electionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get security alerts for an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security alerts' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getSecurityAlerts", null);
__decorate([
    (0, common_1.Get)('export/:electionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Export audit data for compliance reporting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit data export' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "exportAuditData", null);
__decorate([
    (0, common_1.Get)('verification-code/:verificationCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify vote using verification code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote verification result' }),
    __param(0, (0, common_1.Param)('verificationCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "verifyVoteByCode", null);
__decorate([
    (0, common_1.Get)('compliance-status/:electionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance status for an election' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance status' }),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getComplianceStatus", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Audit & Security'),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map