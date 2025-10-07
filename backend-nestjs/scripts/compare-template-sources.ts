import { PrismaClient } from '@prisma/client';
import { DEFAULT_BALLOT_TEMPLATES } from '../src/templates/default-templates';

const prisma = new PrismaClient();

async function compareTemplateSources() {
  try {
    console.log('🔍 Comparing template sources...\n');

    // Check what's in the database
    const dbTemplates = await prisma.ballotTemplate.findMany({
      where: {
        BallotTemplate_IsDeleted: false
      },
      orderBy: {
        BallotTemplate_CreatedAt: 'asc'
      }
    });

    console.log(`📊 Templates in database: ${dbTemplates.length}`);
    
    // Compare with our default templates
    console.log(`📊 Default templates defined: ${DEFAULT_BALLOT_TEMPLATES.length}`);
    
    console.log('\n📋 Template Comparison:');
    console.log('─'.repeat(80));
    
    for (const defaultTemplate of DEFAULT_BALLOT_TEMPLATES) {
      console.log(`\n🔍 Checking: ${defaultTemplate.name}`);
      console.log(`🆔 ID: ${defaultTemplate.id}`);
      
      const dbTemplate = dbTemplates.find(t => t.id === defaultTemplate.id);
      
      if (!dbTemplate) {
        console.log('❌ NOT FOUND in database');
        continue;
      }
      
      console.log('✅ Found in database');
      
      // Compare positions
      const defaultPositions = defaultTemplate.data.positions;
      const dbData = dbTemplate.BallotTemplate_Data as any;
      const dbPositions = dbData.positions || [];
      
      console.log(`📊 Default positions: ${defaultPositions.length}`);
      console.log(`📊 Database positions: ${dbPositions.length}`);
      
      if (defaultPositions.length !== dbPositions.length) {
        console.log('⚠️ Position count mismatch!');
      }
      
      // Check each position
      console.log('\n📝 Position comparison:');
      const maxLength = Math.max(defaultPositions.length, dbPositions.length);
      
      for (let i = 0; i < maxLength; i++) {
        const defaultPos = defaultPositions[i];
        const dbPos = dbPositions[i];
        
        if (!defaultPos) {
          console.log(`   ${i + 1}. ❌ Extra in DB: ${dbPos?.positionTitle || 'Unknown'}`);
        } else if (!dbPos) {
          console.log(`   ${i + 1}. ❌ Missing in DB: ${defaultPos.positionTitle}`);
        } else {
          const titleMatch = defaultPos.positionTitle === dbPos.positionTitle;
          const orderMatch = defaultPos.displayOrder === dbPos.displayOrder;
          const requiredMatch = defaultPos.isRequired === dbPos.isRequired;
          const voteLimitMatch = defaultPos.voteLimit === dbPos.voteLimit;
          
          const status = titleMatch && orderMatch && requiredMatch && voteLimitMatch ? '✅' : '⚠️';
          
          console.log(`   ${i + 1}. ${status} ${defaultPos.positionTitle}`);
          
          if (!titleMatch) console.log(`      Title: "${defaultPos.positionTitle}" vs "${dbPos.positionTitle}"`);
          if (!orderMatch) console.log(`      Order: ${defaultPos.displayOrder} vs ${dbPos.displayOrder}`);
          if (!requiredMatch) console.log(`      Required: ${defaultPos.isRequired} vs ${dbPos.isRequired}`);
          if (!voteLimitMatch) console.log(`      Vote Limit: ${defaultPos.voteLimit} vs ${dbPos.voteLimit}`);
        }
      }
      
      console.log('─'.repeat(50));
    }

    // Check for any templates in DB that aren't in our defaults
    console.log('\n🔍 Extra templates in database:');
    const extraTemplates = dbTemplates.filter(dbT => 
      !DEFAULT_BALLOT_TEMPLATES.some(dt => dt.id === dbT.id)
    );
    
    if (extraTemplates.length > 0) {
      extraTemplates.forEach(template => {
        console.log(`   - ${template.BallotTemplate_Name} (${template.id})`);
      });
    } else {
      console.log('   No extra templates found');
    }

  } catch (error) {
    console.error('❌ Error comparing template sources:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

compareTemplateSources()
  .then(() => {
    console.log('\n✅ Template comparison completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Template comparison failed:', error);
    process.exit(1);
  });
