import { AuditService } from '../services/audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getAllAuditLogs(): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            userId: string | null;
            electionId: string | null;
            timestamp: Date;
            action: string;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            severity: string;
        }[];
    }>;
    verifyVoteIntegrity(voteId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            verified: boolean;
            details: Record<string, any>;
            auditTrail: import("../services/audit.service").AuditEvent[];
        };
    }>;
    getVoteAuditTrail(voteId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            voteId: string;
            auditTrail: import("../services/audit.service").AuditEvent[];
            eventCount: number;
        };
    }>;
    getElectionAuditReport(electionId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            ballotId: string;
            totalVotes: number;
            verifiedVotes: number;
            disputedVotes: number;
            securityAlerts: import("../services/audit.service").SecurityAlert[];
            auditTrail: import("../services/audit.service").AuditEvent[];
            integrityScore: number;
            complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW";
        };
    }>;
    getVoterHistory(voterId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            voterId: string;
            totalVotes: number;
            elections: Array<{
                ballotId: string;
                electionTitle: string;
                voteCount: number;
                lastVoteDate: Date;
                verificationCodes: string[];
            }>;
            auditTrail: import("../services/audit.service").AuditEvent[];
        };
    }>;
    getSecurityAlerts(electionId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            electionId: string;
            alerts: import("../services/audit.service").SecurityAlert[];
            alertCount: number;
            criticalAlerts: number;
            highAlerts: number;
        };
    }>;
    exportAuditData(electionId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            ballotId: string;
            exportDate: Date;
            auditReport: any;
            voteDetails: any[];
            securityAlerts: import("../services/audit.service").SecurityAlert[];
            complianceReport: any;
        };
    }>;
    verifyVoteByCode(verificationCode: string): Promise<{
        success: boolean;
        message: string;
        data: {
            voteId: string;
            verificationCode: string;
            voterName: string;
            candidateName: string;
            ballotTitle: string;
            positionTitle: string;
            timestamp: Date;
            integrityVerified: boolean;
            auditTrail: import("../services/audit.service").AuditEvent[];
        };
    }>;
    getComplianceStatus(electionId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            electionId: string;
            integrityScore: number;
            complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW";
            totalVotes: number;
            verifiedVotes: number;
            disputedVotes: number;
            securityAlerts: number;
            criticalAlerts: number;
            recommendations: string[];
        };
    }>;
    private generateComplianceRecommendations;
}
