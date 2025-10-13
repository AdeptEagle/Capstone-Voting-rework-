"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
async function diagnoseTemplateIssue() {
    try {
        console.log('🔍 Diagnosing template position issues...\n');
        console.log('1️⃣ Checking database templates...');
        const dbTemplates = await prisma.ballotTemplate.findMany({
            where: { BallotTemplate_IsDeleted: false },
            orderBy: { BallotTemplate_CreatedAt: 'asc' }
        });
        console.log(`📊 Found ${dbTemplates.length} templates in database`);
        dbTemplates.forEach((template, index) => {
            console.log(`   ${index + 1}. ${template.BallotTemplate_Name} (${template.id})`);
        });
        console.log('\n2️⃣ Checking default templates...');
        for (const defaultTemplate of default_templates_1.DEFAULT_BALLOT_TEMPLATES) {
            console.log(`\n📋 Template: ${defaultTemplate.name}`);
            console.log(`🆔 ID: ${defaultTemplate.id}`);
            console.log(`📊 Expected positions: ${defaultTemplate.data.positions.length}`);
            console.log('📝 Expected positions:');
            defaultTemplate.data.positions.forEach((pos, index) => {
                console.log(`   ${index + 1}. ${pos.positionTitle} (Order: ${pos.displayOrder}, Required: ${pos.isRequired}, Vote Limit: ${pos.voteLimit})`);
            });
            const dbTemplate = dbTemplates.find(t => t.id === defaultTemplate.id);
            if (!dbTemplate) {
                console.log('❌ NOT FOUND in database');
                continue;
            }
            console.log('✅ Found in database');
            const dbData = dbTemplate.BallotTemplate_Data;
            const dbPositions = dbData.positions || [];
            console.log(`📊 Database positions: ${dbPositions.length}`);
            if (dbPositions.length !== defaultTemplate.data.positions.length) {
                console.log('⚠️ Position count mismatch!');
            }
            console.log('📝 Database positions:');
            dbPositions.forEach((pos, index) => {
                console.log(`   ${index + 1}. ${pos.positionTitle} (Order: ${pos.displayOrder}, Required: ${pos.isRequired}, Vote Limit: ${pos.voteLimit})`);
            });
            const expectedTitles = defaultTemplate.data.positions.map(p => p.positionTitle);
            const dbTitles = dbPositions.map((p) => p.positionTitle);
            const missing = expectedTitles.filter(title => !dbTitles.includes(title));
            const extra = dbTitles.filter((title) => !expectedTitles.includes(title));
            if (missing.length > 0) {
                console.log('❌ Missing positions:', missing);
            }
            if (extra.length > 0) {
                console.log('⚠️ Extra positions:', extra);
            }
            if (missing.length === 0 && extra.length === 0) {
                console.log('✅ All positions match!');
            }
        }
        console.log('\n3️⃣ Checking ballots created from templates...');
        const recentBallots = await prisma.ballot.findMany({
            where: {
                Ballot_CreatedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
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
            }
        });
        console.log(`📊 Recent ballots: ${recentBallots.length}`);
        recentBallots.forEach((ballot, index) => {
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
        console.log('\n4️⃣ Checking all positions in database...');
        const allPositions = await prisma.position.findMany({
            select: {
                id: true,
                Position_Title: true,
                displayOrder: true,
                voteLimit: true,
                _count: {
                    select: {
                        candidates: true,
                        ballotPositions: true
                    }
                }
            },
            orderBy: {
                displayOrder: 'asc'
            }
        });
        console.log(`📊 Total positions in database: ${allPositions.length}`);
        if (allPositions.length > 0) {
            console.log('📝 All positions:');
            allPositions.forEach((pos, index) => {
                console.log(`   ${index + 1}. ${pos.Position_Title} (Order: ${pos.displayOrder}, Vote Limit: ${pos.voteLimit}, Candidates: ${pos._count.candidates}, Ballots: ${pos._count.ballotPositions})`);
            });
        }
        console.log('\n5️⃣ Checking for template-related issues...');
        const templatesWithIssues = dbTemplates.filter(template => {
            const data = template.BallotTemplate_Data;
            return !data.positions || !Array.isArray(data.positions) || data.positions.length === 0;
        });
        if (templatesWithIssues.length > 0) {
            console.log('❌ Templates with missing position data:');
            templatesWithIssues.forEach(template => {
                console.log(`   - ${template.BallotTemplate_Name} (${template.id})`);
            });
        }
        else {
            console.log('✅ All templates have position data');
        }
        const allPositionTitles = allPositions.map(p => p.Position_Title);
        const duplicateTitles = allPositionTitles.filter((title, index) => allPositionTitles.indexOf(title) !== index);
        if (duplicateTitles.length > 0) {
            console.log('⚠️ Duplicate position titles found:', duplicateTitles);
        }
        else {
            console.log('✅ No duplicate position titles');
        }
    }
    catch (error) {
        console.error('❌ Error diagnosing template issue:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
diagnoseTemplateIssue()
    .then(() => {
    console.log('\n✅ Template diagnosis completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Template diagnosis failed:', error);
    process.exit(1);
});
//# sourceMappingURL=diagnose-template-issue.js.map