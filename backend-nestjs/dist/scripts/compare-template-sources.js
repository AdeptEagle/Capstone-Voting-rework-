"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
async function compareTemplateSources() {
    try {
        console.log('🔍 Comparing template sources...\n');
        const dbTemplates = await prisma.ballotTemplate.findMany({
            where: {
                BallotTemplate_IsDeleted: false
            },
            orderBy: {
                BallotTemplate_CreatedAt: 'asc'
            }
        });
        console.log(`📊 Templates in database: ${dbTemplates.length}`);
        console.log(`📊 Default templates defined: ${default_templates_1.DEFAULT_BALLOT_TEMPLATES.length}`);
        console.log('\n📋 Template Comparison:');
        console.log('─'.repeat(80));
        for (const defaultTemplate of default_templates_1.DEFAULT_BALLOT_TEMPLATES) {
            console.log(`\n🔍 Checking: ${defaultTemplate.name}`);
            console.log(`🆔 ID: ${defaultTemplate.id}`);
            const dbTemplate = dbTemplates.find(t => t.id === defaultTemplate.id);
            if (!dbTemplate) {
                console.log('❌ NOT FOUND in database');
                continue;
            }
            console.log('✅ Found in database');
            const defaultPositions = defaultTemplate.data.positions;
            const dbData = dbTemplate.BallotTemplate_Data;
            const dbPositions = dbData.positions || [];
            console.log(`📊 Default positions: ${defaultPositions.length}`);
            console.log(`📊 Database positions: ${dbPositions.length}`);
            if (defaultPositions.length !== dbPositions.length) {
                console.log('⚠️ Position count mismatch!');
            }
            console.log('\n📝 Position comparison:');
            const maxLength = Math.max(defaultPositions.length, dbPositions.length);
            for (let i = 0; i < maxLength; i++) {
                const defaultPos = defaultPositions[i];
                const dbPos = dbPositions[i];
                if (!defaultPos) {
                    console.log(`   ${i + 1}. ❌ Extra in DB: ${dbPos?.positionTitle || 'Unknown'}`);
                }
                else if (!dbPos) {
                    console.log(`   ${i + 1}. ❌ Missing in DB: ${defaultPos.positionTitle}`);
                }
                else {
                    const titleMatch = defaultPos.positionTitle === dbPos.positionTitle;
                    const orderMatch = defaultPos.displayOrder === dbPos.displayOrder;
                    const requiredMatch = defaultPos.isRequired === dbPos.isRequired;
                    const voteLimitMatch = defaultPos.voteLimit === dbPos.voteLimit;
                    const status = titleMatch && orderMatch && requiredMatch && voteLimitMatch ? '✅' : '⚠️';
                    console.log(`   ${i + 1}. ${status} ${defaultPos.positionTitle}`);
                    if (!titleMatch)
                        console.log(`      Title: "${defaultPos.positionTitle}" vs "${dbPos.positionTitle}"`);
                    if (!orderMatch)
                        console.log(`      Order: ${defaultPos.displayOrder} vs ${dbPos.displayOrder}`);
                    if (!requiredMatch)
                        console.log(`      Required: ${defaultPos.isRequired} vs ${dbPos.isRequired}`);
                    if (!voteLimitMatch)
                        console.log(`      Vote Limit: ${defaultPos.voteLimit} vs ${dbPos.voteLimit}`);
                }
            }
            console.log('─'.repeat(50));
        }
        console.log('\n🔍 Extra templates in database:');
        const extraTemplates = dbTemplates.filter(dbT => !default_templates_1.DEFAULT_BALLOT_TEMPLATES.some(dt => dt.id === dbT.id));
        if (extraTemplates.length > 0) {
            extraTemplates.forEach(template => {
                console.log(`   - ${template.BallotTemplate_Name} (${template.id})`);
            });
        }
        else {
            console.log('   No extra templates found');
        }
    }
    catch (error) {
        console.error('❌ Error comparing template sources:', error);
        throw error;
    }
    finally {
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
//# sourceMappingURL=compare-template-sources.js.map