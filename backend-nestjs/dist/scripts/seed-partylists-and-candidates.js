"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function generateId() {
    const first = Math.random().toString(36).substring(2, 6).toUpperCase();
    const second = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${first}-${second}`;
}
async function seedPartyListsAndCandidates() {
    try {
        console.log('🎉 Seeding 3 party lists and candidates (1 per position per party)...');
        const departments = await prisma.department.findMany({ where: { isDeleted: false } });
        const courses = await prisma.course.findMany({ where: { isDeleted: false } });
        if (departments.length === 0 || courses.length === 0) {
            throw new Error('No departments/courses found. Start the app once to auto-seed them, or run main seed.');
        }
        const positions = await prisma.position.findMany({ where: { isDeleted: false }, orderBy: { displayOrder: 'asc' } });
        if (positions.length === 0) {
            throw new Error('No positions found. Start the app to auto-create positions.');
        }
        const partyNames = ['Unity Party', 'Progress Alliance', 'Pioneers Coalition'];
        const partyColors = ['#1F77B4', '#2CA02C', '#D62728'];
        const partyLists = [];
        for (let i = 0; i < partyNames.length; i++) {
            const name = partyNames[i];
            const color = partyColors[i];
            let party = await prisma.partyList.findFirst({ where: { name } });
            if (!party) {
                party = await prisma.partyList.create({
                    data: { id: generateId(), name, color, description: `${name} - student service and accountability` },
                });
                console.log(`✅ Created party list: ${name}`);
            }
            else {
                console.log(`ℹ️ Party list already exists: ${name}`);
            }
            partyLists.push({ id: party.id, name: party.name });
        }
        const candidateNames = [
            'Alex Rivera', 'Jamie Santos', 'Casey Lim', 'Jordan Cruz', 'Taylor Reyes',
            'Morgan Dela Cruz', 'Avery Mendoza', 'Riley Navarro', 'Parker Jimenez', 'Quinn Torres',
            'Emerson Vega', 'Rowan Herrera', 'Skyler Rios', 'Dakota Morales', 'Harper Castillo',
            'Reese Flores', 'Cameron Guerrero', 'Hayden Silva', 'Blake Medina', 'Finley Vargas'
        ];
        let nameIndex = 0;
        const createdCandidates = [];
        for (const party of partyLists) {
            console.log(`\n🏁 Seeding candidates for party: ${party.name}`);
            for (const position of positions) {
                const existing = await prisma.candidate.findFirst({
                    where: { positionId: position.id, partyListId: party.id, isDeleted: false },
                });
                if (existing) {
                    continue;
                }
                const chosenDepartment = departments[(nameIndex + position.displayOrder) % departments.length];
                const deptCourses = courses.filter(c => c.departmentId === chosenDepartment.id);
                const chosenCourse = deptCourses[0] || courses[(nameIndex + 3) % courses.length];
                const fullName = candidateNames[nameIndex % candidateNames.length];
                nameIndex++;
                const candidate = await prisma.candidate.create({
                    data: {
                        id: generateId(),
                        Candidate_Name: fullName,
                        Candidate_Email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
                        Candidate_StudentId: `202${(nameIndex % 5) + 0}-${10000 + (nameIndex * 37) % 90000}`,
                        manifesto: `As ${position.Position_Title}, I will represent our students with integrity. (${party.name})`,
                        positionId: position.id,
                        departmentId: chosenDepartment.id,
                        courseId: chosenCourse.id,
                        partyListId: party.id,
                        party_list_name: party.name,
                    },
                });
                createdCandidates.push(candidate);
            }
        }
        console.log(`\n✅ Created ${createdCandidates.length} candidates across ${partyLists.length} party lists`);
        console.log(`📌 Positions: ${positions.length} → candidates expected ≈ ${positions.length * partyLists.length}`);
    }
    catch (error) {
        console.error('❌ Seeding party lists and candidates failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedPartyListsAndCandidates()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
//# sourceMappingURL=seed-partylists-and-candidates.js.map