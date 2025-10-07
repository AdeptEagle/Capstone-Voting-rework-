import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSystem() {
  try {
    console.log('🧹 Cleaning system for fresh test...\n');

    // Clear all ballots and positions (in correct order due to foreign keys)
    console.log('🗑️ Clearing ballots and related data...');
    
    // Clear votes first (depends on ballots and candidates)
    await prisma.vote.deleteMany();
    console.log('✅ Votes cleared');
    
    // Clear ballot results
    await prisma.ballotResultDetails.deleteMany();
    await prisma.ballotResults.deleteMany();
    console.log('✅ Ballot results cleared');
    
    // Clear ballot candidates (depends on ballots and candidates)
    await prisma.ballotCandidate.deleteMany();
    console.log('✅ Ballot candidates cleared');
    
    // Clear ballot positions (depends on ballots and positions)
    await prisma.ballotPosition.deleteMany();
    console.log('✅ Ballot positions cleared');
    
    // Clear user ballot history
    await prisma.userBallotHistory.deleteMany();
    console.log('✅ User ballot history cleared');
    
    // Clear ballots
    await prisma.ballot.deleteMany();
    console.log('✅ Ballots cleared');

    console.log('🗑️ Clearing positions and candidates...');
    await prisma.candidate.deleteMany();
    await prisma.position.deleteMany();
    console.log('✅ Positions and candidates cleared');

    console.log('🗑️ Clearing templates...');
    await prisma.ballotTemplate.deleteMany();
    console.log('✅ Templates cleared');

    // Keep admins, departments, courses, and voters for testing
    console.log('✅ Keeping admins, departments, courses, and voters');

    // Verify cleanup
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
    } else {
      console.log('\n⚠️ Some data may still exist');
    }

  } catch (error) {
    console.error('❌ Error cleaning system:', error);
    throw error;
  } finally {
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
