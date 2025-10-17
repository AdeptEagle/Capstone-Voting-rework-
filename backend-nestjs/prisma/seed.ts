import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DEFAULT_BALLOT_TEMPLATES } from '../src/templates/default-templates';

const prisma = new PrismaClient();

// Helper function to generate proper position IDs
function generatePositionId(positionTitle: string): string {
  // Create a mapping of position titles to proper IDs
  const positionIdMap: { [key: string]: string } = {
    'Student Council President': 'PRES',
    'Student Council Vice President': 'V-PRES',
    'Student Council Secretary': 'SEC',
    'Student Council Treasurer': 'TREAS',
    'Student Council Auditor': 'AUD',
    'Student Council Public Relations Officer': 'PRO'
  };

  // Return the mapped ID or generate a fallback based on title
  if (positionIdMap[positionTitle]) {
    return positionIdMap[positionTitle];
  }

  // Fallback: create ID from title (first 3 chars of each word, max 8 chars)
  const words = positionTitle.split(' ');
  const id = words.map(word => word.substring(0, 3)).join('').toUpperCase();
  return id.substring(0, 8);
}

// Helper function to generate ID in format xxxx-xxxxx (for candidates)
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
  // Election tables no longer exist
  await prisma.candidate.deleteMany();
  await prisma.voter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.position.deleteMany();
  // Election tables no longer exist
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
    // CBM courses
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
    // CCS courses
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
    // CEA courses
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
    // CoE courses
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

  // DISABLED: Automatic candidate creation removed
  console.log('👥 Skipping candidate creation (disabled)');
  const candidates = []; // Empty array instead of creating candidates
  /*
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
  */

  // DISABLED: Automatic voter creation removed
  console.log('🗳️ Skipping voter creation (disabled)');
  const voters = []; // Empty array instead of creating voters
  /*
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
  */

  // DISABLED: Automatic ballot creation removed
  console.log('🏛️ Skipping ballot creation (disabled)');
  const ballot = null; // No ballot creation
  /*
  console.log('🏛️ Creating ballot...');
  const ballot = await prisma.ballot.create({
    data: {
      id: generateId(),
      Ballot_Title: 'Student Council Election 2024',
      Ballot_Description: 'Annual election for Student Council positions',
      Ballot_StartDate: new Date('2024-12-01T08:00:00Z'),
      Ballot_EndDate: new Date('2024-12-01T18:00:00Z'),
      Ballot_IsActive: true,
      Ballot_Status: 'ACTIVE',
      createdByAdmin: {
        connect: { id: superAdmin.id }
      },
    },
  });

  console.log('🔗 Linking positions to ballot...');
  const ballotPositions = await Promise.all(
    positions.map(position =>
      prisma.ballotPosition.create({
        data: {
          id: generateId(),
          BallotPosition_BallotId: ballot.id,
          BallotPosition_PositionId: position.id,
          BallotPosition_DisplayOrder: position.displayOrder,
          BallotPosition_IsRequired: true,
        },
      })
    )
  );

  console.log('🔗 Linking candidates to ballot...');
  const ballotCandidates = await Promise.all(
    candidates.map(candidate =>
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          ballot: {
            connect: { id: ballot.id }
          },
          candidate: {
            connect: { id: candidate.id }
          },
          ballotPosition: {
            connect: { id: ballotPositions[0].id }
          },
        },
      })
    )
  );

  */
  
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
