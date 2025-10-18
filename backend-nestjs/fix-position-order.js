const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPositionOrder() {
  try {
    console.log('🔧 Fixing position order...');
    
    // Get all ballots
    const ballots = await prisma.ballot.findMany({
      where: { Ballot_IsDeleted: false },
      include: {
        ballotPositions: {
          include: { position: true }
        }
      }
    });

    for (const ballot of ballots) {
      console.log(`\n📋 Processing ballot: ${ballot.Ballot_Title}`);
      
      // Define the correct order based on position titles
      const positionOrderMap = {
        'President': 1,
        'Vice President': 2,
        'Secretary': 3,
        'Treasurer': 4,
        'Auditor': 5,
        'PIO': 6,
        'Senator': 7,
        'Representative': 8,
        'Governor': 9,
        'Mayor': 10
      };

      for (const ballotPosition of ballot.ballotPositions) {
        const positionTitle = ballotPosition.position.Position_Title;
        const correctOrder = positionOrderMap[positionTitle] || 999;
        
        if (ballotPosition.BallotPosition_DisplayOrder !== correctOrder) {
          console.log(`  🔄 Updating ${positionTitle}: ${ballotPosition.BallotPosition_DisplayOrder} → ${correctOrder}`);
          
          await prisma.ballotPosition.update({
            where: { id: ballotPosition.id },
            data: { BallotPosition_DisplayOrder: correctOrder }
          });
        } else {
          console.log(`  ✅ ${positionTitle}: ${correctOrder} (correct)`);
        }
      }
    }

    console.log('\n✅ Position order fix completed!');
  } catch (error) {
    console.error('❌ Error fixing position order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPositionOrder();
