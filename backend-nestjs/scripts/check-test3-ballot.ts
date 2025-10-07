import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTest3Ballot() {
  console.log('🔍 Checking Test 3 ballot specifically...');
  
  try {
    const now = new Date();
    console.log('Current time:', now.toISOString());
    
    const ballot = await prisma.ballot.findFirst({
      where: { Ballot_Title: 'Test 3' },
      include: {
        ballotPositions: {
          include: { position: true }
        },
        ballotCandidates: {
          include: { candidate: true }
        }
      }
    });
    
    if (!ballot) {
      console.log('❌ Test 3 ballot not found in database');
      return;
    }
    
    console.log('✅ Found Test 3 ballot:');
    console.log('  ID:', ballot.id);
    console.log('  Title:', ballot.Ballot_Title);
    console.log('  Status:', ballot.Ballot_Status);
    console.log('  IsActive:', ballot.Ballot_IsActive);
    console.log('  IsDeleted:', ballot.Ballot_IsDeleted);
    console.log('  Start:', ballot.Ballot_StartDate.toISOString());
    console.log('  End:', ballot.Ballot_EndDate.toISOString());
    console.log('  Positions:', ballot.ballotPositions.length);
    console.log('  Candidates:', ballot.ballotCandidates.length);
    
    // List positions and candidates
    if (ballot.ballotPositions.length > 0) {
      console.log('\n📊 Positions in ballot:');
      ballot.ballotPositions.forEach(bp => {
        console.log(`  - ${bp.position.Position_Title}`);
      });
    }
    
    if (ballot.ballotCandidates.length > 0) {
      console.log('\n👥 Candidates in ballot:');
      ballot.ballotCandidates.forEach(bc => {
        console.log(`  - ${bc.candidate.Candidate_Name}`);
      });
    }
    
    // Check availability criteria
    const criteria = {
      notDeleted: !ballot.Ballot_IsDeleted,
      isActive: ballot.Ballot_IsActive,
      hasActiveStatus: ballot.Ballot_Status === 'ACTIVE',
      hasStarted: ballot.Ballot_StartDate <= now,
      hasNotEnded: ballot.Ballot_EndDate >= now,
    };
    
    console.log('\n🔍 Availability criteria:');
    Object.entries(criteria).forEach(([key, value]) => {
      console.log(`  ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const isAvailable = Object.values(criteria).every(Boolean);
    console.log(`\n🎯 Should be available to users: ${isAvailable ? 'YES' : 'NO'}`);
    
    if (!isAvailable) {
      console.log('\n❌ Reasons why ballot is not available:');
      Object.entries(criteria).forEach(([key, value]) => {
        if (!value) console.log(`  - ${key} is false`);
      });
    }
    
    // Test the exact query used by getAvailableBallotsForUser
    console.log('\n🔍 Testing exact availability query...');
    const availableBallots = await prisma.ballot.findMany({
      where: {
        Ballot_IsDeleted: false,
        Ballot_IsActive: true,
        Ballot_Status: 'ACTIVE',
        Ballot_StartDate: { lte: now },
        Ballot_EndDate: { gte: now },
      },
    });
    
    console.log(`Available ballots found: ${availableBallots.length}`);
    availableBallots.forEach(b => {
      console.log(`  - ${b.Ballot_Title} (${b.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking Test 3 ballot:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTest3Ballot();








