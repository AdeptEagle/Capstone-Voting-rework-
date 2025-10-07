import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDepartmentTemplate() {
  try {
    console.log('🧪 Testing Department Officers Template specifically...\n');

    // Get the first admin
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      throw new Error('No admin found');
    }

    console.log('👤 Using admin:', admin.Admin_Username);

    // Get the Department Officers Template specifically
    const template = await prisma.ballotTemplate.findUnique({
      where: { id: 'template_department_officers' }
    });

    if (!template) {
      throw new Error('Department Officers Template not found');
    }

    console.log('📋 Using template:', template.BallotTemplate_Name);
    console.log('📊 Template data:', template.BallotTemplate_Data);

    // Test the template data structure
    const templateData = template.BallotTemplate_Data as any;
    console.log('📋 Template positions:', templateData.positions);

    // Create ballot manually to test the logic
    const ballotData = {
      Ballot_Title: 'Test Department Officers Ballot',
      Ballot_Description: 'Testing Department Officers template with Year Representatives',
      Ballot_StartDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      Ballot_EndDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      Ballot_RequireAllPositions: templateData.requireAllPositions !== false,
      Ballot_ShowResults: templateData.showResults !== false,
      Ballot_ShowLiveResults: templateData.showLiveResults !== false,
      templateId: template.id
    };

    console.log('🏗️ Creating ballot with Department Officers template data...');
    
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
            // Check if position already exists
            let position = await tx.position.findFirst({
              where: {
                Position_Title: positionData.positionTitle,
                voteLimit: positionData.voteLimit || 1
              }
            });

            // Create position only if it doesn't exist
            if (!position) {
              console.log(`🆕 Creating new position: ${positionData.positionTitle}`);
              position = await tx.position.create({
                data: {
                  id: generateId(),
                  Position_Title: positionData.positionTitle,
                  Position_Description: `Position for ${positionData.positionTitle}`,
                  voteLimit: positionData.voteLimit || 1,
                  displayOrder: positionData.displayOrder || 1,
                },
              });
            } else {
              console.log(`♻️ Reusing existing position: ${positionData.positionTitle}`);
            }

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

        console.log(`✅ Processed ${createdPositions.length} positions from template`);
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
    console.log('📝 Ballot positions:');
    ballotWithPositions?.ballotPositions.forEach((bp, index) => {
      console.log(`   ${index + 1}. ${bp.position.Position_Title} (Required: ${bp.BallotPosition_IsRequired})`);
    });

    // Check specifically for Year Representatives
    const yearReps = ballotWithPositions?.ballotPositions.filter(bp => 
      bp.position.Position_Title.includes('Year Representative')
    ) || [];

    console.log(`\n🎯 Year Representatives found: ${yearReps.length}`);
    yearReps.forEach((bp, index) => {
      console.log(`   ${index + 1}. ${bp.position.Position_Title}`);
    });

    if (yearReps.length === 4) {
      console.log('✅ All 4 Year Representatives are present!');
    } else {
      console.log(`❌ Expected 4 Year Representatives, found ${yearReps.length}`);
    }

    console.log('🎉 Department Officers template test completed!');

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

testDepartmentTemplate()
  .then(() => {
    console.log('✅ Department Officers template test passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Department Officers template test failed:', error);
    process.exit(1);
  });
