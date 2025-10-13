"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function cleanSystem() {
    try {
        console.log('🧹 Cleaning system for fresh test...\n');
        console.log('🗑️ Clearing ballots and related data...');
        await prisma.vote.deleteMany();
        console.log('✅ Votes cleared');
        await prisma.ballotResultDetails.deleteMany();
        await prisma.ballotResults.deleteMany();
        console.log('✅ Ballot results cleared');
        await prisma.ballotCandidate.deleteMany();
        console.log('✅ Ballot candidates cleared');
        await prisma.ballotPosition.deleteMany();
        console.log('✅ Ballot positions cleared');
        await prisma.userBallotHistory.deleteMany();
        console.log('✅ User ballot history cleared');
        await prisma.ballot.deleteMany();
        console.log('✅ Ballots cleared');
        console.log('🗑️ Clearing positions and candidates...');
        await prisma.candidate.deleteMany();
        await prisma.position.deleteMany();
        console.log('✅ Positions and candidates cleared');
        console.log('🗑️ Clearing templates...');
        await prisma.ballotTemplate.deleteMany();
        console.log('✅ Templates cleared');
        console.log('✅ Keeping admins, departments, courses, and voters');
        const ballotCount = await prisma.ballot.count();
        const positionCount = await prisma.position.count();
        const templateCount = await prisma.ballotTemplate.count();
        const candidateCount = await prisma.candidate.count();
        console.log('\n📊 System state after cleanup:');
        console.log(`   Ballots: ${ballotCount}`);
        console.log(`   Positions: ${positionCount}`);
        console.log(`   Templates: ${templateCount}`);
        console.log(`   Candidates: ${candidateCount}`);
        if (ballotCount === 0 && positionCount === 0 && templateCount === 0 && candidateCount === 0) {
            console.log('\n✅ System cleaned successfully!');
            console.log('🎯 Ready for automatic template initialization test');
        }
        else {
            console.log('\n⚠️ Some data may still exist');
        }
    }
    catch (error) {
        console.error('❌ Error cleaning system:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
cleanSystem()
    .then(() => {
    console.log('\n🎉 System cleanup completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 System cleanup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=clean-system.js.map