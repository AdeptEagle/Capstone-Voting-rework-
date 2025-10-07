import { PrismaClient } from '@prisma/client';
import { BallotTemplateService } from '../src/ballot-template/ballot-template.service';
import { BallotService } from '../src/ballot/ballot.service';

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

    // Create ballot from template
    const ballotTemplateService = new BallotTemplateService(prisma);
    const ballotService = new BallotService(prisma);

    const ballotData = {
      title: 'Test Ballot from Template',
      description: 'Testing template-based ballot creation',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      candidateIds: []
    };

    console.log('🏗️ Creating ballot from template...');
    const ballot = await ballotTemplateService.createBallotFromTemplate(
      template.id,
      ballotData,
      admin.id
    );

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

testTemplateCreation()
  .then(() => {
    console.log('✅ Template creation test passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Template creation test failed:', error);
    process.exit(1);
  });
