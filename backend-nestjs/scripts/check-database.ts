import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...');
    
    const elections = await prisma.election.findMany();
    console.log('Elections:', elections);
    
    const ballots = await prisma.ballot.findMany();
    console.log('Ballots:', ballots);
    
    const voters = await prisma.voter.findMany();
    console.log('Voters:', voters);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();






