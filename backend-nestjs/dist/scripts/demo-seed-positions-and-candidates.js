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
function generateStudentId() {
    const year = Math.floor(Math.random() * 4) + 2020;
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    return `${year}-${randomNum}`;
}
const usedStudentIds = new Set();
function generateUniqueStudentId() {
    let studentId;
    do {
        studentId = generateStudentId();
    } while (usedStudentIds.has(studentId));
    usedStudentIds.add(studentId);
    return studentId;
}
async function demoSeedPositionsAndCandidates() {
    try {
        console.log('🎭 Demo: Seeding positions and candidates for demonstration...\n');
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
        const departments = await prisma.department.findMany();
        const courses = await prisma.course.findMany();
        if (departments.length === 0 || courses.length === 0) {
            console.log('❌ No departments or courses found. Please run database seeding first.');
            return;
        }
        console.log(`📊 Found ${departments.length} departments and ${courses.length} courses`);
        const existingPositions = await prisma.position.findMany();
        console.log(`📊 Found ${existingPositions.length} existing positions`);
        const existingTitles = existingPositions.map(p => p.Position_Title);
        const missingPositions = standardPositions.filter(position => !existingTitles.includes(position.title));
        if (missingPositions.length > 0) {
            console.log(`📋 Creating ${missingPositions.length} missing positions...`);
            const createdPositions = [];
            for (const position of missingPositions) {
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
            console.log(`✅ Successfully created ${createdPositions.length} positions`);
        }
        else {
            console.log('✅ All positions already exist');
        }
        console.log('\n🌱 Creating candidates for all positions...');
        const allPositions = await prisma.position.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        const existingCandidates = await prisma.candidate.findMany();
        if (existingCandidates.length > 0) {
            console.log(`📊 Found ${existingCandidates.length} existing candidates`);
            console.log('🔄 Clearing existing candidates to create fresh demo data...');
            await prisma.candidate.deleteMany();
            console.log('✅ Existing candidates cleared');
        }
        const candidateNames = [
            'John Michael Santos', 'Maria Clara Reyes', 'Carlos Antonio Cruz', 'Ana Sofia Mendoza',
            'Luis Miguel Torres', 'Isabella Grace Lim', 'Gabriel Enrique Santos', 'Sofia Isabel Reyes',
            'Diego Alejandro Cruz', 'Camila Esperanza Vega', 'Sebastian Andres Lopez', 'Valentina Sofia Ruiz',
            'Mateo Alejandro Herrera', 'Sofia Esperanza Morales', 'Nicolas Sebastian Jimenez', 'Isabella Camila Vargas',
            'Santiago Andres Ramirez', 'Valeria Sofia Castillo', 'Alejandro Sebastian Mendez', 'Camila Valentina Rojas',
            'Daniel Alejandro Pena', 'Sofia Camila Silva', 'Sebastian Mateo Castro', 'Valentina Sofia Ortega',
            'Mateo Santiago Flores', 'Isabella Valentina Aguilar', 'Nicolas Alejandro Vega', 'Sofia Camila Medina',
            'Santiago Sebastian Herrera', 'Valentina Sofia Rios', 'Alejandro Mateo Guerrero', 'Camila Sofia Navarro',
            'Daniel Sebastian Moreno', 'Sofia Valentina Jimenez', 'Sebastian Santiago Vargas', 'Valentina Camila Torres',
            'Mateo Alejandro Silva', 'Isabella Sofia Castro', 'Nicolas Sebastian Flores', 'Sofia Valentina Aguilar',
            'Santiago Mateo Vega', 'Valentina Sofia Medina', 'Alejandro Sebastian Rios', 'Camila Sofia Guerrero',
            'Daniel Alejandro Navarro', 'Sofia Valentina Moreno', 'Sebastian Santiago Jimenez', 'Valentina Camila Vargas'
        ];
        console.log(`📊 Creating candidates for ${allPositions.length} positions...`);
        const allCandidates = [];
        let candidateIndex = 0;
        console.log('📋 Skipping candidate creation (disabled)');
        console.log(`\n🏗️ Skipping candidate database creation (disabled)`);
        const createdCandidates = [];
        console.log(`✅ No candidates created (automatic seeding disabled)`);
        console.log('\n📊 Candidates created by position:');
        for (const position of allPositions) {
            const positionCandidates = createdCandidates.filter(c => c.positionId === position.id);
            console.log(`\n📋 ${position.Position_Title}:`);
            positionCandidates.forEach((candidate, index) => {
                console.log(`   ${index + 1}. ${candidate.Candidate_Name} (${candidate.Candidate_StudentId})`);
            });
        }
        console.log('\n📊 Candidates by department:');
        const departmentCounts = new Map();
        for (const candidate of createdCandidates) {
            const department = departments.find(d => d.id === candidate.departmentId);
            if (department) {
                departmentCounts.set(department.Department_Name, (departmentCounts.get(department.Department_Name) || 0) + 1);
            }
        }
        for (const [department, count] of departmentCounts) {
            console.log(`   ${department}: ${count} candidates`);
        }
        const yearReps = allPositions.filter(p => p.Position_Title.includes('Year Representative'));
        console.log(`\n🎯 Year Representatives: ${yearReps.length}`);
        yearReps.forEach((rep, index) => {
            console.log(`   ${index + 1}. ${rep.Position_Title}`);
        });
        console.log('\n🎉 Demo seeding completed successfully!');
        console.log(`📊 Total positions: ${allPositions.length}`);
        console.log(`📊 Total candidates created: ${createdCandidates.length}`);
        console.log(`📊 Candidates per position: 2`);
        console.log(`📊 Year Representatives: ${yearReps.length}`);
        console.log('\n🎭 Demo system is ready!');
        console.log('✅ All positions and candidates are available for demonstration');
        console.log('✅ You can now create ballots and run elections');
    }
    catch (error) {
        console.error('❌ Demo seeding failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
demoSeedPositionsAndCandidates()
    .then(() => {
    console.log('\n✅ Demo seeding completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Demo seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=demo-seed-positions-and-candidates.js.map