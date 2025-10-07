import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DEFAULT_BALLOT_TEMPLATES } from '../src/templates/default-templates';

const prisma = new PrismaClient();

// Helper function to generate ID in format xxxx-xxxxx
function generateId(): string {
  const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${firstPart}-${secondPart}`;
}

// Helper function to generate student ID
function generateStudentId(): string {
  const year = Math.floor(Math.random() * 4) + 2020; // Random year between 2020-2023
  const randomNum = Math.floor(Math.random() * 90000) + 10000; // Random 5-digit number
  return `${year}-${randomNum}`;
}

// Set to track used student IDs to avoid duplicates
const usedStudentIds = new Set<string>();

// Helper function to generate unique student ID
function generateUniqueStudentId(): string {
  let studentId: string;
  do {
    studentId = generateStudentId();
  } while (usedStudentIds.has(studentId));
  usedStudentIds.add(studentId);
  return studentId;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
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
    // Computer Science courses
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
    // Engineering courses
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
    // Business courses
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
    // Arts courses
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
    // Science courses
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

  console.log('👥 Creating candidates...');
  const candidates = await Promise.all([
    // Computer Science candidates
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'John Michael Santos',
        Candidate_Email: 'john.santos@student.edu',
        Candidate_StudentId: generateUniqueStudentId(),
        manifesto: 'I will promote technology innovation and digital literacy among students.',
        positionId: positions[0].id,
        departmentId: departments[0].id,
        courseId: courses[0].id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Maria Clara Reyes',
        Candidate_Email: 'maria.reyes@student.edu',
        Candidate_StudentId: generateUniqueStudentId(),
        manifesto: 'I will advocate for better computer lab facilities and coding workshops.',
        positionId: positions[0].id,
        departmentId: departments[0].id,
        courseId: courses[1].id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Carlos Antonio Cruz',
        Candidate_Email: 'carlos.cruz@student.edu',
        Candidate_StudentId: generateUniqueStudentId(),
        manifesto: 'I will work towards establishing industry partnerships for internships.',
        positionId: positions[1].id,
        departmentId: departments[0].id,
        courseId: courses[0].id,
      },
    }),
    // Engineering candidates
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Ana Sofia Mendoza',
        Candidate_Email: 'ana.mendoza@student.edu',
        Candidate_StudentId: generateUniqueStudentId(),
        manifesto: 'I will push for better engineering workshop facilities and safety protocols.',
        positionId: positions[0].id,
        departmentId: departments[1].id,
        courseId: courses[2].id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Luis Miguel Torres',
        Candidate_Email: 'luis.torres@student.edu',
        Candidate_StudentId: generateUniqueStudentId(),
        manifesto: 'I will organize engineering competitions and innovation challenges.',
        positionId: positions[2].id,
        departmentId: departments[1].id,
        courseId: courses[3].id,
      },
    }),
    // Business candidates
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Isabella Grace Lim',
        Candidate_Email: 'isabella.lim@student.edu',
        Candidate_StudentId: generateStudentId(),
        manifesto: 'I will create networking opportunities with business professionals.',
        positionId: positions[0].id,
        departmentId: departments[2].id,
        courseId: courses[4].id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Gabriel Enrique Santos',
        Candidate_Email: 'gabriel.santos@student.edu',
        Candidate_StudentId: generateStudentId(),
        manifesto: 'I will establish mentorship programs for business students.',
        positionId: positions[3].id,
        departmentId: departments[2].id,
        courseId: courses[5].id,
      },
    }),
    // Arts candidates
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Sofia Isabel Reyes',
        Candidate_Email: 'sofia.reyes@student.edu',
        Candidate_StudentId: generateStudentId(),
        manifesto: 'I will promote cultural diversity and artistic expression.',
        positionId: positions[4].id,
        departmentId: departments[3].id,
        courseId: courses[6].id,
      },
    }),
    // Science candidates
    prisma.candidate.create({
      data: {
        id: generateId(),
        Candidate_Name: 'Diego Alejandro Cruz',
        Candidate_Email: 'diego.cruz@student.edu',
        Candidate_StudentId: generateStudentId(),
        manifesto: 'I will organize science fairs and research symposiums.',
        positionId: positions[5].id,
        departmentId: departments[4].id,
        courseId: courses[8].id,
      },
    }),
  ]);

  console.log('🗳️ Creating voters...');
  const voters = await Promise.all([
    // Computer Science voters
    ...Array.from({ length: 25 }, (_, i) => ({
      id: generateId(),
      Voter_Name: `Voter CS ${i + 1}`,
      Voter_Email: `voter.cs${i + 1}@student.edu`,
      Voter_StudentId: generateStudentId(),
      password: bcrypt.hashSync('password123', 10),
      departmentId: departments[0].id,
      courseId: courses[Math.floor(Math.random() * 2)].id, // Random CS course
    })),
    // Engineering voters
    ...Array.from({ length: 30 }, (_, i) => ({
      id: generateId(),
      Voter_Name: `Voter EN ${i + 1}`,
      Voter_Email: `voter.en${i + 1}@student.edu`,
      Voter_StudentId: generateStudentId(),
      password: bcrypt.hashSync('password123', 10),
      departmentId: departments[1].id,
      courseId: courses[Math.floor(Math.random() * 2) + 2].id, // Random Engineering course
    })),
    // Business voters
    ...Array.from({ length: 28 }, (_, i) => ({
      id: generateId(),
      Voter_Name: `Voter BA ${i + 1}`,
      Voter_Email: `voter.ba${i + 1}@student.edu`,
      Voter_StudentId: generateStudentId(),
      password: bcrypt.hashSync('password123', 10),
      departmentId: departments[2].id,
      courseId: courses[Math.floor(Math.random() * 2) + 4].id, // Random Business course
    })),
    // Arts voters
    ...Array.from({ length: 20 }, (_, i) => ({
      id: generateId(),
      Voter_Name: `Voter AH ${i + 1}`,
      Voter_Email: `voter.ah${i + 1}@student.edu`,
      Voter_StudentId: generateStudentId(),
      password: bcrypt.hashSync('password123', 10),
      departmentId: departments[3].id,
      courseId: courses[Math.floor(Math.random() * 2) + 6].id, // Random Arts course
    })),
    // Science voters
    ...Array.from({ length: 22 }, (_, i) => ({
      id: generateId(),
      Voter_Name: `Voter NS ${i + 1}`,
      Voter_Email: `voter.ns${i + 1}@student.edu`,
      Voter_StudentId: generateStudentId(),
      password: bcrypt.hashSync('password123', 10),
      departmentId: departments[4].id,
      courseId: courses[Math.floor(Math.random() * 2) + 8].id, // Random Science course
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
  const electionPositions = await Promise.all(
    positions.map(position =>
      prisma.electionPosition.create({
        data: {
          id: generateId(),
          electionId: election.id,
          positionId: position.id,
        },
      })
    )
  );

  console.log('🔗 Linking candidates to election...');
  const electionCandidates = await Promise.all(
    candidates.map(candidate =>
      prisma.electionCandidate.create({
        data: {
          id: generateId(),
          electionId: election.id,
          candidateId: candidate.id,
        },
      })
    )
  );

  console.log('📋 Seeding ballot templates...');
  const templates = await Promise.all(
    DEFAULT_BALLOT_TEMPLATES.map(template =>
      prisma.ballotTemplate.upsert({
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
      })
    )
  );

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
