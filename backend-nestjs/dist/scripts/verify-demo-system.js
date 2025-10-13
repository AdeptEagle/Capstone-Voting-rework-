"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function verifyDemoSystem() {
    try {
        console.log('🔍 Verifying demo system state...\n');
        const admin = await prisma.admin.findFirst();
        if (admin) {
            console.log(`✅ Admin found: ${admin.Admin_Username}`);
        }
        else {
            console.log('❌ No admin found');
            return;
        }
        const positions = await prisma.position.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        console.log(`📊 Positions found: ${positions.length}`);
        const yearReps = positions.filter(p => p.Position_Title.includes('Year Representative'));
        if (positions.length > 0) {
            console.log('📋 All positions:');
            positions.forEach((position, index) => {
                console.log(`   ${index + 1}. ${position.Position_Title} (Vote Limit: ${position.voteLimit}, Order: ${position.displayOrder})`);
            });
            console.log(`\n🎯 Year Representatives: ${yearReps.length}`);
            yearReps.forEach((rep, index) => {
                console.log(`   ${index + 1}. ${rep.Position_Title}`);
            });
        }
        else {
            console.log('❌ No positions found');
        }
        const candidates = await prisma.candidate.findMany();
        console.log(`\n📊 Candidates found: ${candidates.length}`);
        if (candidates.length > 0) {
            const candidatesByPosition = new Map();
            for (const candidate of candidates) {
                const position = positions.find(p => p.id === candidate.positionId);
                if (position) {
                    if (!candidatesByPosition.has(position.Position_Title)) {
                        candidatesByPosition.set(position.Position_Title, []);
                    }
                    candidatesByPosition.get(position.Position_Title).push(candidate);
                }
            }
            console.log('\n📋 Candidates by position:');
            for (const [positionTitle, positionCandidates] of candidatesByPosition) {
                console.log(`\n📋 ${positionTitle}:`);
                positionCandidates.forEach((candidate, index) => {
                    console.log(`   ${index + 1}. ${candidate.Candidate_Name} (${candidate.Candidate_StudentId})`);
                });
            }
            const candidatesPerPosition = candidates.length / positions.length;
            console.log(`\n📊 Average candidates per position: ${candidatesPerPosition.toFixed(1)}`);
            const yearRepCandidates = candidates.filter(c => {
                const position = positions.find(p => p.id === c.positionId);
                return position && position.Position_Title.includes('Year Representative');
            });
            console.log(`\n🎯 Year Representative candidates: ${yearRepCandidates.length}`);
            yearRepCandidates.forEach((candidate, index) => {
                const position = positions.find(p => p.id === candidate.positionId);
                console.log(`   ${index + 1}. ${candidate.Candidate_Name} - ${position?.Position_Title}`);
            });
        }
        else {
            console.log('❌ No candidates found');
        }
        const departments = await prisma.department.findMany();
        const courses = await prisma.course.findMany();
        console.log(`\n📊 Departments: ${departments.length}`);
        console.log(`📊 Courses: ${courses.length}`);
        const ballots = await prisma.ballot.findMany();
        console.log(`\n📊 Ballots: ${ballots.length}`);
        console.log('\n📊 Demo System Summary:');
        console.log(`   Admin: ${admin ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Positions: ${positions.length} ${positions.length >= 15 ? '✅' : '❌'}`);
        console.log(`   Candidates: ${candidates.length} ${candidates.length >= 30 ? '✅' : '❌'}`);
        console.log(`   Year Representatives: ${yearReps?.length || 0} ${(yearReps?.length || 0) >= 4 ? '✅' : '❌'}`);
        console.log(`   Departments: ${departments.length} ${departments.length > 0 ? '✅' : '❌'}`);
        console.log(`   Courses: ${courses.length} ${courses.length > 0 ? '✅' : '❌'}`);
        if (positions.length >= 15 && candidates.length >= 30) {
            console.log('\n🎉 Demo system is ready!');
            console.log('✅ All positions and candidates are available');
            console.log('✅ You can now create ballots and run elections');
            console.log('✅ Perfect for demonstration purposes');
        }
        else {
            console.log('\n⚠️ Demo system needs more data');
            console.log('Run: npm run demo:seed');
        }
    }
    catch (error) {
        console.error('❌ Verification failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
verifyDemoSystem()
    .then(() => {
    console.log('\n✅ Demo system verification completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Demo system verification failed:', error);
    process.exit(1);
});
//# sourceMappingURL=verify-demo-system.js.map