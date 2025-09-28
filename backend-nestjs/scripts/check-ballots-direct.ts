import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBallotsDirect() {
  console.log('🔍 Checking ballots directly...');

  try {
    // Raw query to check ballots
    const ballots = await prisma.$queryRaw`
      SELECT 
        id,
        ballot_title,
        ballot_status,
        ballot_is_active,
        ballot_start_date,
        ballot_end_date,
        ballot_created_at
      FROM ballots 
      ORDER BY ballot_created_at DESC
    `;

    console.log('Raw ballots query result:', ballots);

    // Also try the Prisma way
    const prismaBallots = await prisma.ballot.findMany({
      select: {
        id: true,
        Ballot_Title: true,
        Ballot_Status: true,
        Ballot_IsActive: true,
        Ballot_StartDate: true,
        Ballot_EndDate: true,
        Ballot_CreatedAt: true
      }
    });

    console.log('Prisma ballots query result:', prismaBallots);

  } catch (error) {
    console.error('❌ Error checking ballots:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBallotsDirect();




