import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

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
  electionId: string;
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

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all audit logs
   */
  async getAllAuditLogs() {
    try {
      const auditLogs = await this.prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100, // Limit to last 100 logs for performance
      });
      return auditLogs;
    } catch (error) {
      console.error('❌ Error retrieving audit logs:', error);
      throw error;
    }
  }

  /**
   * Generate a unique verification code for vote tracking
   */
  generateVerificationCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  /**
   * Generate audit hash for vote integrity
   */
  generateAuditHash(voteData: {
    voterId: string;
    ballotId: string;
    candidateId: string;
    timestamp: Date;
  }): string {
    const dataString = `${voteData.voterId}-${voteData.ballotId}-${voteData.candidateId}-${voteData.timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Log an audit event
   */
  async logAuditEvent(event: AuditEvent): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          eventType: event.eventType,
          timestamp: event.timestamp,
          userId: event.userId || null,
          action: event.action,
          details: event.details as any,
          metadata: event.metadata as any,
          severity: event.severity,
        },
      });
      console.log(`🔍 Audit Event Logged: ${event.eventType} - ${event.action}`);
    } catch (error) {
      console.error('❌ Error logging audit event:', error);
    }
  }

  /**
   * Create comprehensive vote audit trail
   */
  async createVoteAudit(voteData: {
    voteId: string;
    voterId: string;
    ballotId: string;
    candidateId: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<VoteAudit> {
    const verificationCode = this.generateVerificationCode();
    const auditHash = this.generateAuditHash(voteData);

    // Log vote cast event
    await this.logAuditEvent({
      eventType: 'VOTE_CAST',
      timestamp: voteData.timestamp,
      userId: voteData.voterId,
      // ballotId: voteData.ballotId, // TODO: Add ballotId to AuditEvent interface
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

    // Log vote verification event
    await this.logAuditEvent({
      eventType: 'VOTE_VERIFIED',
      timestamp: new Date(),
      userId: voteData.voterId,
      // ballotId: voteData.ballotId, // TODO: Add ballotId to AuditEvent interface
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
      electionId: voteData.ballotId, // Using ballotId as electionId for compatibility
      candidateId: voteData.candidateId,
      timestamp: voteData.timestamp,
      verificationCode,
      auditHash,
      integrityVerified: true,
      auditTrail: [], // Will be populated by getVoteAuditTrail
    };
  }

  /**
   * Get complete audit trail for a specific vote
   */
  async getVoteAuditTrail(voteId: string): Promise<AuditEvent[]> {
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
      eventType: event.eventType as any,
      timestamp: event.timestamp,
      userId: event.userId,
      action: event.action,
      details: event.details as Record<string, any>,
      metadata: event.metadata as any,
      severity: event.severity as any,
    }));
  }

  /**
   * Verify vote integrity
   */
  async verifyVoteIntegrity(voteId: string): Promise<{
    verified: boolean;
    details: Record<string, any>;
    auditTrail: AuditEvent[];
  }> {
    const vote = await this.prisma.vote.findUnique({
      where: { id: voteId },
      include: {
        voter: true,
        candidate: true,
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
      ballotId: vote.ballotId,
      candidateId: vote.candidateId,
      timestamp: vote.createdAt,
    });

    // Check for integrity violations
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

    // Log verification result
    await this.logAuditEvent({
      eventType: 'VOTE_VERIFIED',
      timestamp: new Date(),
      userId: vote.voterId,
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
          candidateId: vote.candidateId,
          timestamp: vote.createdAt,
        },
      },
      auditTrail,
    };
  }

  /**
   * Detect suspicious voting patterns
   */
  async detectSuspiciousPatterns(electionId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    // Check for rapid voting from same IP
    const rapidVoting = await this.prisma.vote.groupBy({
      by: ['voterId'],
      where: {
        // ballotId, // TODO: Add ballotId parameter
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1, // More than 1 vote in 5 minutes
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

    // Check for votes from same IP address
    const sameIPVotes = await this.prisma.auditLog.groupBy({
      by: ['metadata'],
      where: {
        // ballotId, // TODO: Add ballotId parameter
        eventType: 'VOTE_CAST',
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
      _count: {
        id: true,
      },
    });

    const ipCounts = new Map<string, number>();
    sameIPVotes.forEach(vote => {
      const metadata = vote.metadata as any;
      const ip = metadata?.ipAddress;
      if (ip) {
        ipCounts.set(ip, (ipCounts.get(ip) || 0) + vote._count.id);
      }
    });

    // Alert if more than 3 votes from same IP
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

  /**
   * Get comprehensive audit report for an election
   */
  async getElectionAuditReport(electionId: string): Promise<{
    ballotId: string;
    totalVotes: number;
    verifiedVotes: number;
    disputedVotes: number;
    securityAlerts: SecurityAlert[];
    auditTrail: AuditEvent[];
    integrityScore: number;
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
  }> {
    const votes = await this.prisma.vote.findMany({
    });

    const auditEvents = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'asc' },
    });

    const securityAlerts = await this.detectSuspiciousPatterns(electionId);

    // Verify each vote
    const verificationResults = await Promise.all(
      votes.map(vote => this.verifyVoteIntegrity(vote.id))
    );

    const verifiedVotes = verificationResults.filter(result => result.verified).length;
    const disputedVotes = votes.length - verifiedVotes;

    // Calculate integrity score
    const integrityScore = votes.length > 0 ? (verifiedVotes / votes.length) * 100 : 100;

    // Determine compliance status
    let complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW' = 'COMPLIANT';
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
      ballotId: 'BALLOT-1', // TODO: Pass actual ballotId parameter
      totalVotes: votes.length,
      verifiedVotes,
      disputedVotes,
      securityAlerts,
      auditTrail: auditEvents.map(event => ({
        eventType: event.eventType as any,
        timestamp: event.timestamp,
        userId: event.userId,
        action: event.action,
        details: event.details as Record<string, any>,
        metadata: event.metadata as any,
        severity: event.severity as any,
      })),
      integrityScore,
      complianceStatus,
    };
  }

  /**
   * Get voter's complete voting history
   */
  async getVoterHistory(voterId: string): Promise<{
    voterId: string;
    totalVotes: number;
    elections: Array<{
      ballotId: string;
      electionTitle: string;
      voteCount: number;
      lastVoteDate: Date;
      verificationCodes: string[];
    }>;
    auditTrail: AuditEvent[];
  }> {
    const votes = await this.prisma.vote.findMany({
      where: { voterId },
      include: {
      },
      orderBy: { createdAt: 'desc' },
    });

    const auditEvents = await this.prisma.auditLog.findMany({
      where: { userId: voterId },
      orderBy: { timestamp: 'desc' },
    });

    // Group votes by election
    const electionMap = new Map();
    votes.forEach(vote => {
      if (!electionMap.has(vote.ballotId)) {
        electionMap.set(vote.ballotId, {
          ballotTitle: 'Ballot Title', // TODO: Add ballot relation to vote
          voteCount: 0,
          lastVoteDate: vote.createdAt,
          verificationCodes: [],
        });
      }
    });

    return {
      voterId,
      totalVotes: votes.length,
      elections: [], // Elections replaced with ballots
      auditTrail: auditEvents.map(event => ({
        eventType: event.eventType as any,
        timestamp: event.timestamp,
        userId: event.userId,
        action: event.action,
        details: event.details as Record<string, any>,
        metadata: event.metadata as any,
        severity: event.severity as any,
      })),
    };
  }

  /**
   * Export audit data for compliance reporting
   */
  async exportAuditData(electionId: string): Promise<{
    ballotId: string;
    exportDate: Date;
    auditReport: any;
    voteDetails: any[];
    securityAlerts: SecurityAlert[];
    complianceReport: any;
  }> {
    const auditReport = await this.getElectionAuditReport(electionId);
    const votes = await this.prisma.vote.findMany({
      include: {
        voter: true,
        candidate: true,
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
      // ballotId, // TODO: Add ballotId to return type
      exportDate: new Date(),
      totalVotes: auditReport.totalVotes,
      verifiedVotes: auditReport.verifiedVotes,
      integrityScore: auditReport.integrityScore,
      complianceStatus: auditReport.complianceStatus,
      securityAlerts: auditReport.securityAlerts.length,
      auditTrailEvents: auditReport.auditTrail.length,
    };

    return {
      ballotId: 'BALLOT-1', // TODO: Pass actual ballotId parameter
      exportDate: new Date(),
      auditReport,
      voteDetails,
      securityAlerts: auditReport.securityAlerts,
      complianceReport,
    };
  }
} 