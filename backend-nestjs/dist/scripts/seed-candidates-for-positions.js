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
async function seedCandidatesForPositions() {
    try {
        console.log('🌱 Seeding candidates for all positions...\n');
        const positions = await prisma.position.findMany({
            orderBy: {
                displayOrder: 'asc'
            }
        });
        if (positions.length === 0) {
            console.log('❌ No positions found. Please create a ballot from a template first.');
            return;
        }
        console.log(`📊 Found ${positions.length} positions`);
        const departments = await prisma.department.findMany();
        const courses = await prisma.course.findMany();
        if (departments.length === 0 || courses.length === 0) {
            console.log('❌ No departments or courses found. Please run database seeding first.');
            return;
        }
        console.log(`📊 Found ${departments.length} departments and ${courses.length} courses`);
        console.log('🧹 Clearing existing candidates...');
        await prisma.candidate.deleteMany();
        console.log('✅ Existing candidates cleared');
        const allCandidates = [];
        let candidateIndex = 0;
        for (const position of positions) {
            console.log(`\n📋 Creating candidates for: ${position.Position_Title}`);
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
        console.log('\n📊 Candidates created by position:');
        for (const position of positions) {
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
        console.log('\n🎉 Candidate seeding completed successfully!');
        console.log(`📊 Total candidates created: ${createdCandidates.length}`);
        console.log(`📊 Candidates per position: 2`);
        console.log(`📊 Total positions: ${positions.length}`);
    }
    catch (error) {
        console.error('❌ Error seeding candidates:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
seedCandidatesForPositions()
    .then(() => {
    console.log('\n✅ Candidate seeding completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Candidate seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-candidates-for-positions.js.map