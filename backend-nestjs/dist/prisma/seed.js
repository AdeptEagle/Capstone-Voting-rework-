"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const default_templates_1 = require("../src/templates/default-templates");
const prisma = new client_1.PrismaClient();
function generatePositionId(positionTitle) {
    const positionIdMap = {
        'Student Council President': 'PRES',
        'Student Council Vice President': 'V-PRES',
        'Student Council Secretary': 'SEC',
        'Student Council Treasurer': 'TREAS',
        'Student Council Auditor': 'AUD',
        'Student Council Public Relations Officer': 'PRO'
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
async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('🧹 Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.voter.deleteMany();
    await prisma.course.deleteMany();
    await prisma.department.deleteMany();
    await prisma.position.deleteMany();
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
                id: 'CBM',
                Department_Name: 'College of Business and Management',
                Department_Description: 'Business and Management programs',
                createdBy: superAdmin.id,
            },
        }),
        prisma.department.create({
            data: {
                id: 'CCS',
                Department_Name: 'College of Computer Studies',
                Department_Description: 'Computing and Information Technology programs',
                createdBy: superAdmin.id,
            },
        }),
        prisma.department.create({
            data: {
                id: 'CEA',
                Department_Name: 'College of Education and Arts',
                Department_Description: 'Education and Arts programs',
                createdBy: superAdmin.id,
            },
        }),
        prisma.department.create({
            data: {
                id: 'CoE',
                Department_Name: 'College of Engineering',
                Department_Description: 'Engineering programs',
                createdBy: superAdmin.id,
            },
        }),
    ]);
    console.log('📚 Creating courses...');
    const courses = await Promise.all([
        prisma.course.create({
            data: {
                id: 'BSHM',
                Course_Name: 'BS in Hospitality Management',
                Course_Code: 'BSHM',
                Course_Description: 'Bachelor of Science in Hospitality Management',
                departmentId: 'CBM',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSA',
                Course_Name: 'BS in Accountancy',
                Course_Code: 'BSA',
                Course_Description: 'Bachelor of Science in Accountancy',
                departmentId: 'CBM',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSBA-MM',
                Course_Name: 'BS in Business Administration Major in Marketing Management',
                Course_Code: 'BSBA-MM',
                Course_Description: 'Bachelor of Science in Business Administration Major in Marketing Management',
                departmentId: 'CBM',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSBA-HRDM',
                Course_Name: 'BS in Business Administration Major in Human Resource Development Management',
                Course_Code: 'BSBA-HRDM',
                Course_Description: 'Bachelor of Science in Business Administration Major in Human Resource Development Management',
                departmentId: 'CBM',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSIT',
                Course_Name: 'BS in Information Technology',
                Course_Code: 'BSIT',
                Course_Description: 'Bachelor of Science in Information Technology',
                departmentId: 'CCS',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BEEd-GE',
                Course_Name: 'Bachelor in Elementary Education - General Education',
                Course_Code: 'BEED-GE',
                Course_Description: 'Bachelor in Elementary Education - General Education',
                departmentId: 'CEA',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSEd-English',
                Course_Name: 'Bachelor in Secondary Education Major in English',
                Course_Code: 'BSED-ENGLISH',
                Course_Description: 'Bachelor in Secondary Education Major in English',
                departmentId: 'CEA',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BMC',
                Course_Name: 'Bachelor in Mass Communications',
                Course_Code: 'BMC',
                Course_Description: 'Bachelor in Mass Communications',
                departmentId: 'CEA',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSEE',
                Course_Name: 'BS in Electrical Engineering',
                Course_Code: 'BSEE',
                Course_Description: 'Bachelor of Science in Electrical Engineering',
                departmentId: 'CoE',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSCE',
                Course_Name: 'BS in Civil Engineering',
                Course_Code: 'BSCE',
                Course_Description: 'Bachelor of Science in Civil Engineering',
                departmentId: 'CoE',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSME',
                Course_Name: 'BS in Mechanical Engineering',
                Course_Code: 'BSME',
                Course_Description: 'Bachelor of Science in Mechanical Engineering',
                departmentId: 'CoE',
                createdBy: superAdmin.id,
            },
        }),
        prisma.course.create({
            data: {
                id: 'BSIE',
                Course_Name: 'BS in Industrial Engineering',
                Course_Code: 'BSIE',
                Course_Description: 'Bachelor of Science in Industrial Engineering',
                departmentId: 'CoE',
                createdBy: superAdmin.id,
            },
        }),
    ]);
    console.log('🎯 Creating positions...');
    const positions = await Promise.all([
        prisma.position.create({
            data: {
                id: generatePositionId('Student Council President'),
                Position_Title: 'Student Council President',
                Position_Description: 'Leader of the student body, represents all students',
                voteLimit: 1,
                displayOrder: 1,
            },
        }),
        prisma.position.create({
            data: {
                id: generatePositionId('Student Council Vice President'),
                Position_Title: 'Student Council Vice President',
                Position_Description: 'Assists the president and takes over when needed',
                voteLimit: 1,
                displayOrder: 2,
            },
        }),
        prisma.position.create({
            data: {
                id: generatePositionId('Student Council Secretary'),
                Position_Title: 'Student Council Secretary',
                Position_Description: 'Handles documentation and communication',
                voteLimit: 1,
                displayOrder: 3,
            },
        }),
        prisma.position.create({
            data: {
                id: generatePositionId('Student Council Treasurer'),
                Position_Title: 'Student Council Treasurer',
                Position_Description: 'Manages student council finances',
                voteLimit: 1,
                displayOrder: 4,
            },
        }),
        prisma.position.create({
            data: {
                id: generatePositionId('Student Council Auditor'),
                Position_Title: 'Student Council Auditor',
                Position_Description: 'Oversees financial transparency and accountability',
                voteLimit: 1,
                displayOrder: 5,
            },
        }),
        prisma.position.create({
            data: {
                id: generatePositionId('Student Council Public Relations Officer'),
                Position_Title: 'Student Council Public Relations Officer',
                Position_Description: 'Manages external communications and events',
                voteLimit: 1,
                displayOrder: 6,
            },
        }),
    ]);
    console.log('👥 Skipping candidate creation (disabled)');
    const candidates = [];
    console.log('🗳️ Skipping voter creation (disabled)');
    const voters = [];
    console.log('🏛️ Skipping ballot creation (disabled)');
    const ballot = null;
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
    console.log(`   - Candidates: 0 (disabled)`);
    console.log(`   - Voters: 0 (disabled)`);
    console.log(`   - Ballots: 0 (disabled)`);
    console.log(`   - Ballot Templates: ${templates.length}`);
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('   Superadmin: superadmin / superadmin123');
    console.log('   Admin: admin / admin123');
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