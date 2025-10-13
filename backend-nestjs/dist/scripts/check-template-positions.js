"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
async function checkTemplatePositions() {
    try {
        console.log('🔍 Checking template positions...\n');
        for (const template of default_templates_1.DEFAULT_BALLOT_TEMPLATES) {
            console.log(`📋 Template: ${template.name}`);
            console.log(`🆔 Template ID: ${template.id}`);
            console.log(`📊 Expected Positions: ${template.data.positions.length}`);
            console.log('📝 Expected positions:');
            template.data.positions.forEach((pos, index) => {
                console.log(`   ${index + 1}. ${pos.positionTitle} (Order: ${pos.displayOrder}, Required: ${pos.isRequired}, Vote Limit: ${pos.voteLimit})`);
            });
            const dbTemplate = await prisma.ballotTemplate.findUnique({
                where: { id: template.id }
            });
            if (!dbTemplate) {
                console.log('❌ Template not found in database!');
                continue;
            }
            console.log('✅ Template found in database');
            const templateData = dbTemplate.BallotTemplate_Data;
            console.log(`📊 Database positions: ${templateData.positions?.length || 0}`);
            if (templateData.positions) {
                console.log('📝 Database positions:');
                templateData.positions.forEach((pos, index) => {
                    console.log(`   ${index + 1}. ${pos.positionTitle} (Order: ${pos.displayOrder}, Required: ${pos.isRequired}, Vote Limit: ${pos.voteLimit})`);
                });
            }
            const expectedTitles = template.data.positions.map(p => p.positionTitle);
            const dbTitles = templateData.positions?.map((p) => p.positionTitle) || [];
            const missingPositions = expectedTitles.filter(title => !dbTitles.includes(title));
            const extraPositions = dbTitles.filter((title) => !expectedTitles.includes(title));
            if (missingPositions.length > 0) {
                console.log('❌ Missing positions:', missingPositions);
            }
            if (extraPositions.length > 0) {
                console.log('⚠️ Extra positions:', extraPositions);
            }
            if (missingPositions.length === 0 && extraPositions.length === 0) {
                console.log('✅ All positions match!');
            }
            console.log('─'.repeat(50));
        }
        console.log('\n🔍 Checking existing positions in database...');
        const existingPositions = await prisma.position.findMany({
            select: {
                id: true,
                Position_Title: true,
                displayOrder: true,
                voteLimit: true
            },
            orderBy: {
                displayOrder: 'asc'
            }
        });
        console.log(`📊 Total positions in database: ${existingPositions.length}`);
        if (existingPositions.length > 0) {
            console.log('📝 Existing positions:');
            existingPositions.forEach((pos, index) => {
                console.log(`   ${index + 1}. ${pos.Position_Title} (Order: ${pos.displayOrder}, Vote Limit: ${pos.voteLimit})`);
            });
        }
        console.log('\n🔍 Checking ballots created from templates...');
        const ballotsFromTemplates = await prisma.ballot.findMany({
            where: {
                Ballot_CreatedBy: {
                    not: null
                }
            },
            include: {
                ballotPositions: {
                    include: {
                        position: true
                    }
                }
            },
            orderBy: {
                Ballot_CreatedAt: 'desc'
            },
            take: 5
        });
        console.log(`📊 Recent ballots: ${ballotsFromTemplates.length}`);
        ballotsFromTemplates.forEach((ballot, index) => {
            console.log(`\n📋 Ballot ${index + 1}: ${ballot.Ballot_Title}`);
            console.log(`   🆔 ID: ${ballot.id}`);
            console.log(`   📅 Created: ${ballot.Ballot_CreatedAt.toISOString()}`);
            console.log(`   📊 Positions: ${ballot.ballotPositions.length}`);
            if (ballot.ballotPositions.length > 0) {
                console.log('   📝 Ballot positions:');
                ballot.ballotPositions.forEach((bp, posIndex) => {
                    console.log(`      ${posIndex + 1}. ${bp.position.Position_Title} (Required: ${bp.BallotPosition_IsRequired})`);
                });
            }
        });
    }
    catch (error) {
        console.error('❌ Error checking template positions:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
checkTemplatePositions()
    .then(() => {
    console.log('\n✅ Template position check completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Template position check failed:', error);
    process.exit(1);
});
//# sourceMappingURL=check-template-positions.js.map