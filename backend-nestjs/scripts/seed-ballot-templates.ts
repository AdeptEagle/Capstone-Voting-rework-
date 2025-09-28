import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBallotTemplates() {
  try {
    console.log('🌱 Starting ballot template seeding...');

    // Get the first admin to use as creator
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      throw new Error('No admin found. Please create an admin first.');
    }

    console.log('👤 Using admin:', admin.Admin_Username);

    // Template 1: Supreme Student Council Template
    const supremeStudentCouncilTemplate = {
      id: 'template_supreme_student_council',
      BallotTemplate_Name: 'Supreme Student Council Template',
      BallotTemplate_Description: 'Template for Supreme Student Council elections with President, Vice-President, Secretary, Auditor, Treasurer, PIOs, and Senators',
      BallotTemplate_Data: {
        title: 'Supreme Student Council Election',
        description: 'Election for Supreme Student Council positions',
        positions: [
          { positionTitle: 'President', displayOrder: 1, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Vice-President', displayOrder: 2, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Secretary', displayOrder: 3, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Auditor', displayOrder: 4, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Treasurer', displayOrder: 5, isRequired: true, voteLimit: 1 },
          { positionTitle: 'PIO Internal', displayOrder: 6, isRequired: true, voteLimit: 1 },
          { positionTitle: 'PIO External', displayOrder: 7, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Senator', displayOrder: 8, isRequired: true, voteLimit: 8 },
        ],
        requireAllPositions: true,
        showResults: true,
        showLiveResults: true,
        maxVotesPerUser: 1,
        allowMultipleVotes: false,
      },
      BallotTemplate_IsPublic: true,
      BallotTemplate_CreatedBy: admin.id,
    };

    // Template 2: Department Officers Template
    const departmentOfficersTemplate = {
      id: 'template_department_officers',
      BallotTemplate_Name: 'Department Officers Template',
      BallotTemplate_Description: 'Template for Department Officer elections with President, Vice-Presidents, Secretary, Auditor, Treasurer, PIOs, and Year Representatives',
      BallotTemplate_Data: {
        title: 'Department Officers Election',
        description: 'Election for Department Officer positions',
        positions: [
          { positionTitle: 'President', displayOrder: 1, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Internal Vice-President', displayOrder: 2, isRequired: true, voteLimit: 1 },
          { positionTitle: 'External Vice-President', displayOrder: 3, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Secretary', displayOrder: 4, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Auditor', displayOrder: 5, isRequired: true, voteLimit: 1 },
          { positionTitle: 'Treasurer', displayOrder: 6, isRequired: true, voteLimit: 1 },
          { positionTitle: 'PIO Internal', displayOrder: 7, isRequired: true, voteLimit: 1 },
          { positionTitle: 'PIO External', displayOrder: 8, isRequired: true, voteLimit: 1 },
          { positionTitle: '1st Year Representative', displayOrder: 9, isRequired: true, voteLimit: 1 },
          { positionTitle: '2nd Year Representative', displayOrder: 10, isRequired: true, voteLimit: 1 },
          { positionTitle: '3rd Year Representative', displayOrder: 11, isRequired: true, voteLimit: 1 },
          { positionTitle: '4th Year Representative', displayOrder: 12, isRequired: true, voteLimit: 1 },
        ],
        requireAllPositions: true,
        showResults: true,
        showLiveResults: true,
        maxVotesPerUser: 1,
        allowMultipleVotes: false,
      },
      BallotTemplate_IsPublic: true,
      BallotTemplate_CreatedBy: admin.id,
    };

    // Create or update templates
    const template1 = await prisma.ballotTemplate.upsert({
      where: { id: supremeStudentCouncilTemplate.id },
      update: supremeStudentCouncilTemplate,
      create: supremeStudentCouncilTemplate,
    });

    const template2 = await prisma.ballotTemplate.upsert({
      where: { id: departmentOfficersTemplate.id },
      update: departmentOfficersTemplate,
      create: departmentOfficersTemplate,
    });

    console.log('✅ Ballot templates seeded successfully!');
    console.log('📋 Template 1:', template1.BallotTemplate_Name);
    console.log('📋 Template 2:', template2.BallotTemplate_Name);
    console.log('🎯 Template 1 Positions:', (template1.BallotTemplate_Data as any).positions.length);
    console.log('🎯 Template 2 Positions:', (template2.BallotTemplate_Data as any).positions.length);

  } catch (error) {
    console.error('❌ Error seeding ballot templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedBallotTemplates()
  .then(() => {
    console.log('🎉 Ballot template seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ballot template seeding failed:', error);
    process.exit(1);
  });