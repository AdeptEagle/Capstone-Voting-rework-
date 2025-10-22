import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class NuclearResetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Nuclear Reset - Drops all user-generated data while preserving system essentials
   * Preserves: SuperAdmins, Built-in positions, Templates, Departments, Courses, System configurations
   * Deletes: All other data (voters, candidates, ballots, votes, party lists, etc.)
   */
  async nuclearReset(currentPassword: string, adminId: string) {
    // First verify the current password
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password. Nuclear reset aborted.');
    }
    try {
      console.log('🚨 Starting Nuclear Reset...');
      
      // Start transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Delete all votes first (foreign key constraints)
        const deletedVotes = await prisma.vote.deleteMany();
        console.log(`🗑️ Deleted ${deletedVotes.count} votes`);

        // 2. Delete ballot-related data
        const deletedBallotResults = await prisma.ballotResults.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotResults.count} ballot results`);

        const deletedBallotResultDetails = await prisma.ballotResultDetails.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotResultDetails.count} ballot result details`);

        const deletedBallotCandidates = await prisma.ballotCandidate.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotCandidates.count} ballot candidates`);

        const deletedBallotPositions = await prisma.ballotPosition.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotPositions.count} ballot positions`);

        const deletedUserBallotHistory = await prisma.userBallotHistory.deleteMany();
        console.log(`🗑️ Deleted ${deletedUserBallotHistory.count} user ballot history`);

        // 3. Delete ballots
        const deletedBallots = await prisma.ballot.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallots.count} ballots`);

        // 4. Delete ballot templates (user-created ones)
        const deletedBallotTemplates = await prisma.ballotTemplate.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotTemplates.count} ballot templates`);

        // 5. Delete candidates
        const deletedCandidates = await prisma.candidate.deleteMany();
        console.log(`🗑️ Deleted ${deletedCandidates.count} candidates`);

        // 6. Delete party lists
        const deletedPartyLists = await prisma.partyList.deleteMany();
        console.log(`🗑️ Deleted ${deletedPartyLists.count} party lists`);

        // 7. Delete voters
        const deletedVoters = await prisma.voter.deleteMany();
        console.log(`🗑️ Deleted ${deletedVoters.count} voters`);

        // Note: Courses and departments are preserved as they are essential system data
        // Note: Positions are preserved as they are built-in system data

        // 8. Delete audit logs
        const deletedAuditLogs = await prisma.auditLog.deleteMany();
        console.log(`🗑️ Deleted ${deletedAuditLogs.count} audit logs`);

        // 11. Delete login logs
        const deletedAdminLoginLogs = await prisma.adminLoginLog.deleteMany();
        console.log(`🗑️ Deleted ${deletedAdminLoginLogs.count} admin login logs`);

        const deletedUserLoginLogs = await prisma.userLoginLog.deleteMany();
        console.log(`🗑️ Deleted ${deletedUserLoginLogs.count} user login logs`);

        // 12. Delete password reset tokens
        const deletedPasswordResetTokens = await prisma.passwordResetToken.deleteMany();
        console.log(`🗑️ Deleted ${deletedPasswordResetTokens.count} password reset tokens`);

        // 13. Delete regular admins (keep only SUPERADMIN role)
        const deletedAdmins = await prisma.admin.deleteMany({
          where: {
            role: 'ADMIN' // Only delete ADMIN role, preserve SUPERADMIN
          }
        });
        console.log(`🗑️ Deleted ${deletedAdmins.count} regular admins`);

        // Note: Positions are preserved as they are built-in system data
        // Note: SuperAdmins are preserved for system access

        return {
          votes: deletedVotes.count,
          ballotResults: deletedBallotResults.count,
          ballotResultDetails: deletedBallotResultDetails.count,
          ballotCandidates: deletedBallotCandidates.count,
          ballotPositions: deletedBallotPositions.count,
          userBallotHistory: deletedUserBallotHistory.count,
          ballots: deletedBallots.count,
          ballotTemplates: deletedBallotTemplates.count,
          candidates: deletedCandidates.count,
          partyLists: deletedPartyLists.count,
          voters: deletedVoters.count,
          auditLogs: deletedAuditLogs.count,
          adminLoginLogs: deletedAdminLoginLogs.count,
          userLoginLogs: deletedUserLoginLogs.count,
          passwordResetTokens: deletedPasswordResetTokens.count,
          admins: deletedAdmins.count
        };
      });

      console.log('✅ Nuclear Reset completed successfully');
      return {
        success: true,
        message: 'Nuclear reset completed successfully. All user data has been removed while preserving system essentials.',
        deletedCounts: result
      };

    } catch (error) {
      console.error('❌ Nuclear Reset failed:', error);
      throw new Error('Nuclear reset failed. Please check the logs for details.');
    }
  }

  /**
   * Get system status before nuclear reset
   */
  async getSystemStatus() {
    const counts = await Promise.all([
      this.prisma.voter.count(),
      this.prisma.candidate.count(),
      this.prisma.ballot.count(),
      this.prisma.vote.count(),
      this.prisma.department.count(),
      this.prisma.course.count(),
      this.prisma.partyList.count(),
      this.prisma.admin.count({ where: { role: 'ADMIN' } }),
      this.prisma.admin.count({ where: { role: 'SUPERADMIN' } }),
      this.prisma.position.count(),
      this.prisma.ballotTemplate.count()
    ]);

    return {
      voters: counts[0],
      candidates: counts[1],
      ballots: counts[2],
      votes: counts[3],
      departments: counts[4],
      courses: counts[5],
      partyLists: counts[6],
      regularAdmins: counts[7],
      superAdmins: counts[8],
      positions: counts[9],
      ballotTemplates: counts[10]
    };
  }
}
