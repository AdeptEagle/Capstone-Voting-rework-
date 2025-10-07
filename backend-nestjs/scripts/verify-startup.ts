import { PrismaClient } from '@prisma/client';
import { DEFAULT_BALLOT_TEMPLATES } from '../src/templates/default-templates';

const prisma = new PrismaClient();

async function verifyStartup() {
  try {
    console.log('🔍 Verifying application startup state...\n');

    // Check if admin exists
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      console.log('❌ No admin found - this will prevent template initialization');
      return;
    }
    console.log(`✅ Admin found: ${admin.Admin_Username}`);

    // Check templates
    const templates = await prisma.ballotTemplate.findMany({
      where: {
        id: {
          in: DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
        }
      }
    });

    console.log(`📊 Templates found: ${templates.length}/${DEFAULT_BALLOT_TEMPLATES.length}`);

    if (templates.length === DEFAULT_BALLOT_TEMPLATES.length) {
      console.log('✅ All templates are present');
    } else {
      console.log('⚠️ Some templates are missing');
      const missingTemplates = DEFAULT_BALLOT_TEMPLATES.filter(
        t => !templates.some(template => template.id === t.id)
      );
      console.log('Missing templates:');
      missingTemplates.forEach(t => console.log(`   - ${t.name}`));
    }

    // Check each template's position data
    console.log('\n📋 Template position verification:');
    for (const template of templates) {
      const data = template.BallotTemplate_Data as any;
      const positionCount = (data.positions || []).length;
      console.log(`   ${template.BallotTemplate_Name}: ${positionCount} positions`);
      
      if (positionCount === 0) {
        console.log(`   ⚠️ ${template.BallotTemplate_Name} has no positions!`);
      }
    }

    // Check for Year Representatives in Department template
    const departmentTemplate = templates.find(t => t.id === 'template_department_officers');
    if (departmentTemplate) {
      const data = departmentTemplate.BallotTemplate_Data as any;
      const yearReps = (data.positions || []).filter((pos: any) => 
        pos.positionTitle.includes('Year Representative')
      );
      console.log(`\n🎯 Department Officers Template Year Representatives: ${yearReps.length}`);
      if (yearReps.length === 4) {
        console.log('✅ All 4 Year Representatives are present');
      } else {
        console.log('❌ Year Representatives are missing!');
      }
    }

    // Overall status
    console.log('\n📊 Startup Status:');
    console.log(`   Admin: ${admin ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Templates: ${templates.length}/${DEFAULT_BALLOT_TEMPLATES.length} ${templates.length === DEFAULT_BALLOT_TEMPLATES.length ? '✅' : '❌'}`);
    
    if (templates.length === DEFAULT_BALLOT_TEMPLATES.length && admin) {
      console.log('\n🎉 Application is ready for use!');
      console.log('✅ Templates will be automatically available');
      console.log('✅ Positions will be created automatically when using templates');
    } else {
      console.log('\n⚠️ Application may not be fully ready');
      console.log('Run: npm run ensure:templates');
    }

  } catch (error) {
    console.error('❌ Error verifying startup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyStartup()
  .then(() => {
    console.log('\n✅ Startup verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Startup verification failed:', error);
    process.exit(1);
  });
