"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function generatePositionId(positionTitle) {
    const positionIdMap = {
        'President': 'PRES',
        'Vice-President': 'V-PRES',
        'Secretary': 'SEC',
        'Auditor': 'AUD',
        'Treasurer': 'TREAS',
        'PIO Internal': 'PIO-INT',
        'PIO External': 'PIO-EXT',
        'Senator': 'SEN',
        'Internal Vice-President': 'INT-VP',
        'External Vice-President': 'EXT-VP',
        '1st Year Representative': '1YR-REP',
        '2nd Year Representative': '2YR-REP',
        '3rd Year Representative': '3YR-REP',
        '4th Year Representative': '4YR-REP',
        'Public Relations Officer': 'PRO'
    };
    if (positionIdMap[positionTitle]) {
        return positionIdMap[positionTitle];
    }
    const words = positionTitle.split(' ');
    const id = words.map(word => word.substring(0, 3)).join('').toUpperCase();
    return id.substring(0, 8);
}
function generateId() {
    const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${firstPart}-${secondPart}`;
}
async function testPositionInitialization() {
    try {
        console.log('🧪 Testing position initialization...\n');
        console.log('🧹 Clearing existing positions...');
        await prisma.vote.deleteMany();
        console.log('✅ Votes cleared');
        await prisma.ballotResultDetails.deleteMany();
        await prisma.ballotResults.deleteMany();
        console.log('✅ Ballot results cleared');
        await prisma.ballotCandidate.deleteMany();
        console.log('✅ Ballot candidates cleared');
        await prisma.ballotPosition.deleteMany();
        console.log('✅ Ballot positions cleared');
        await prisma.userBallotHistory.deleteMany();
        console.log('✅ User ballot history cleared');
        await prisma.ballot.deleteMany();
        console.log('✅ Ballots cleared');
        await prisma.candidate.deleteMany();
        console.log('✅ Candidates cleared');
        await prisma.position.deleteMany();
        console.log('✅ Positions cleared');
        const positionsAfterCleanup = await prisma.position.findMany();
        console.log(`📊 Positions after cleanup: ${positionsAfterCleanup.length}`);
        console.log('\n🔄 Simulating automatic position initialization...');
        const standardPositions = [
            { title: 'President', description: 'Leader of the student body, represents all students', voteLimit: 1, displayOrder: 1 },
            { title: 'Vice-President', description: 'Assists the president and takes over when needed', voteLimit: 1, displayOrder: 2 },
            { title: 'Secretary', description: 'Handles documentation and communication', voteLimit: 1, displayOrder: 3 },
            { title: 'Auditor', description: 'Oversees financial transparency and accountability', voteLimit: 1, displayOrder: 4 },
            { title: 'Treasurer', description: 'Manages student council finances', voteLimit: 1, displayOrder: 5 },
            { title: 'PIO Internal', description: 'Manages internal communications and events', voteLimit: 1, displayOrder: 6 },
            { title: 'PIO External', description: 'Manages external communications and partnerships', voteLimit: 1, displayOrder: 7 },
            { title: 'Senator', description: 'Represents student interests in governance', voteLimit: 8, displayOrder: 8 },
            { title: 'Internal Vice-President', description: 'Handles internal department affairs', voteLimit: 1, displayOrder: 9 },
            { title: 'External Vice-President', description: 'Handles external department relations', voteLimit: 1, displayOrder: 10 },
            { title: '1st Year Representative', description: 'Represents first-year students', voteLimit: 1, displayOrder: 11 },
            { title: '2nd Year Representative', description: 'Represents second-year students', voteLimit: 1, displayOrder: 12 },
            { title: '3rd Year Representative', description: 'Represents third-year students', voteLimit: 1, displayOrder: 13 },
            { title: '4th Year Representative', description: 'Represents fourth-year students', voteLimit: 1, displayOrder: 14 },
            { title: 'Public Relations Officer', description: 'Manages club public relations', voteLimit: 1, displayOrder: 15 },
        ];
        console.log(`📋 Creating ${standardPositions.length} standard positions...`);
        const createdPositions = [];
        for (const position of standardPositions) {
            try {
                console.log(`🔄 Creating: ${position.title}`);
                const createdPosition = await prisma.position.create({
                    data: {
                        id: generatePositionId(position.title),
                        Position_Title: position.title,
                        Position_Description: position.description,
                        voteLimit: position.voteLimit,
                        displayOrder: position.displayOrder,
                    },
                });
                createdPositions.push(createdPosition);
                console.log(`✅ Created: ${createdPosition.Position_Title}`);
            }
            catch (error) {
                console.error(`❌ Failed to create ${position.title}:`, error);
                throw error;
            }
        }
        console.log(`\n✅ Successfully created ${createdPositions.length} positions:`);
        createdPositions.forEach((position, index) => {
            console.log(`   ${index + 1}. ${position.Position_Title} (Vote Limit: ${position.voteLimit}, Order: ${position.displayOrder})`);
        });
        const yearReps = createdPositions.filter(p => p.Position_Title.includes('Year Representative'));
        console.log(`\n🎯 Year Representatives created: ${yearReps.length}`);
        yearReps.forEach((rep, index) => {
            console.log(`   ${index + 1}. ${rep.Position_Title}`);
        });
        const finalCheck = await prisma.position.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        console.log(`\n🔍 Final verification: ${finalCheck.length} positions present`);
        if (finalCheck.length === standardPositions.length) {
            console.log('🎉 Position initialization test passed!');
            console.log('✅ All standard positions are now available');
        }
        else {
            console.log('❌ Position initialization test failed');
            console.log(`Expected ${standardPositions.length} positions, found ${finalCheck.length}`);
        }
        console.log('\n📋 All positions created:');
        finalCheck.forEach((position, index) => {
            console.log(`   ${index + 1}. ${position.Position_Title} (Vote Limit: ${position.voteLimit}, Order: ${position.displayOrder})`);
        });
    }
    catch (error) {
        console.error('❌ Position initialization test failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
testPositionInitialization()
    .then(() => {
    console.log('\n✅ Position initialization test completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Position initialization test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-position-initialization.js.map