"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
async function setupOtherSystem() {
    try {
        console.log('🚀 Setting up other system for automatic position and candidate creation...\n');
        const admin = await prisma.admin.findFirst();
        if (!admin) {
            console.log('❌ No admin found. Please create an admin first.');
            return;
        }
        console.log(`✅ Admin found: ${admin.Admin_Username}`);
        const departments = await prisma.department.findMany();
        const courses = await prisma.course.findMany();
        if (departments.length === 0 || courses.length === 0) {
            console.log('❌ No departments or courses found. Please run database seeding first.');
            console.log('Run: npm run db:seed');
            return;
        }
        console.log(`✅ Found ${departments.length} departments and ${courses.length} courses`);
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
                            id: generateId(),
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
        const allPositions = await prisma.position.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        const existingCandidates = await prisma.candidate.findMany();
        const positionsWithCandidates = new Set();
        for (const candidate of existingCandidates) {
            positionsWithCandidates.add(candidate.positionId);
        }
        const positionsNeedingCandidates = allPositions.filter(p => !positionsWithCandidates.has(p.id));
        console.log(`📊 Found ${existingCandidates.length} existing candidates`);
        console.log(`📊 Positions needing candidates: ${positionsNeedingCandidates.length}`);
        if (positionsNeedingCandidates.length > 0) {
            console.log(`📊 Creating candidates for ${positionsNeedingCandidates.length} positions...`);
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
            const allCandidates = [];
            let candidateIndex = 0;
            for (const position of positionsNeedingCandidates) {
                console.log(`📋 Creating candidates for: ${position.Position_Title}`);
                for (let i = 1; i <= 2; i++) {
                    const candidateName = candidateNames[candidateIndex % candidateNames.length];
                    const studentId = generateUniqueStudentId();
                    const department = departments[Math.floor(Math.random() * departments.length)];
                    const course = courses.filter(c => c.departmentId === department.id)[0] || courses[0];
                    const candidate = {
                        id: generateId(),
                        Candidate_Name: candidateName,
                        Candidate_Email: `${candidateName.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
                        Candidate_StudentId: studentId,
                        manifesto: `I am committed to serving the student body and bringing positive change to our ${position.Position_Title} position. I will work tirelessly to represent your interests and make our community better for everyone.`,
                        positionId: position.id,
                        departmentId: department.id,
                        courseId: course.id,
                    };
                    allCandidates.push(candidate);
                    candidateIndex++;
                    console.log(`   ${i}. ${candidateName} (${studentId}) - ${department.Department_Name}`);
                }
            }
            console.log(`\n🏗️ Creating ${allCandidates.length} candidates in database...`);
            const createdCandidates = await Promise.all(allCandidates.map(candidateData => prisma.candidate.create({
                data: candidateData
            })));
            console.log(`✅ Successfully created ${createdCandidates.length} candidates`);
        }
        else {
            console.log('✅ All positions already have candidates');
        }
        const finalPositions = await prisma.position.findMany();
        const finalCandidates = await prisma.candidate.findMany();
        const yearReps = finalPositions.filter(p => p.Position_Title.includes('Year Representative'));
        console.log('\n📊 Final System State:');
        console.log(`   Admin: ✅ Present`);
        console.log(`   Positions: ${finalPositions.length} ${finalPositions.length >= 15 ? '✅' : '❌'}`);
        console.log(`   Candidates: ${finalCandidates.length} ${finalCandidates.length >= 30 ? '✅' : '❌'}`);
        console.log(`   Year Representatives: ${yearReps.length} ${yearReps.length >= 4 ? '✅' : '❌'}`);
        console.log(`   Departments: ${departments.length} ${departments.length > 0 ? '✅' : '❌'}`);
        console.log(`   Courses: ${courses.length} ${courses.length > 0 ? '✅' : '❌'}`);
        if (finalPositions.length >= 15 && finalCandidates.length >= 30) {
            console.log('\n🎉 Other system setup completed successfully!');
            console.log('✅ All positions and candidates are available');
            console.log('✅ System is ready for elections');
            console.log('✅ Perfect for demonstration purposes');
        }
        else {
            console.log('\n⚠️ System setup incomplete');
            console.log('Some positions or candidates may be missing');
        }
    }
    catch (error) {
        console.error('❌ Other system setup failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
setupOtherSystem()
    .then(() => {
    console.log('\n✅ Other system setup completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Other system setup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=setup-other-system.js.map