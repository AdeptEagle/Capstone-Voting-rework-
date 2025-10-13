"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function clearAllDataExceptAdmins() {
    try {
        console.log('🧹 Clearing all seeded data except admins...\n');
        console.log('🗑️ Clearing votes and voting history...');
        await prisma.vote.deleteMany();
        await prisma.userBallotHistory.deleteMany();
        console.log('✅ Votes and voting history cleared');
        console.log('🗑️ Clearing ballot results...');
        await prisma.ballotResultDetails.deleteMany();
        await prisma.ballotResults.deleteMany();
        console.log('✅ Ballot results cleared');
        console.log('🗑️ Clearing ballot candidates and positions...');
        await prisma.ballotCandidate.deleteMany();
        await prisma.ballotPosition.deleteMany();
        await prisma.ballot.deleteMany();
        console.log('✅ Ballot data cleared');
        console.log('🗑️ Clearing election data...');
        await prisma.electionCandidate.deleteMany();
        await prisma.electionPosition.deleteMany();
        await prisma.election.deleteMany();
        console.log('✅ Election data cleared');
        console.log('🗑️ Clearing candidates and positions...');
        await prisma.candidate.deleteMany();
        await prisma.position.deleteMany();
        console.log('✅ Candidates and positions cleared');
        console.log('🗑️ Clearing party lists...');
        await prisma.partyList.deleteMany();
        console.log('✅ Party lists cleared');
        console.log('🗑️ Clearing ballot templates...');
        await prisma.ballotTemplate.deleteMany();
        console.log('✅ Ballot templates cleared');
        console.log('🗑️ Clearing audit logs and login logs...');
        await prisma.auditLog.deleteMany();
        await prisma.adminLoginLog.deleteMany();
        await prisma.userLoginLog.deleteMany();
        console.log('✅ Audit logs and login logs cleared');
        console.log('🗑️ Clearing voters...');
        await prisma.voter.deleteMany();
        console.log('✅ Voters cleared');
        console.log('🗑️ Clearing courses and departments...');
        await prisma.course.deleteMany();
        await prisma.department.deleteMany();
        console.log('✅ Courses and departments cleared');
        console.log('🗑️ Clearing password reset tokens...');
        await prisma.passwordResetToken.deleteMany();
        console.log('✅ Password reset tokens cleared');
        console.log('\n📊 Verifying cleanup...');
        const counts = {
            votes: await prisma.vote.count(),
            userBallotHistory: await prisma.userBallotHistory.count(),
            ballotResultDetails: await prisma.ballotResultDetails.count(),
            ballotResults: await prisma.ballotResults.count(),
            ballotCandidates: await prisma.ballotCandidate.count(),
            ballotPositions: await prisma.ballotPosition.count(),
            ballots: await prisma.ballot.count(),
            electionCandidates: await prisma.electionCandidate.count(),
            electionPositions: await prisma.electionPosition.count(),
            elections: await prisma.election.count(),
            candidates: await prisma.candidate.count(),
            positions: await prisma.position.count(),
            partyLists: await prisma.partyList.count(),
            ballotTemplates: await prisma.ballotTemplate.count(),
            voters: await prisma.voter.count(),
            courses: await prisma.course.count(),
            departments: await prisma.department.count(),
            auditLogs: await prisma.auditLog.count(),
            adminLoginLogs: await prisma.adminLoginLog.count(),
            userLoginLogs: await prisma.userLoginLog.count(),
            passwordResetTokens: await prisma.passwordResetToken.count(),
            admins: await prisma.admin.count()
        };
        console.log('\n📊 Final table counts:');
        Object.entries(counts).forEach(([table, count]) => {
            const status = count === 0 ? '✅' : '❌';
            console.log(`   ${status} ${table}: ${count}`);
        });
        const nonAdminTables = Object.entries(counts).filter(([table]) => table !== 'admins');
        const allEmpty = nonAdminTables.every(([, count]) => count === 0);
        if (allEmpty && counts.admins > 0) {
            console.log('\n✅ All seeded data cleared successfully!');
            console.log('🎯 Only admin accounts remain in the database');
        }
        else if (counts.admins === 0) {
            console.log('\n⚠️ Warning: No admin accounts found in the database');
        }
        else {
            console.log('\n⚠️ Some data may still exist in non-admin tables');
        }
    }
    catch (error) {
        console.error('❌ Error clearing data:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
clearAllDataExceptAdmins()
    .then(() => {
    console.log('\n🎉 Data cleanup completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Data cleanup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=clear-all-data-except-admins.js.map