import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTemplateCreation() {
  try {
    console.log('🧪 Testing template-based ballot creation...');

    // Get the first admin
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      throw new Error('No admin found');
    }

    console.log('👤 Using admin:', admin.Admin_Username);

    // Get a template
    const template = await prisma.ballotTemplate.findFirst({
      where: { BallotTemplate_IsPublic: true }
    });

    if (!template) {
      throw new Error('No public template found');
    }

    console.log('📋 Using template:', template.BallotTemplate_Name);
    console.log('📊 Template data:', template.BallotTemplate_Data);

    // Test the template data structure
    const templateData = template.BallotTemplate_Data as any;
    console.log('📋 Template positions:', templateData.positions);

    // Create ballot manually to test the logic
    const ballotData = {
      Ballot_Title: 'Test Ballot from Template',
      Ballot_Description: 'Testing template-based ballot creation',
      Ballot_StartDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      Ballot_EndDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      Ballot_RequireAllPositions: templateData.requireAllPositions !== false,
      Ballot_ShowResults: templateData.showResults !== false,
      Ballot_ShowLiveResults: templateData.showLiveResults !== false,
      templateId: template.id
    };

    console.log('🏗️ Creating ballot with template data...');
    
    // Create ballot using the same logic as the service
    const ballot = await prisma.$transaction(async (tx) => {
      // Create ballot
      const ballot = await tx.ballot.create({
        data: {
          id: generateId(),
          Ballot_Title: ballotData.Ballot_Title,
          Ballot_Description: ballotData.Ballot_Description || '',
          Ballot_StartDate: ballotData.Ballot_StartDate,
          Ballot_EndDate: ballotData.Ballot_EndDate,
          Ballot_RequireAllPositions: ballotData.Ballot_RequireAllPositions,
          Ballot_ShowResults: ballotData.Ballot_ShowResults,
          Ballot_ShowLiveResults: ballotData.Ballot_ShowLiveResults,
          Ballot_Status: 'DRAFT',
          Ballot_IsActive: false,
          Ballot_CreatedBy: admin.id,
        },
      });

      // Create positions from template if template data exists
      if (templateData && templateData.positions && Array.isArray(templateData.positions)) {
        console.log('📋 Creating positions from template:', templateData.positions.length);
        
        const createdPositions = await Promise.all(
          templateData.positions.map(async (positionData: any) => {
            // Create position
            const position = await tx.position.create({
              data: {
                id: generateId(),
                Position_Title: positionData.positionTitle,
                Position_Description: `Position for ${positionData.positionTitle}`,
                voteLimit: positionData.voteLimit || 1,
                displayOrder: positionData.displayOrder || 1,
              },
            });

            // Link position to ballot
            await tx.ballotPosition.create({
              data: {
                id: generateId(),
                BallotPosition_BallotId: ballot.id,
                BallotPosition_PositionId: position.id,
                BallotPosition_DisplayOrder: positionData.displayOrder || 1,
                BallotPosition_IsRequired: positionData.isRequired !== false,
              },
            });

            return position;
          })
        );

        console.log(`✅ Created ${createdPositions.length} positions from template`);
      }
      
      return ballot;
    });

    console.log('✅ Ballot created:', ballot.id);

    // Check if positions were created
    const ballotWithPositions = await prisma.ballot.findUnique({
      where: { id: ballot.id },
      include: {
        ballotPositions: {
          include: {
            position: true
          }
        }
      }
    });

    console.log('📊 Ballot positions created:', ballotWithPositions?.ballotPositions.length);
    ballotWithPositions?.ballotPositions.forEach((bp, index) => {
      console.log(`   ${index + 1}. ${bp.position.Position_Title} (Required: ${bp.BallotPosition_IsRequired})`);
    });

    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate ID in format xxxx-xxxxx
function generateId(): string {
  const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${firstPart}-${secondPart}`;
}

testTemplateCreation()
  .then(() => {
    console.log('✅ Template creation test passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Template creation test failed:', error);
    process.exit(1);
  });
