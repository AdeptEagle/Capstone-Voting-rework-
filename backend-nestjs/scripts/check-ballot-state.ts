import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBallotState() {
  console.log('🔍 Checking ballot state...');

  try {
    // Check positions
    const positions = await prisma.position.findMany();
    console.log(`\n📊 Positions: ${positions.length}`);
    positions.forEach(p => console.log(`  - ${p.Position_Title}`));

    // Check candidates
    const candidates = await prisma.candidate.findMany({
      include: {
        position: {
          select: {
            Position_Title: true
          }
        }
      }
    });
    console.log(`\n👥 Candidates: ${candidates.length}`);
    candidates.forEach(c => console.log(`  - ${c.Candidate_Name} (${c.position?.Position_Title || 'No Position'})`));

    // Check ballots
    const ballots = await prisma.ballot.findMany();
    console.log(`\n🗳️ Ballots: ${ballots.length}`);
    ballots.forEach(b => {
      console.log(`  - ${b.Ballot_Title}`);
      console.log(`    Status: ${b.Ballot_Status}`);
      console.log(`    Active: ${b.Ballot_IsActive}`);
      console.log(`    Start: ${b.Ballot_StartDate.toISOString()}`);
      console.log(`    End: ${b.Ballot_EndDate.toISOString()}`);
    });

    // Check if there are any active ballots
    const activeBallots = ballots.filter(b => b.Ballot_Status === 'ACTIVE' || b.Ballot_IsActive);
    console.log(`\n✅ Active Ballots: ${activeBallots.length}`);

  } catch (error) {
    console.error('❌ Error checking ballot state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBallotState();
