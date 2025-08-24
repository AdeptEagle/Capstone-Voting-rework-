import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedBallotTestData() {
  try {
    console.log('🎯 === Seeding Ballot Test Data ===\n');

    // Get the admin ID
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      console.log('❌ No admin found. Please create an admin first.');
      return;
    }

    const adminId = admin.id;
    console.log(`✅ Using admin ID: ${adminId}\n`);

    // Clear existing data (optional - uncomment if you want to start fresh)
    // console.log('🧹 Clearing existing data...');
    // await prisma.candidate.deleteMany();
    // await prisma.position.deleteMany();
    // await prisma.course.deleteMany();
    // await prisma.department.deleteMany();
    // await prisma.voter.deleteMany();
    // console.log('✅ Existing data cleared\n');

    // Create Departments
    console.log('🏢 Creating departments...');
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { id: 'DEPT-CS' },
        update: {},
        create: {
          id: 'DEPT-CS',
          name: 'Computer Science',
          description: 'Department of Computer Science and Information Technology',
          createdBy: adminId
        }
      }),
      prisma.department.upsert({
        where: { id: 'DEPT-ENG' },
        update: {},
        create: {
          id: 'DEPT-ENG',
          name: 'Engineering',
          description: 'Department of Engineering and Technology',
          createdBy: adminId
        }
      }),
      prisma.department.upsert({
        where: { id: 'DEPT-BUS' },
        update: {},
        create: {
          id: 'DEPT-BUS',
          name: 'Business Administration',
          description: 'Department of Business and Management',
          createdBy: adminId
        }
      }),
      prisma.department.upsert({
        where: { id: 'DEPT-ARTS' },
        update: {},
        create: {
          id: 'DEPT-ARTS',
          name: 'Arts & Sciences',
          description: 'Department of Arts, Humanities, and Sciences',
          createdBy: adminId
        }
      })
    ]);

    departments.forEach(dept => {
      console.log(`✅ Created department: ${dept.name} (${dept.id})`);
    });

    // Create Courses
    console.log('\n📚 Creating courses...');
    const courses = await Promise.all([
      prisma.course.upsert({
        where: { id: 'COURSE-CS301' },
        update: {},
        create: {
          id: 'COURSE-CS301',
          name: 'Software Engineering',
          code: 'CS301',
          description: 'Advanced software engineering principles and practices',
          departmentId: 'DEPT-CS',
          createdBy: adminId
        }
      }),
      prisma.course.upsert({
        where: { id: 'COURSE-CS302' },
        update: {},
        create: {
          id: 'COURSE-CS302',
          name: 'Database Systems',
          code: 'CS302',
          description: 'Database design, implementation, and management',
          departmentId: 'DEPT-CS',
          createdBy: adminId
        }
      }),
      prisma.course.upsert({
        where: { id: 'COURSE-CS303' },
        update: {},
        create: {
          id: 'COURSE-CS303',
          name: 'Web Development',
          code: 'CS303',
          description: 'Modern web development technologies and frameworks',
          departmentId: 'DEPT-CS',
          createdBy: adminId
        }
      }),
      prisma.course.upsert({
        where: { id: 'COURSE-ENG401' },
        update: {},
        create: {
          id: 'COURSE-ENG401',
          name: 'Mechanical Engineering',
          code: 'ENG401',
          description: 'Core principles of mechanical engineering',
          departmentId: 'DEPT-ENG',
          createdBy: adminId
        }
      }),
      prisma.course.upsert({
        where: { id: 'COURSE-BUS501' },
        update: {},
        create: {
          id: 'COURSE-BUS501',
          name: 'Business Management',
          code: 'BUS501',
          description: 'Principles of business management and leadership',
          departmentId: 'DEPT-BUS',
          createdBy: adminId
        }
      }),
      prisma.course.upsert({
        where: { id: 'COURSE-ARTS601' },
        update: {},
        create: {
          id: 'COURSE-ARTS601',
          name: 'Digital Arts',
          code: 'ARTS601',
          description: 'Digital media and creative arts',
          departmentId: 'DEPT-ARTS',
          createdBy: adminId
        }
      })
    ]);

    courses.forEach(course => {
      console.log(`✅ Created course: ${course.name} (${course.code}) - ${course.id}`);
    });

    // Create Positions with display order for ballot creation
    console.log('\n🎯 Creating positions...');
    const positions = await Promise.all([
      prisma.position.upsert({
        where: { id: 'POS-PRESIDENT' },
        update: {},
        create: {
          id: 'POS-PRESIDENT',
          title: 'Student Council President',
          description: 'Lead the student council and represent student body',
          displayOrder: 1
        }
      }),
      prisma.position.upsert({
        where: { id: 'POS-VP' },
        update: {},
        create: {
          id: 'POS-VP',
          title: 'Vice President',
          description: 'Assist the president and lead in their absence',
          displayOrder: 2
        }
      }),
      prisma.position.upsert({
        where: { id: 'POS-SECRETARY' },
        update: {},
        create: {
          id: 'POS-SECRETARY',
          title: 'Secretary',
          description: 'Manage council records and communications',
          displayOrder: 3
        }
      }),
      prisma.position.upsert({
        where: { id: 'POS-TREASURER' },
        update: {},
        create: {
          id: 'POS-TREASURER',
          title: 'Treasurer',
          description: 'Manage council finances and budget',
          displayOrder: 4
        }
      }),
      prisma.position.upsert({
        where: { id: 'POS-PRO' },
        update: {},
        create: {
          id: 'POS-PRO',
          title: 'Public Relations Officer',
          description: 'Handle external communications and events',
          displayOrder: 5
        }
      }),
      prisma.position.upsert({
        where: { id: 'POS-REP' },
        update: {},
        create: {
          id: 'POS-REP',
          title: 'Course Representative',
          description: 'Represent specific course interests in council',
          displayOrder: 6
        }
      })
    ]);

    positions.forEach(pos => {
      console.log(`✅ Created position: ${pos.title} (${pos.id}) - Order: ${pos.displayOrder}`);
    });

    // Create Candidates
    console.log('\n👨‍💼 Creating candidates...');
    const candidates = await Promise.all([
      // President candidates
      prisma.candidate.upsert({
        where: { id: 'CAND-PRES-1' },
        update: {},
        create: {
          id: 'CAND-PRES-1',
          name: 'Alexandra Santos',
          email: 'alexandra.santos@student.edu',
          studentId: '2024-001',
          courseId: 'COURSE-CS301',
          positionId: 'POS-PRESIDENT',
          manifesto: 'Passionate leader with experience in student organizations',
          photo: null
        }
      }),
      prisma.candidate.upsert({
        where: { id: 'CAND-PRES-2' },
        update: {},
        create: {
          id: 'CAND-PRES-2',
          name: 'Miguel Cruz',
          email: 'miguel.cruz@student.edu',
          studentId: '2024-002',
          courseId: 'COURSE-BUS501',
          positionId: 'POS-PRESIDENT',
          manifesto: 'Business-minded leader focused on student success',
          photo: null
        }
      }),
      prisma.candidate.upsert({
        where: { id: 'CAND-PRES-3' },
        update: {},
        create: {
          id: 'CAND-PRES-3',
          name: 'Isabella Reyes',
          email: 'isabella.reyes@student.edu',
          studentId: '2024-003',
          courseId: 'COURSE-ENG401',
          positionId: 'POS-PRESIDENT',
          manifesto: 'Engineering student with strong problem-solving skills',
          photo: null
        }
      }),

      // Vice President candidates
      prisma.candidate.upsert({
        where: { id: 'CAND-VP-1' },
        update: {},
        create: {
          id: 'CAND-VP-1',
          name: 'David Kim',
          email: 'david.kim@student.edu',
          studentId: '2024-004',
          courseId: 'COURSE-CS302',
          positionId: 'POS-VP',
          manifesto: 'Database expert with leadership experience',
          photo: null
        }
      }),
      prisma.candidate.upsert({
        where: { id: 'CAND-VP-2' },
        update: {},
        create: {
          id: 'CAND-VP-2',
          name: 'Sophia Chen',
          email: 'sophia.chen@student.edu',
          studentId: '2024-005',
          courseId: 'COURSE-ARTS601',
          positionId: 'POS-VP',
          manifesto: 'Creative leader with strong communication skills',
          photo: null
        }
      }),

      // Secretary candidates
      prisma.candidate.upsert({
        where: { id: 'CAND-SEC-1' },
        update: {},
        create: {
          id: 'CAND-SEC-1',
          name: 'Ryan Thompson',
          email: 'ryan.thompson@student.edu',
          studentId: '2024-006',
          courseId: 'COURSE-CS303',
          positionId: 'POS-SECRETARY',
          manifesto: 'Web developer with excellent organizational skills',
          photo: null
        }
      }),

      // Treasurer candidates
      prisma.candidate.upsert({
        where: { id: 'CAND-TREAS-1' },
        update: {},
        create: {
          id: 'CAND-TREAS-1',
          name: 'Emma Wilson',
          email: 'emma.wilson@student.edu',
          studentId: '2024-007',
          courseId: 'COURSE-BUS501',
          positionId: 'POS-TREASURER',
          manifesto: 'Business student with financial management experience',
          photo: null
        }
      }),
      prisma.candidate.upsert({
        where: { id: 'CAND-TREAS-2' },
        update: {},
        create: {
          id: 'CAND-TREAS-2',
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@student.edu',
          studentId: '2024-008',
          courseId: 'COURSE-ENG401',
          positionId: 'POS-TREASURER',
          manifesto: 'Engineering student with budget planning skills',
          photo: null
        }
      }),

      // PRO candidates
      prisma.candidate.upsert({
        where: { id: 'CAND-PRO-1' },
        update: {},
        create: {
          id: 'CAND-PRO-1',
          name: 'Lisa Park',
          email: 'lisa.park@student.edu',
          studentId: '2024-009',
          courseId: 'COURSE-ARTS601',
          positionId: 'POS-PRO',
          manifesto: 'Digital artist with event planning experience',
          photo: null
        }
      }),

      // Course Representative candidates
      prisma.candidate.upsert({
        where: { id: 'CAND-REP-1' },
        update: {},
        create: {
          id: 'CAND-REP-1',
          name: 'James Miller',
          email: 'james.miller@student.edu',
          studentId: '2024-010',
          courseId: 'COURSE-CS301',
          positionId: 'POS-REP',
          manifesto: 'Software engineering student representing CS department',
          photo: null
        }
      }),
      prisma.candidate.upsert({
        where: { id: 'CAND-REP-2' },
        update: {},
        create: {
          id: 'CAND-REP-2',
          name: 'Nina Patel',
          email: 'nina.patel@student.edu',
          studentId: '2024-011',
          courseId: 'COURSE-BUS501',
          positionId: 'POS-REP',
          manifesto: 'Business student representing management department',
          photo: null
        }
      })
    ]);

    candidates.forEach(candidate => {
      console.log(`✅ Created candidate: ${candidate.name} (${candidate.studentId}) for ${candidate.positionId}`);
    });

    // Create Sample Voters
    console.log('\n🗳️ Creating sample voters...');
    const voters = await Promise.all([
      prisma.voter.upsert({
        where: { id: 'VOTER-001' },
        update: {},
        create: {
          id: 'VOTER-001',
          name: 'Alice Johnson',
          studentId: '2024-101',
          email: 'alice.johnson@student.edu',
          password: await bcrypt.hash('voter123', 10),
          courseId: 'COURSE-CS301',
          hasVoted: false
        }
      }),
      prisma.voter.upsert({
        where: { id: 'VOTER-002' },
        update: {},
        create: {
          id: 'VOTER-002',
          name: 'Bob Smith',
          studentId: '2024-102',
          email: 'bob.smith@student.edu',
          password: await bcrypt.hash('voter123', 10),
          courseId: 'COURSE-CS302',
          hasVoted: false
        }
      }),
      prisma.voter.upsert({
        where: { id: 'VOTER-003' },
        update: {},
        create: {
          id: 'VOTER-003',
          name: 'Carol Davis',
          studentId: '2024-103',
          email: 'carol.davis@student.edu',
          password: await bcrypt.hash('voter123', 10),
          courseId: 'COURSE-BUS501',
          hasVoted: false
        }
      }),
      prisma.voter.upsert({
        where: { id: 'VOTER-004' },
        update: {},
        create: {
          id: 'VOTER-004',
          name: 'Daniel Brown',
          studentId: '2024-104',
          email: 'daniel.brown@student.edu',
          password: await bcrypt.hash('voter123', 10),
          courseId: 'COURSE-ENG401',
          hasVoted: false
        }
      }),
      prisma.voter.upsert({
        where: { id: 'VOTER-005' },
        update: {},
        create: {
          id: 'VOTER-005',
          name: 'Eva Garcia',
          studentId: '2024-105',
          email: 'eva.garcia@student.edu',
          password: await bcrypt.hash('voter123', 10),
          courseId: 'COURSE-ARTS601',
          hasVoted: false
        }
      })
    ]);

    voters.forEach(voter => {
      console.log(`✅ Created voter: ${voter.name} (${voter.studentId}) - ${voter.email}`);
    });

    console.log('\n🎉 === Ballot Test Data Seeding Complete ===');
    console.log('\n📊 Summary:');
    console.log(`   👤 Admin: ${adminId}`);
    console.log(`   🏢 Departments: ${departments.length} (CS, Engineering, Business, Arts)`);
    console.log(`   📚 Courses: ${courses.length} (CS301, CS302, CS303, ENG401, BUS501, ARTS601)`);
    console.log(`   🎯 Positions: ${positions.length} (President, VP, Secretary, Treasurer, PRO, Rep)`);
    console.log(`   👨‍💼 Candidates: ${candidates.length} (Multiple candidates per position)`);
    console.log(`   🗳️  Voters: ${voters.length} (Ready for testing)`);
    console.log('\n🔑 Test Credentials:');
    console.log(`   👤 SuperAdmin: superadmin / superadmin123`);
    console.log(`   🗳️  Voters: Any voter email / voter123`);
    console.log('\n🎯 Ready to test ballot creation process!');

  } catch (error) {
    console.error('❌ Error seeding ballot test data:', error);
    throw error;
  }
}

seedBallotTestData()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
