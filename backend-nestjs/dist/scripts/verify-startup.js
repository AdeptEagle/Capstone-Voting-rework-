"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
async function verifyStartup() {
    try {
        console.log('🔍 Verifying application startup state...\n');
        const admin = await prisma.admin.findFirst();
        if (!admin) {
            console.log('❌ No admin found - this will prevent template initialization');
            return;
        }
        console.log(`✅ Admin found: ${admin.Admin_Username}`);
        const templates = await prisma.ballotTemplate.findMany({
            where: {
                id: {
                    in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                }
            }
        });
        console.log(`📊 Templates found: ${templates.length}/${default_templates_1.DEFAULT_BALLOT_TEMPLATES.length}`);
        if (templates.length === default_templates_1.DEFAULT_BALLOT_TEMPLATES.length) {
            console.log('✅ All templates are present');
        }
        else {
            console.log('⚠️ Some templates are missing');
            const missingTemplates = default_templates_1.DEFAULT_BALLOT_TEMPLATES.filter(t => !templates.some(template => template.id === t.id));
            console.log('Missing templates:');
            missingTemplates.forEach(t => console.log(`   - ${t.name}`));
        }
        console.log('\n📋 Template position verification:');
        for (const template of templates) {
            const data = template.BallotTemplate_Data;
            const positionCount = (data.positions || []).length;
            console.log(`   ${template.BallotTemplate_Name}: ${positionCount} positions`);
            if (positionCount === 0) {
                console.log(`   ⚠️ ${template.BallotTemplate_Name} has no positions!`);
            }
        }
        const departmentTemplate = templates.find(t => t.id === 'template_department_officers');
        if (departmentTemplate) {
            const data = departmentTemplate.BallotTemplate_Data;
            const yearReps = (data.positions || []).filter((pos) => pos.positionTitle.includes('Year Representative'));
            console.log(`\n🎯 Department Officers Template Year Representatives: ${yearReps.length}`);
            if (yearReps.length === 4) {
                console.log('✅ All 4 Year Representatives are present');
            }
            else {
                console.log('❌ Year Representatives are missing!');
            }
        }
        console.log('\n📊 Startup Status:');
        console.log(`   Admin: ${admin ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Templates: ${templates.length}/${default_templates_1.DEFAULT_BALLOT_TEMPLATES.length} ${templates.length === default_templates_1.DEFAULT_BALLOT_TEMPLATES.length ? '✅' : '❌'}`);
        if (templates.length === default_templates_1.DEFAULT_BALLOT_TEMPLATES.length && admin) {
            console.log('\n🎉 Application is ready for use!');
            console.log('✅ Templates will be automatically available');
            console.log('✅ Positions will be created automatically when using templates');
        }
        else {
            console.log('\n⚠️ Application may not be fully ready');
            console.log('Run: npm run ensure:templates');
        }
    }
    catch (error) {
        console.error('❌ Error verifying startup:', error);
        throw error;
    }
    finally {
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
//# sourceMappingURL=verify-startup.js.map