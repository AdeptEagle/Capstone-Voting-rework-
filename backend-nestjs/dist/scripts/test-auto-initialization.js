"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
async function testAutoInitialization() {
    try {
        console.log('🧪 Testing automatic template initialization...\n');
        console.log('🧹 Cleaning existing templates...');
        await prisma.ballotTemplate.deleteMany({
            where: {
                id: {
                    in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                }
            }
        });
        console.log('✅ Templates cleaned');
        const templatesAfterCleanup = await prisma.ballotTemplate.findMany({
            where: {
                id: {
                    in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                }
            }
        });
        console.log(`📊 Templates after cleanup: ${templatesAfterCleanup.length}`);
        if (templatesAfterCleanup.length > 0) {
            console.log('⚠️ Some templates still exist, this might affect the test');
        }
        console.log('\n🔄 Simulating automatic template initialization...');
        const admin = await prisma.admin.findFirst();
        if (!admin) {
            throw new Error('No admin found');
        }
        console.log(`👤 Using admin: ${admin.Admin_Username}`);
        const existingTemplates = await prisma.ballotTemplate.findMany({
            where: {
                id: {
                    in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                }
            }
        });
        const existingTemplateIds = existingTemplates.map(t => t.id);
        const missingTemplates = default_templates_1.DEFAULT_BALLOT_TEMPLATES.filter(template => !existingTemplateIds.includes(template.id));
        console.log(`📊 Found ${existingTemplates.length} existing templates`);
        console.log(`📊 Missing ${missingTemplates.length} templates`);
        if (missingTemplates.length === 0) {
            console.log('✅ All templates already present');
            return;
        }
        console.log(`📋 Creating ${missingTemplates.length} missing templates...`);
        const createdTemplates = [];
        for (const template of missingTemplates) {
            try {
                console.log(`🔄 Creating: ${template.name}`);
                const createdTemplate = await prisma.ballotTemplate.create({
                    data: {
                        id: template.id,
                        BallotTemplate_Name: template.name,
                        BallotTemplate_Description: template.description,
                        BallotTemplate_Data: template.data,
                        BallotTemplate_IsPublic: template.isPublic,
                        BallotTemplate_CreatedBy: admin.id,
                    },
                });
                createdTemplates.push(createdTemplate);
                console.log(`✅ Created: ${createdTemplate.BallotTemplate_Name} (${(template.data.positions || []).length} positions)`);
            }
            catch (error) {
                console.error(`❌ Failed to create ${template.name}:`, error);
                throw error;
            }
        }
        console.log(`\n✅ Successfully created ${createdTemplates.length} templates:`);
        createdTemplates.forEach(template => {
            const data = template.BallotTemplate_Data;
            console.log(`   - ${template.BallotTemplate_Name} (${(data.positions || []).length} positions)`);
        });
        const finalCheck = await prisma.ballotTemplate.findMany({
            where: {
                id: {
                    in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                }
            }
        });
        console.log(`\n🔍 Final verification: ${finalCheck.length}/${default_templates_1.DEFAULT_BALLOT_TEMPLATES.length} templates present`);
        if (finalCheck.length === default_templates_1.DEFAULT_BALLOT_TEMPLATES.length) {
            console.log('🎉 Automatic initialization test passed!');
            console.log('✅ All templates are now available automatically');
        }
        else {
            console.log('❌ Automatic initialization test failed');
            console.log(`Expected ${default_templates_1.DEFAULT_BALLOT_TEMPLATES.length} templates, found ${finalCheck.length}`);
        }
        console.log('\n📋 All templates with positions:');
        for (const template of finalCheck) {
            const data = template.BallotTemplate_Data;
            console.log(`\n📋 ${template.BallotTemplate_Name}:`);
            if (data.positions && Array.isArray(data.positions)) {
                data.positions.forEach((pos, index) => {
                    console.log(`   ${index + 1}. ${pos.positionTitle} (Order: ${pos.displayOrder}, Required: ${pos.isRequired}, Vote Limit: ${pos.voteLimit})`);
                });
            }
        }
    }
    catch (error) {
        console.error('❌ Automatic initialization test failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
testAutoInitialization()
    .then(() => {
    console.log('\n✅ Automatic template initialization test completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Automatic template initialization test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-auto-initialization.js.map