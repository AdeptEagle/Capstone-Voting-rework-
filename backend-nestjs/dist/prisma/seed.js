"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const default_templates_1 = require("../src/templates/default-templates");
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
async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('🧹 Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.electionCandidate.deleteMany();
    await prisma.electionPosition.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.voter.deleteMany();
    await prisma.course.deleteMany();
    await prisma.department.deleteMany();
    await prisma.position.deleteMany();
    await prisma.election.deleteMany();
    await prisma.admin.deleteMany();
    console.log('👑 Creating super admin...');
    const superAdmin = await prisma.admin.create({
        data: {
            id: generateId(),
            Admin_Username: 'superadmin',
            Admin_Email: 'superadmin@votingsys.com',
            password: await bcrypt.hash('superadmin123', 10),
            role: 'SUPERADMIN',
        },
    });
    console.log('👨‍💼 Creating admin...');
    const admin = await prisma.admin.create({
        data: {
            id: generateId(),
            Admin_Username: 'admin',
            Admin_Email: 'admin@votingsys.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'ADMIN',
        },
    });
    console.log('🏢 Creating departments...');
    const departments = await Promise.all([
        prisma.department.create({
            data: {
                id: generateId(),
                Department_Name: 'Computer Science',
                Department_Description: 'Department of Computer Science and Information Technology',
                createdBy: superAdmin.id,
            },
        }),
        prisma.department.create({
            data: {
                id: generateId(),
                Department_Name: 'Engineering',
                Department_Description: 'Department of Engineering and Technology',
                createdBy: superAdmin.id,
            },
        }),
        prisma.department.create({
            data: {
                id: generateId(),
                Department_Name: 'Business Administration',
                Department_Description: 'Department of Business and Management',
                createdBy: superAdmin.id,
            },
        }),
        prisma.department.create({
            data: {
                id: generateId(),
                Department_Name: 'Arts and Humanities',
                Department_Description: 'Department of Arts, Literature, and Humanities',
                createdBy: superAdmin.id,
            },
        }),
        prisma.department.create({
            data: {
                id: generateId(),
                Department_Name: 'Natural Sciences',
                Department_Description: 'Department of Natural Sciences and Mathematics',
                createdBy: superAdmin.id,
            },
        }),
    ]);
    console.log('📚 Creating courses...');
    const courses = await Promise.all([
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Computer Science',
                Course_Code: 'BSCS',
                Course_Description: '4-year degree program in Computer Science',
                departmentId: departments[0].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Information Technology',
                Course_Code: 'BSIT',
                Course_Description: '4-year degree program in Information Technology',
                departmentId: departments[0].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Civil Engineering',
                Course_Code: 'BSCE',
                Course_Description: '5-year degree program in Civil Engineering',
                departmentId: departments[1].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Mechanical Engineering',
                Course_Code: 'BSME',
                Course_Description: '5-year degree program in Mechanical Engineering',
                departmentId: departments[1].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Business Administration',
                Course_Code: 'BSBA',
                Course_Description: '4-year degree program in Business Administration',
                departmentId: departments[2].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Accountancy',
                Course_Code: 'BSA',
                Course_Description: '4-year degree program in Accountancy',
                departmentId: departments[2].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Arts in English',
                Course_Code: 'BAENG',
                Course_Description: '4-year degree program in English Literature',
                departmentId: departments[3].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Arts in History',
                Course_Code: 'BAHIS',
                Course_Description: '4-year degree program in History',
                departmentId: departments[3].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Biology',
                Course_Code: 'BSBIO',
                Course_Description: '4-year degree program in Biology',
                departmentId: departments[4].id,
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: generateId(),
                Course_Name: 'Bachelor of Science in Mathematics',
                Course_Code: 'BSMATH',
                Course_Description: '4-year degree program in Mathematics',
                departmentId: departments[4].id,
                createdBy: superAdmin.id,
            },
        }),
    ]);
    console.log('🎯 Creating positions...');
    const positions = await Promise.all([
        prisma.position.create({
            data: {
                id: generateId(),
                Position_Title: 'Student Council President',
                Position_Description: 'Leader of the student body, represents all students',
                voteLimit: 1,
                displayOrder: 1,
            },
        }),
        prisma.position.create({
            data: {
                id: generateId(),
                Position_Title: 'Student Council Vice President',
                Position_Description: 'Assists the president and takes over when needed',
                voteLimit: 1,
                displayOrder: 2,
            },
        }),
        prisma.position.create({
            data: {
                id: generateId(),
                Position_Title: 'Student Council Secretary',
                Position_Description: 'Handles documentation and communication',
                voteLimit: 1,
                displayOrder: 3,
            },
        }),
        prisma.position.create({
            data: {
                id: generateId(),
                Position_Title: 'Student Council Treasurer',
                Position_Description: 'Manages student council finances',
                voteLimit: 1,
                displayOrder: 4,
            },
        }),
        prisma.position.create({
            data: {
                id: generateId(),
                Position_Title: 'Student Council Auditor',
                Position_Description: 'Oversees financial transparency and accountability',
                voteLimit: 1,
                displayOrder: 5,
            },
        }),
        prisma.position.create({
            data: {
                id: generateId(),
                Position_Title: 'Student Council Public Relations Officer',
                Position_Description: 'Manages external communications and events',
                voteLimit: 1,
                displayOrder: 6,
            },
        }),
    ]);
    console.log('👥 Skipping candidate creation (disabled)');
    const candidates = [];
    console.log('🗳️ Creating voters...');
    const voters = await Promise.all([
        ...Array.from({ length: 25 }, (_, i) => ({
            id: generateId(),
            Voter_Name: `Voter CS ${i + 1}`,
            Voter_Email: `voter.cs${i + 1}@student.edu`,
            Voter_StudentId: generateStudentId(),
            password: bcrypt.hashSync('password123', 10),
            departmentId: departments[0].id,
            courseId: courses[Math.floor(Math.random() * 2)].id,
        })),
        ...Array.from({ length: 30 }, (_, i) => ({
            id: generateId(),
            Voter_Name: `Voter EN ${i + 1}`,
            Voter_Email: `voter.en${i + 1}@student.edu`,
            Voter_StudentId: generateStudentId(),
            password: bcrypt.hashSync('password123', 10),
            departmentId: departments[1].id,
            courseId: courses[Math.floor(Math.random() * 2) + 2].id,
        })),
        ...Array.from({ length: 28 }, (_, i) => ({
            id: generateId(),
            Voter_Name: `Voter BA ${i + 1}`,
            Voter_Email: `voter.ba${i + 1}@student.edu`,
            Voter_StudentId: generateStudentId(),
            password: bcrypt.hashSync('password123', 10),
            departmentId: departments[2].id,
            courseId: courses[Math.floor(Math.random() * 2) + 4].id,
        })),
        ...Array.from({ length: 20 }, (_, i) => ({
            id: generateId(),
            Voter_Name: `Voter AH ${i + 1}`,
            Voter_Email: `voter.ah${i + 1}@student.edu`,
            Voter_StudentId: generateStudentId(),
            password: bcrypt.hashSync('password123', 10),
            departmentId: departments[3].id,
            courseId: courses[Math.floor(Math.random() * 2) + 6].id,
        })),
        ...Array.from({ length: 22 }, (_, i) => ({
            id: generateId(),
            Voter_Name: `Voter NS ${i + 1}`,
            Voter_Email: `voter.ns${i + 1}@student.edu`,
            Voter_StudentId: generateStudentId(),
            password: bcrypt.hashSync('password123', 10),
            departmentId: departments[4].id,
            courseId: courses[Math.floor(Math.random() * 2) + 8].id,
        })),
    ].map(voterData => prisma.voter.create({ data: voterData })));
    console.log('🏛️ Creating election...');
    const election = await prisma.election.create({
        data: {
            id: generateId(),
            Election_Title: 'Student Council Election 2024',
            Election_Description: 'Annual election for Student Council positions',
            startDate: new Date('2024-12-01T08:00:00Z'),
            endDate: new Date('2024-12-01T18:00:00Z'),
            isActive: true,
            status: 'active',
            createdBy: superAdmin.id,
        },
    });
    console.log('🔗 Linking positions to election...');
    const electionPositions = await Promise.all(positions.map(position => prisma.electionPosition.create({
        data: {
            id: generateId(),
            electionId: election.id,
            positionId: position.id,
        },
    })));
    console.log('🔗 Linking candidates to election...');
    const electionCandidates = await Promise.all(candidates.map(candidate => prisma.electionCandidate.create({
        data: {
            id: generateId(),
            electionId: election.id,
            candidateId: candidate.id,
        },
    })));
    console.log('📋 Seeding ballot templates...');
    const templates = await Promise.all(default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(template => prisma.ballotTemplate.upsert({
        where: { id: template.id },
        update: {
            BallotTemplate_Name: template.name,
            BallotTemplate_Description: template.description,
            BallotTemplate_Data: template.data,
            BallotTemplate_IsPublic: template.isPublic,
            BallotTemplate_CreatedBy: superAdmin.id,
        },
        create: {
            id: template.id,
            BallotTemplate_Name: template.name,
            BallotTemplate_Description: template.description,
            BallotTemplate_Data: template.data,
            BallotTemplate_IsPublic: template.isPublic,
            BallotTemplate_CreatedBy: superAdmin.id,
        },
    })));
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary of created data:');
    console.log(`   - Admins: 2`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Positions: ${positions.length}`);
    console.log(`   - Candidates: ${candidates.length}`);
    console.log(`   - Voters: ${voters.length}`);
    console.log(`   - Elections: 1`);
    console.log(`   - Ballot Templates: ${templates.length}`);
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('   Superadmin: superadmin / superadmin123');
    console.log('   Admin: admin / admin123');
    console.log('   Voters: password123 (use any voter email)');
    console.log('');
    console.log('🎯 Election is active and ready for voting!');
    console.log('📋 Ballot templates are available for creating new ballots!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map