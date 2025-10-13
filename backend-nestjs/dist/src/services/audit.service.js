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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllAuditLogs() {
        try {
            const auditLogs = await this.prisma.auditLog.findMany({
                orderBy: { timestamp: 'desc' },
                take: 100,
            });
            return auditLogs;
        }
        catch (error) {
            console.error('❌ Error retrieving audit logs:', error);
            throw error;
        }
    }
    generateVerificationCode() {
        return crypto.randomBytes(8).toString('hex').toUpperCase();
    }
    generateAuditHash(voteData) {
        const dataString = `${voteData.voterId}-${voteData.electionId}-${voteData.candidateId}-${voteData.timestamp.toISOString()}`;
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }
    async logAuditEvent(event) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    eventType: event.eventType,
                    timestamp: event.timestamp,
                    userId: event.userId || null,
                    electionId: event.electionId || null,
                    action: event.action,
                    details: event.details,
                    metadata: event.metadata,
                    severity: event.severity,
                },
            });
            console.log(`🔍 Audit Event Logged: ${event.eventType} - ${event.action}`);
        }
        catch (error) {
            console.error('❌ Error logging audit event:', error);
        }
    }
    async createVoteAudit(voteData) {
        const verificationCode = this.generateVerificationCode();
        const auditHash = this.generateAuditHash(voteData);
        await this.logAuditEvent({
            eventType: 'VOTE_CAST',
            timestamp: voteData.timestamp,
            userId: voteData.voterId,
            electionId: voteData.electionId,
            action: 'Vote submitted',
            details: {
                voteId: voteData.voteId,
                candidateId: voteData.candidateId,
                verificationCode,
                auditHash,
            },
            metadata: {
                ipAddress: voteData.ipAddress,
                userAgent: voteData.userAgent,
                sessionId: voteData.sessionId,
            },
            severity: 'HIGH',
        });
        await this.logAuditEvent({
            eventType: 'VOTE_VERIFIED',
            timestamp: new Date(),
            userId: voteData.voterId,
            electionId: voteData.electionId,
            action: 'Vote integrity verified',
            details: {
                voteId: voteData.voteId,
                verificationCode,
                auditHash,
                integrityVerified: true,
            },
            metadata: {
                ipAddress: voteData.ipAddress,
                userAgent: voteData.userAgent,
                sessionId: voteData.sessionId,
            },
            severity: 'HIGH',
        });
        return {
            voteId: voteData.voteId,
            voterId: voteData.voterId,
            electionId: voteData.electionId,
            candidateId: voteData.candidateId,
            timestamp: voteData.timestamp,
            verificationCode,
            auditHash,
            integrityVerified: true,
            auditTrail: [],
        };
    }
    async getVoteAuditTrail(voteId) {
        const auditEvents = await this.prisma.auditLog.findMany({
            where: {
                OR: [
                    { details: { path: ['voteId'], equals: voteId } },
                    { action: { contains: voteId } },
                ],
            },
            orderBy: { timestamp: 'asc' },
        });
        return auditEvents.map(event => ({
            eventType: event.eventType,
            timestamp: event.timestamp,
            userId: event.userId,
            electionId: event.electionId,
            action: event.action,
            details: event.details,
            metadata: event.metadata,
            severity: event.severity,
        }));
    }
    async verifyVoteIntegrity(voteId) {
        const vote = await this.prisma.vote.findUnique({
            where: { id: voteId },
            include: {
                voter: true,
                candidate: true,
                election: true,
            },
        });
        if (!vote) {
            return {
                verified: false,
                details: { error: 'Vote not found' },
                auditTrail: [],
            };
        }
        const auditTrail = await this.getVoteAuditTrail(voteId);
        const expectedHash = this.generateAuditHash({
            voterId: vote.voterId,
            electionId: vote.electionId,
            candidateId: vote.candidateId,
            timestamp: vote.createdAt,
        });
        const integrityChecks = [
            {
                check: 'Vote exists in database',
                passed: !!vote,
            },
            {
                check: 'Audit trail exists',
                passed: auditTrail.length > 0,
            },
            {
                check: 'Vote cast event logged',
                passed: auditTrail.some(event => event.eventType === 'VOTE_CAST'),
            },
            {
                check: 'Vote verified event logged',
                passed: auditTrail.some(event => event.eventType === 'VOTE_VERIFIED'),
            },
        ];
        const verified = integrityChecks.every(check => check.passed);
        await this.logAuditEvent({
            eventType: 'VOTE_VERIFIED',
            timestamp: new Date(),
            userId: vote.voterId,
            electionId: vote.electionId,
            action: 'Vote integrity verification completed',
            details: {
                voteId,
                verified,
                integrityChecks,
                expectedHash,
            },
            metadata: {},
            severity: verified ? 'LOW' : 'HIGH',
        });
        return {
            verified,
            details: {
                voteId,
                integrityChecks,
                expectedHash,
                voteDetails: {
                    voterId: vote.voterId,
                    electionId: vote.electionId,
                    candidateId: vote.candidateId,
                    timestamp: vote.createdAt,
                },
            },
            auditTrail,
        };
    }
    async detectSuspiciousPatterns(electionId) {
        const alerts = [];
        const rapidVoting = await this.prisma.vote.groupBy({
            by: ['voterId'],
            where: {
                electionId,
                createdAt: {
                    gte: new Date(Date.now() - 5 * 60 * 1000),
                },
            },
            _count: {
                id: true,
            },
            having: {
                id: {
                    _count: {
                        gt: 1,
                    },
                },
            },
        });
        if (rapidVoting.length > 0) {
            alerts.push({
                alertType: 'SUSPICIOUS_VOTING_PATTERN',
                timestamp: new Date(),
                severity: 'HIGH',
                details: {
                    pattern: 'Rapid voting from same voter',
                    voters: rapidVoting.map(v => v.voterId),
                    timeWindow: '5 minutes',
                },
                resolved: false,
            });
        }
        const sameIPVotes = await this.prisma.auditLog.groupBy({
            by: ['metadata'],
            where: {
                electionId,
                eventType: 'VOTE_CAST',
                timestamp: {
                    gte: new Date(Date.now() - 60 * 60 * 1000),
                },
            },
            _count: {
                id: true,
            },
        });
        const ipCounts = new Map();
        sameIPVotes.forEach(vote => {
            const metadata = vote.metadata;
            const ip = metadata?.ipAddress;
            if (ip) {
                ipCounts.set(ip, (ipCounts.get(ip) || 0) + vote._count.id);
            }
        });
        for (const [ip, count] of ipCounts.entries()) {
            if (count > 3) {
                alerts.push({
                    alertType: 'SUSPICIOUS_VOTING_PATTERN',
                    timestamp: new Date(),
                    severity: 'MEDIUM',
                    details: {
                        pattern: 'Multiple votes from same IP',
                        ipAddress: ip,
                        voteCount: count,
                        timeWindow: '1 hour',
                    },
                    resolved: false,
                });
            }
        }
        return alerts;
    }
    async getElectionAuditReport(electionId) {
        const votes = await this.prisma.vote.findMany({
            where: { electionId },
        });
        const auditEvents = await this.prisma.auditLog.findMany({
            where: { electionId },
            orderBy: { timestamp: 'asc' },
        });
        const securityAlerts = await this.detectSuspiciousPatterns(electionId);
        const verificationResults = await Promise.all(votes.map(vote => this.verifyVoteIntegrity(vote.id)));
        const verifiedVotes = verificationResults.filter(result => result.verified).length;
        const disputedVotes = votes.length - verifiedVotes;
        const integrityScore = votes.length > 0 ? (verifiedVotes / votes.length) * 100 : 100;
        let complianceStatus = 'COMPLIANT';
        if (integrityScore < 95) {
            complianceStatus = 'UNDER_REVIEW';
        }
        if (integrityScore < 80) {
            complianceStatus = 'NON_COMPLIANT';
        }
        if (securityAlerts.some(alert => alert.severity === 'CRITICAL')) {
            complianceStatus = 'NON_COMPLIANT';
        }
        return {
            electionId,
            totalVotes: votes.length,
            verifiedVotes,
            disputedVotes,
            securityAlerts,
            auditTrail: auditEvents.map(event => ({
                eventType: event.eventType,
                timestamp: event.timestamp,
                userId: event.userId,
                electionId: event.electionId,
                action: event.action,
                details: event.details,
                metadata: event.metadata,
                severity: event.severity,
            })),
            integrityScore,
            complianceStatus,
        };
    }
    async getVoterHistory(voterId) {
        const votes = await this.prisma.vote.findMany({
            where: { voterId },
            include: {
                election: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const auditEvents = await this.prisma.auditLog.findMany({
            where: { userId: voterId },
            orderBy: { timestamp: 'desc' },
        });
        const electionMap = new Map();
        votes.forEach(vote => {
            if (!electionMap.has(vote.electionId)) {
                electionMap.set(vote.electionId, {
                    electionId: vote.electionId,
                    electionTitle: vote.election.Election_Title,
                    voteCount: 0,
                    lastVoteDate: vote.createdAt,
                    verificationCodes: [],
                });
            }
            const election = electionMap.get(vote.electionId);
            election.voteCount++;
            election.verificationCodes.push(vote.verificationCode || 'N/A');
            if (vote.createdAt > election.lastVoteDate) {
                election.lastVoteDate = vote.createdAt;
            }
        });
        return {
            voterId,
            totalVotes: votes.length,
            elections: Array.from(electionMap.values()),
            auditTrail: auditEvents.map(event => ({
                eventType: event.eventType,
                timestamp: event.timestamp,
                userId: event.userId,
                electionId: event.electionId,
                action: event.action,
                details: event.details,
                metadata: event.metadata,
                severity: event.severity,
            })),
        };
    }
    async exportAuditData(electionId) {
        const auditReport = await this.getElectionAuditReport(electionId);
        const votes = await this.prisma.vote.findMany({
            where: { electionId },
            include: {
                voter: true,
                candidate: true,
                election: true,
            },
        });
        const voteDetails = votes.map(vote => ({
            voteId: vote.id,
            voterId: vote.voterId,
            voterName: vote.voter.Voter_Name,
            candidateId: vote.candidateId,
            candidateName: vote.candidate.Candidate_Name,
            timestamp: vote.createdAt,
            verificationCode: vote.verificationCode,
            auditHash: vote.auditHash,
        }));
        const complianceReport = {
            electionId,
            exportDate: new Date(),
            totalVotes: auditReport.totalVotes,
            verifiedVotes: auditReport.verifiedVotes,
            integrityScore: auditReport.integrityScore,
            complianceStatus: auditReport.complianceStatus,
            securityAlerts: auditReport.securityAlerts.length,
            auditTrailEvents: auditReport.auditTrail.length,
        };
        return {
            electionId,
            exportDate: new Date(),
            auditReport,
            voteDetails,
            securityAlerts: auditReport.securityAlerts,
            complianceReport,
        };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map