import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class NuclearResetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Nuclear Reset - Drops all user-generated data while preserving system essentials
   * Preserves: All Admins (ADMIN & SUPERADMIN), Built-in positions, Ballot Templates, Departments, Courses, System configurations
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
        console.log('🔄 Starting transaction...');
        
        // 1. Delete all votes first (foreign key constraints)
        console.log('🗑️ Step 1: Deleting votes...');
        const deletedVotes = await prisma.vote.deleteMany();
        console.log(`🗑️ Deleted ${deletedVotes.count} votes`);

        // 2. Delete ballot-related data (child records first)
        console.log('🗑️ Step 2: Deleting ballot-related data...');
        
        // Delete child records first to avoid foreign key constraints
        const deletedBallotResultDetails = await prisma.ballotResultDetails.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotResultDetails.count} ballot result details`);

        const deletedBallotCandidates = await prisma.ballotCandidate.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotCandidates.count} ballot candidates`);

        const deletedBallotPositions = await prisma.ballotPosition.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotPositions.count} ballot positions`);

        const deletedUserBallotHistory = await prisma.userBallotHistory.deleteMany();
        console.log(`🗑️ Deleted ${deletedUserBallotHistory.count} user ballot history`);

        // Now delete parent records
        const deletedBallotResults = await prisma.ballotResults.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallotResults.count} ballot results`);

        // 3. Delete ballots
        console.log('🗑️ Step 3: Deleting ballots...');
        const deletedBallots = await prisma.ballot.deleteMany();
        console.log(`🗑️ Deleted ${deletedBallots.count} ballots`);

        // 4. Skip ballot templates - they are preserved as system essentials
        console.log(`✅ Preserving ballot templates (system essentials)`);

        // 5. Delete candidates
        console.log('🗑️ Step 5: Deleting candidates...');
        const deletedCandidates = await prisma.candidate.deleteMany();
        console.log(`🗑️ Deleted ${deletedCandidates.count} candidates`);

        // 6. Delete party lists
        console.log('🗑️ Step 6: Deleting party lists...');
        const deletedPartyLists = await prisma.partyList.deleteMany();
        console.log(`🗑️ Deleted ${deletedPartyLists.count} party lists`);

        // 7. Delete login logs (must be done before voters due to foreign key constraints)
        console.log('🗑️ Step 7: Deleting login logs...');
        const deletedAdminLoginLogs = await prisma.adminLoginLog.deleteMany();
        console.log(`🗑️ Deleted ${deletedAdminLoginLogs.count} admin login logs`);

        const deletedUserLoginLogs = await prisma.userLoginLog.deleteMany();
        console.log(`🗑️ Deleted ${deletedUserLoginLogs.count} user login logs`);

        // 8. Delete password reset tokens (must be done before voters due to foreign key constraints)
        console.log('🗑️ Step 8: Deleting password reset tokens...');
        const deletedPasswordResetTokens = await prisma.passwordResetToken.deleteMany();
        console.log(`🗑️ Deleted ${deletedPasswordResetTokens.count} password reset tokens`);

        // 9. Delete voters (after login logs and password reset tokens)
        console.log('🗑️ Step 9: Deleting voters...');
        const deletedVoters = await prisma.voter.deleteMany();
        console.log(`🗑️ Deleted ${deletedVoters.count} voters`);

        // Note: Courses and departments are preserved as they are essential system data
        // Note: Positions are preserved as they are built-in system data

        // 10. Delete audit logs
        console.log('🗑️ Step 10: Deleting audit logs...');
        const deletedAuditLogs = await prisma.auditLog.deleteMany();
        console.log(`🗑️ Deleted ${deletedAuditLogs.count} audit logs`);

        // 11. Skip admins - preserve all admins (both ADMIN and SUPERADMIN roles)
        console.log(`✅ Preserving all admins (system essentials)`);

        // Note: Positions are preserved as they are built-in system data
        // Note: All admins are preserved for system access

        console.log('✅ Transaction completed successfully');

        return {
          votes: deletedVotes.count,
          ballotResultDetails: deletedBallotResultDetails.count,
          ballotCandidates: deletedBallotCandidates.count,
          ballotPositions: deletedBallotPositions.count,
          userBallotHistory: deletedUserBallotHistory.count,
          ballotResults: deletedBallotResults.count,
          ballots: deletedBallots.count,
          candidates: deletedCandidates.count,
          partyLists: deletedPartyLists.count,
          voters: deletedVoters.count,
          auditLogs: deletedAuditLogs.count,
          adminLoginLogs: deletedAdminLoginLogs.count,
          userLoginLogs: deletedUserLoginLogs.count,
          passwordResetTokens: deletedPasswordResetTokens.count
        };
      });

      console.log('✅ Nuclear Reset completed successfully');
      return {
        success: true,
        message: 'Nuclear reset completed successfully. All user data has been removed while preserving system essentials including admins and ballot templates.',
        deletedCounts: result
      };

    } catch (error) {
      console.error('❌ Nuclear Reset failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      });
      throw new Error(`Nuclear reset failed: ${error.message}. Please check the logs for details.`);
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
