import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearVotes() {
  try {
    console.log('🧹 Clearing votes and user ballot history...');
    
    await prisma.vote.deleteMany();
    console.log('✅ Votes cleared');
    
    await prisma.userBallotHistory.deleteMany();
    console.log('✅ User ballot history cleared');
    
    await prisma.ballotResultDetails.deleteMany();
    console.log('✅ Ballot result details cleared');
    
    await prisma.ballotResults.deleteMany();
    console.log('✅ Ballot results cleared');
    
    console.log('🎉 All voting data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearVotes();








