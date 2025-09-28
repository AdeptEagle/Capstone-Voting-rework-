import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testValidation() {
  console.log('🧪 Testing ballot validation...');

  try {
    // First, get available positions and candidates
    const positions = await prisma.position.findMany();
    const candidates = await prisma.candidate.findMany();

    console.log('Available positions:', positions.length);
    console.log('Available candidates:', candidates.length);

    if (positions.length === 0) {
      console.log('❌ No positions available for testing');
      return;
    }

    console.log('Positions:');
    positions.forEach(p => console.log(`  - ${p.Position_Title} (${p.id})`));

    console.log('Candidates:');
    candidates.forEach(c => console.log(`  - ${c.Candidate_Name} (${c.id}) for position ${c.positionId}`));

    // Test creating a ballot with positions but no candidates
    console.log('\n🧪 Testing: Create ballot with positions but NO candidates...');
    
    const testData = {
      Ballot_Title: 'Test Validation Ballot',
      Ballot_Description: 'Testing validation',
      Ballot_StartDate: new Date().toISOString(),
      Ballot_EndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      positionIds: [positions[0].id], // Include first position
      candidateIds: [] // NO candidates
    };

    console.log('Test data:', JSON.stringify(testData, null, 2));

    // This should fail with validation error
    const result = await fetch('http://localhost:3001/ballots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This won't work without auth, but we can see the validation error
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', result.status);
    const responseText = await result.text();
    console.log('Response:', responseText);

  } catch (error) {
    console.error('❌ Error testing validation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testValidation();




