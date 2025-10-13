"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testTemplateCreation() {
    try {
        console.log('🧪 Testing template-based ballot creation...');
        const admin = await prisma.admin.findFirst();
        if (!admin) {
            throw new Error('No admin found');
        }
        console.log('👤 Using admin:', admin.Admin_Username);
        const template = await prisma.ballotTemplate.findFirst({
            where: { BallotTemplate_IsPublic: true }
        });
        if (!template) {
            throw new Error('No public template found');
        }
        console.log('📋 Using template:', template.BallotTemplate_Name);
        console.log('📊 Template data:', template.BallotTemplate_Data);
        const templateData = template.BallotTemplate_Data;
        console.log('📋 Template positions:', templateData.positions);
        const ballotData = {
            Ballot_Title: 'Test Ballot from Template',
            Ballot_Description: 'Testing template-based ballot creation',
            Ballot_StartDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            Ballot_EndDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
            Ballot_RequireAllPositions: templateData.requireAllPositions !== false,
            Ballot_ShowResults: templateData.showResults !== false,
            Ballot_ShowLiveResults: templateData.showLiveResults !== false,
            templateId: template.id
        };
        console.log('🏗️ Creating ballot with template data...');
        const ballot = await prisma.$transaction(async (tx) => {
            const ballot = await tx.ballot.create({
                data: {
                    id: generateId(),
                    Ballot_Title: ballotData.Ballot_Title,
                    Ballot_Description: ballotData.Ballot_Description || '',
                    Ballot_StartDate: ballotData.Ballot_StartDate,
                    Ballot_EndDate: ballotData.Ballot_EndDate,
                    Ballot_RequireAllPositions: ballotData.Ballot_RequireAllPositions,
                    Ballot_ShowResults: ballotData.Ballot_ShowResults,
                    Ballot_ShowLiveResults: ballotData.Ballot_ShowLiveResults,
                    Ballot_Status: 'DRAFT',
                    Ballot_IsActive: false,
                    Ballot_CreatedBy: admin.id,
                },
            });
            if (templateData && templateData.positions && Array.isArray(templateData.positions)) {
                console.log('📋 Creating positions from template:', templateData.positions.length);
                const createdPositions = await Promise.all(templateData.positions.map(async (positionData) => {
                    const position = await tx.position.create({
                        data: {
                            id: generateId(),
                            Position_Title: positionData.positionTitle,
                            Position_Description: `Position for ${positionData.positionTitle}`,
                            voteLimit: positionData.voteLimit || 1,
                            displayOrder: positionData.displayOrder || 1,
                        },
                    });
                    await tx.ballotPosition.create({
                        data: {
                            id: generateId(),
                            BallotPosition_BallotId: ballot.id,
                            BallotPosition_PositionId: position.id,
                            BallotPosition_DisplayOrder: positionData.displayOrder || 1,
                            BallotPosition_IsRequired: positionData.isRequired !== false,
                        },
                    });
                    return position;
                }));
                console.log(`✅ Created ${createdPositions.length} positions from template`);
            }
            return ballot;
        });
        console.log('✅ Ballot created:', ballot.id);
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
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
function generateId() {
    const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${firstPart}-${secondPart}`;
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
//# sourceMappingURL=test-template-creation.js.map