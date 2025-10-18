import { PrismaService } from '../prisma/prisma.service';
export interface AuditEvent {
    eventType: 'VOTE_CAST' | 'VOTE_VERIFIED' | 'VOTE_DISPUTED' | 'LOGIN_ATTEMPT' | 'SECURITY_ALERT' | 'ELECTION_START' | 'ELECTION_END' | 'ADMIN_ACTION';
    timestamp: Date;
    userId?: string;
    electionId?: string;
    action: string;
    details: Record<string, any>;
    metadata: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
        location?: string;
    };
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface VoteAudit {
    voteId: string;
    voterId: string;
    ballotId: string;
    candidateId: string;
    timestamp: Date;
    verificationCode: string;
    auditHash: string;
    integrityVerified: boolean;
    auditTrail: AuditEvent[];
}
export interface SecurityAlert {
    alertType: 'SUSPICIOUS_VOTING_PATTERN' | 'DUPLICATE_VOTE_ATTEMPT' | 'UNUSUAL_ACCESS_PATTERN' | 'INTEGRITY_VIOLATION';
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: Record<string, any>;
    resolved: boolean;
}
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllAuditLogs(): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        timestamp: Date;
        eventType: string;
        action: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        severity: string;
    }[]>;
    generateVerificationCode(): string;
    generateAuditHash(voteData: {
        voterId: string;
        ballotId: string;
        candidateId: string;
        timestamp: Date;
    }): string;
    logAuditEvent(event: AuditEvent): Promise<void>;
    createVoteAudit(voteData: {
        voteId: string;
        voterId: string;
        ballotId: string;
        candidateId: string;
        timestamp: Date;
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<VoteAudit>;
    getVoteAuditTrail(voteId: string): Promise<AuditEvent[]>;
    verifyVoteIntegrity(voteId: string): Promise<{
        verified: boolean;
        details: Record<string, any>;
        auditTrail: AuditEvent[];
    }>;
    detectSuspiciousPatterns(ballotId: string): Promise<SecurityAlert[]>;
    getBallotAuditReport(ballotId: string): Promise<{
        ballotId: string;
        totalVotes: number;
        verifiedVotes: number;
        disputedVotes: number;
        securityAlerts: SecurityAlert[];
        auditTrail: AuditEvent[];
        integrityScore: number;
        complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
    }>;
    getVoterHistory(voterId: string): Promise<{
        voterId: string;
        totalVotes: number;
        ballots: Array<{
            ballotId: string;
            ballotTitle: string;
            voteCount: number;
            lastVoteDate: Date;
            verificationCodes: string[];
        }>;
        auditTrail: AuditEvent[];
    }>;
    exportAuditData(ballotId: string): Promise<{
        ballotId: string;
        exportDate: Date;
        auditReport: any;
        voteDetails: any[];
        securityAlerts: SecurityAlert[];
        complianceReport: any;
    }>;
}
