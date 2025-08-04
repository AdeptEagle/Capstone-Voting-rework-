import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from '../services/audit.service';

@ApiTags('Audit & Security')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('verify-vote/:voteId')
  @ApiOperation({ summary: 'Verify vote integrity' })
  @ApiResponse({ status: 200, description: 'Vote verification result' })
  @ApiResponse({ status: 404, description: 'Vote not found' })
  async verifyVoteIntegrity(@Param('voteId') voteId: string) {
    try {
      const result = await this.auditService.verifyVoteIntegrity(voteId);
      return {
        success: true,
        message: 'Vote integrity verification completed',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to verify vote integrity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('vote-trail/:voteId')
  @ApiOperation({ summary: 'Get complete audit trail for a vote' })
  @ApiResponse({ status: 200, description: 'Vote audit trail' })
  async getVoteAuditTrail(@Param('voteId') voteId: string) {
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
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve vote audit trail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('election-report/:electionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive audit report for an election' })
  @ApiResponse({ status: 200, description: 'Election audit report' })
  async getElectionAuditReport(@Param('electionId') electionId: string) {
    try {
      const report = await this.auditService.getElectionAuditReport(electionId);
      return {
        success: true,
        message: 'Election audit report generated',
        data: report,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to generate election audit report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('voter-history/:voterId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete voting history for a voter' })
  @ApiResponse({ status: 200, description: 'Voter history' })
  async getVoterHistory(@Param('voterId') voterId: string) {
    try {
      const history = await this.auditService.getVoterHistory(voterId);
      return {
        success: true,
        message: 'Voter history retrieved',
        data: history,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve voter history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('security-alerts/:electionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security alerts for an election' })
  @ApiResponse({ status: 200, description: 'Security alerts' })
  async getSecurityAlerts(@Param('electionId') electionId: string) {
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
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security alerts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('export/:electionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export audit data for compliance reporting' })
  @ApiResponse({ status: 200, description: 'Audit data export' })
  async exportAuditData(@Param('electionId') electionId: string) {
    try {
      const exportData = await this.auditService.exportAuditData(electionId);
      return {
        success: true,
        message: 'Audit data exported successfully',
        data: exportData,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to export audit data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('verification-code/:verificationCode')
  @ApiOperation({ summary: 'Verify vote using verification code' })
  @ApiResponse({ status: 200, description: 'Vote verification result' })
  async verifyVoteByCode(@Param('verificationCode') verificationCode: string) {
    try {
      // Find vote by verification code
      const vote = await this.auditService['prisma'].vote.findFirst({
        where: { verificationCode },
        include: {
          voter: true,
          candidate: true,
          election: true,
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

      // Verify vote integrity
      const integrityResult = await this.auditService.verifyVoteIntegrity(vote.id);

      return {
        success: true,
        message: 'Vote verification completed',
        data: {
          voteId: vote.id,
          verificationCode: vote.verificationCode,
          voterName: vote.voter.name,
          candidateName: vote.candidate.name,
          electionTitle: vote.election.title,
          positionTitle: vote.position.title,
          timestamp: vote.createdAt,
          integrityVerified: integrityResult.verified,
          auditTrail: integrityResult.auditTrail,
        },
      };
    } catch (error) {
      throw new HttpException(
        'Failed to verify vote by code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('compliance-status/:electionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get compliance status for an election' })
  @ApiResponse({ status: 200, description: 'Compliance status' })
  async getComplianceStatus(@Param('electionId') electionId: string) {
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
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve compliance status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateComplianceRecommendations(report: any): string[] {
    const recommendations: string[] = [];

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
} 