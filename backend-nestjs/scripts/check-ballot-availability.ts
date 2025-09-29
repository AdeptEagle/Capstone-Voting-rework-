import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBallotAvailability() {
  console.log('🔍 Checking ballot availability criteria...');

  try {
    const now = new Date();
    console.log('Current time:', now.toISOString());

    // Check all ballots with their status
    const allBallots = await prisma.ballot.findMany({
      select: {
        id: true,
        Ballot_Title: true,
        Ballot_Status: true,
        Ballot_IsActive: true,
        Ballot_IsDeleted: true,
        Ballot_StartDate: true,
        Ballot_EndDate: true,
        Ballot_CreatedAt: true
      }
    });

    console.log('\n📊 All ballots in database:');
    allBallots.forEach((ballot, index) => {
      console.log(`\nBallot ${index + 1}: ${ballot.Ballot_Title}`);
      console.log('  ID:', ballot.id);
      console.log('  Status:', ballot.Ballot_Status);
      console.log('  IsActive:', ballot.Ballot_IsActive);
      console.log('  IsDeleted:', ballot.Ballot_IsDeleted);
      console.log('  Start:', ballot.Ballot_StartDate.toISOString());
      console.log('  End:', ballot.Ballot_EndDate.toISOString());
      console.log('  Created:', ballot.Ballot_CreatedAt.toISOString());
      
      // Check availability criteria
      const isNotDeleted = !ballot.Ballot_IsDeleted;
      const isActive = ballot.Ballot_IsActive;
      const hasActiveStatus = ballot.Ballot_Status === 'ACTIVE';
      const hasStarted = ballot.Ballot_StartDate <= now;
      const hasNotEnded = ballot.Ballot_EndDate >= now;
      
      console.log('  Availability Check:');
      console.log('    ✓ Not Deleted:', isNotDeleted);
      console.log('    ✓ Is Active:', isActive);
      console.log('    ✓ Has ACTIVE Status:', hasActiveStatus);
      console.log('    ✓ Has Started:', hasStarted, `(${ballot.Ballot_StartDate <= now ? 'YES' : 'NO'})`);
      console.log('    ✓ Has Not Ended:', hasNotEnded, `(${ballot.Ballot_EndDate >= now ? 'YES' : 'NO'})`);
      
      const isAvailable = isNotDeleted && isActive && hasActiveStatus && hasStarted && hasNotEnded;
      console.log('  🎯 AVAILABLE TO USERS:', isAvailable ? 'YES' : 'NO');
    });

    // Test the exact query used by getAvailableBallotsForUser
    const availableBallots = await prisma.ballot.findMany({
      where: {
        Ballot_IsDeleted: false,
        Ballot_IsActive: true,
        Ballot_Status: 'ACTIVE',
        Ballot_StartDate: { lte: now },
        Ballot_EndDate: { gte: now },
      },
    });

    console.log(`\n✅ Ballots available to users: ${availableBallots.length}`);
    availableBallots.forEach(ballot => {
      console.log(`  - ${ballot.Ballot_Title} (${ballot.id})`);
    });

  } catch (error) {
    console.error('❌ Error checking ballot availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBallotAvailability();





