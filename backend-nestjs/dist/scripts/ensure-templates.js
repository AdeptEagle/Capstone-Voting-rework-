"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
async function ensureTemplates() {
    try {
        console.log('🔍 Ensuring ballot templates are available...\n');
        const admin = await prisma.admin.findFirst();
        if (!admin) {
            throw new Error('No admin found. Please create an admin first.');
        }
        console.log(`👤 Using admin: ${admin.Admin_Username}`);
        const existingTemplates = await prisma.ballotTemplate.findMany({
            where: {
                id: {
                    in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                }
            }
        });
        console.log(`📊 Found ${existingTemplates.length} existing templates`);
        const existingTemplateIds = existingTemplates.map(t => t.id);
        const missingTemplates = default_templates_1.DEFAULT_BALLOT_TEMPLATES.filter(template => !existingTemplateIds.includes(template.id));
        console.log(`📊 Missing ${missingTemplates.length} templates`);
        if (missingTemplates.length === 0) {
            console.log('✅ All ballot templates are already present!');
            return;
        }
        console.log(`📋 Creating ${missingTemplates.length} missing templates...\n`);
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
                console.log(`✅ Created: ${createdTemplate.BallotTemplate_Name}`);
                console.log(`   📊 Positions: ${(template.data.positions || []).length}`);
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
            console.log('🎉 All templates are now available!');
        }
        else {
            console.log('⚠️ Some templates may still be missing');
        }
    }
    catch (error) {
        console.error('❌ Error ensuring templates:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
ensureTemplates()
    .then(() => {
    console.log('\n✅ Template initialization completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Template initialization failed:', error);
    process.exit(1);
});
//# sourceMappingURL=ensure-templates.js.map