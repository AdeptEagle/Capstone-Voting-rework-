import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate proper position IDs
function generatePositionId(positionTitle: string): string {
  // Create a mapping of position titles to proper IDs
  const positionIdMap: { [key: string]: string } = {
    'Student Council President': 'PRES',
    'Student Council Vice President': 'V-PRES',
    'Student Council Secretary': 'SEC',
    'Student Council Treasurer': 'TREAS'
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
  const year = Math.floor(Math.random() * 4) + 2020;
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `${year}-${randomNum}`;
}

async function seedTestData() {
  console.log('🧪 Starting test data seeding...');

  try {
    // Clear existing test data (keep admins)
    console.log('🧹 Clearing existing test data...');
    await prisma.ballotResultDetails.deleteMany();
    await prisma.ballotResults.deleteMany();
    await prisma.userBallotHistory.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.ballotCandidate.deleteMany();
    await prisma.ballotPosition.deleteMany();
    await prisma.ballot.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.voter.deleteMany();
    await prisma.course.deleteMany();
    await prisma.department.deleteMany();
    await prisma.position.deleteMany();

    // Get admin for creating records
    const admin = await prisma.admin.findFirst({
      where: { role: 'SUPERADMIN' }
    });

    if (!admin) {
      throw new Error('No admin found. Please ensure admins exist.');
    }

    console.log('🏢 Creating departments...');
    const departments = await Promise.all([
      prisma.department.create({
        data: {
          id: generateId(),
          Department_Name: 'Computer Science',
          Department_Description: 'Department of Computer Science',
          createdBy: admin.id,
        },
      }),
      prisma.department.create({
        data: {
          id: generateId(),
          Department_Name: 'Engineering',
          Department_Description: 'Department of Engineering',
          createdBy: admin.id,
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
          Course_Description: '4-year CS program',
          departmentId: departments[0].id,
          createdBy: admin.id,
        },
      }),
      prisma.course.create({
        data: {
          id: generateId(),
          Course_Name: 'Bachelor of Science in Engineering',
          Course_Code: 'BSE',
          Course_Description: '4-year Engineering program',
          departmentId: departments[1].id,
          createdBy: admin.id,
        },
      }),
    ]);

    console.log('🎯 Creating positions...');
    const positions = await Promise.all([
      prisma.position.create({
        data: {
          id: generatePositionId('Student Council President'),
          Position_Title: 'Student Council President',
          Position_Description: 'Leader of the student body',
          voteLimit: 1, // Single vote limit
          displayOrder: 1,
        },
      }),
      prisma.position.create({
        data: {
          id: generatePositionId('Student Council Vice President'),
          Position_Title: 'Student Council Vice President',
          Position_Description: 'Assists the president',
          voteLimit: 1, // Single vote limit
          displayOrder: 2,
        },
      }),
      prisma.position.create({
        data: {
          id: generatePositionId('Student Council Secretary'),
          Position_Title: 'Student Council Secretary',
          Position_Description: 'Handles documentation',
          voteLimit: 2, // Multiple vote limit
          displayOrder: 3,
        },
      }),
      prisma.position.create({
        data: {
          id: generatePositionId('Student Council Treasurer'),
          Position_Title: 'Student Council Treasurer',
          Position_Description: 'Manages finances',
          voteLimit: 3, // Multiple vote limit
          displayOrder: 4,
        },
      }),
    ]);

    console.log('👥 Creating candidates...');
    const candidates = await Promise.all([
      // President candidates
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'John Smith',
          Candidate_Email: 'john.smith@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will promote technology innovation',
          positionId: positions[0].id,
          departmentId: departments[0].id,
          courseId: courses[0].id,
        },
      }),
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Jane Doe',
          Candidate_Email: 'jane.doe@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will advocate for better facilities',
          positionId: positions[0].id,
          departmentId: departments[0].id,
          courseId: courses[0].id,
        },
      }),
      // Vice President candidates
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Mike Johnson',
          Candidate_Email: 'mike.johnson@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will work towards industry partnerships',
          positionId: positions[1].id,
          departmentId: departments[1].id,
          courseId: courses[1].id,
        },
      }),
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Sarah Wilson',
          Candidate_Email: 'sarah.wilson@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will organize engineering competitions',
          positionId: positions[1].id,
          departmentId: departments[1].id,
          courseId: courses[1].id,
        },
      }),
      // Secretary candidates (multiple vote limit)
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Alex Brown',
          Candidate_Email: 'alex.brown@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will create networking opportunities',
          positionId: positions[2].id,
          departmentId: departments[0].id,
          courseId: courses[0].id,
        },
      }),
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Emma Davis',
          Candidate_Email: 'emma.davis@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will establish mentorship programs',
          positionId: positions[2].id,
          departmentId: departments[1].id,
          courseId: courses[1].id,
        },
      }),
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Chris Lee',
          Candidate_Email: 'chris.lee@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will promote cultural diversity',
          positionId: positions[2].id,
          departmentId: departments[0].id,
          courseId: courses[0].id,
        },
      }),
      // Treasurer candidates (multiple vote limit)
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'David Miller',
          Candidate_Email: 'david.miller@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will organize science fairs',
          positionId: positions[3].id,
          departmentId: departments[1].id,
          courseId: courses[1].id,
        },
      }),
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Lisa Garcia',
          Candidate_Email: 'lisa.garcia@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will manage finances transparently',
          positionId: positions[3].id,
          departmentId: departments[0].id,
          courseId: courses[0].id,
        },
      }),
      prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: 'Tom Anderson',
          Candidate_Email: 'tom.anderson@student.edu',
          Candidate_StudentId: generateStudentId(),
          manifesto: 'I will ensure financial accountability',
          positionId: positions[3].id,
          departmentId: departments[1].id,
          courseId: courses[1].id,
        },
      }),
    ]);

    console.log('🗳️ Creating voters...');
    const voters = await Promise.all([
      // Test voters for different scenarios
      prisma.voter.create({
        data: {
          id: generateId(),
          Voter_Name: 'Test Voter 1',
          Voter_Email: 'voter1@test.edu',
          Voter_StudentId: '2024-00001',
          password: await bcrypt.hash('password123', 10),
          departmentId: departments[0].id,
          courseId: courses[0].id,
        },
      }),
      prisma.voter.create({
        data: {
          id: generateId(),
          Voter_Name: 'Test Voter 2',
          Voter_Email: 'voter2@test.edu',
          Voter_StudentId: '2024-00002',
          password: await bcrypt.hash('password123', 10),
          departmentId: departments[1].id,
          courseId: courses[1].id,
        },
      }),
      prisma.voter.create({
        data: {
          id: generateId(),
          Voter_Name: 'Test Voter 3',
          Voter_Email: 'voter3@test.edu',
          Voter_StudentId: '2024-00003',
          password: await bcrypt.hash('password123', 10),
          departmentId: departments[0].id,
          courseId: courses[0].id,
        },
      }),
    ]);

    console.log('🏛️ Creating dummy election for vote compatibility...');
    const dummyElection = await prisma.election.create({
      data: {
        id: generateId(),
        Election_Title: 'Dummy Election for Ballot System',
        Election_Description: 'Dummy election to maintain vote table compatibility',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActive: false,
        status: 'draft',
        createdBy: admin.id,
      },
    });

    console.log('📋 Creating ballots...');
    const now = new Date();
    const startDate1 = new Date(now.getTime() + 1000); // 1 second from now
    const endDate1 = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const startDate2 = new Date(now.getTime() + 2 * 1000); // 2 seconds from now
    const endDate2 = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

    // Ballot 1: Single vote limit positions only
    const ballot1 = await prisma.ballot.create({
      data: {
        id: generateId(),
        Ballot_Title: 'Student Council Election 2024 - Round 1',
        Ballot_Description: 'Election for President and Vice President positions',
        Ballot_StartDate: startDate1,
        Ballot_EndDate: endDate1,
        Ballot_Status: 'ACTIVE',
        Ballot_IsActive: true,
        Ballot_MaxVotesPerUser: 1,
        Ballot_AllowMultipleVotes: false,
        Ballot_RequireAllPositions: true,
        Ballot_ShowResults: true,
        Ballot_ShowLiveResults: true,
        Ballot_CreatedBy: admin.id,
      },
    });

    // Ballot 2: Mixed vote limits (single and multiple)
    const ballot2 = await prisma.ballot.create({
      data: {
        id: generateId(),
        Ballot_Title: 'Student Council Election 2024 - Round 2',
        Ballot_Description: 'Election for Secretary and Treasurer positions',
        Ballot_StartDate: startDate2,
        Ballot_EndDate: endDate2,
        Ballot_Status: 'ACTIVE',
        Ballot_IsActive: true,
        Ballot_MaxVotesPerUser: 1,
        Ballot_AllowMultipleVotes: false,
        Ballot_RequireAllPositions: true,
        Ballot_ShowResults: true,
        Ballot_ShowLiveResults: true,
        Ballot_CreatedBy: admin.id,
      },
    });

    console.log('🔗 Linking positions to ballots...');
    // Ballot 1: President and Vice President (single vote limits)
    await Promise.all([
      prisma.ballotPosition.create({
        data: {
          id: generateId(),
          BallotPosition_BallotId: ballot1.id,
          BallotPosition_PositionId: positions[0].id, // President
          BallotPosition_DisplayOrder: 1,
          BallotPosition_IsRequired: true,
        },
      }),
      prisma.ballotPosition.create({
        data: {
          id: generateId(),
          BallotPosition_BallotId: ballot1.id,
          BallotPosition_PositionId: positions[1].id, // Vice President
          BallotPosition_DisplayOrder: 2,
          BallotPosition_IsRequired: true,
        },
      }),
    ]);

    // Ballot 2: Secretary and Treasurer (multiple vote limits)
    await Promise.all([
      prisma.ballotPosition.create({
        data: {
          id: generateId(),
          BallotPosition_BallotId: ballot2.id,
          BallotPosition_PositionId: positions[2].id, // Secretary
          BallotPosition_DisplayOrder: 1,
          BallotPosition_IsRequired: true,
        },
      }),
      prisma.ballotPosition.create({
        data: {
          id: generateId(),
          BallotPosition_BallotId: ballot2.id,
          BallotPosition_PositionId: positions[3].id, // Treasurer
          BallotPosition_DisplayOrder: 2,
          BallotPosition_IsRequired: true,
        },
      }),
    ]);

    console.log('🔗 Linking candidates to ballots...');
    // Ballot 1 candidates (President and Vice President)
    await Promise.all([
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot1.id,
          BallotCandidate_CandidateId: candidates[0].id, // John Smith (President)
          BallotCandidate_PositionId: positions[0].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot1.id,
          BallotCandidate_CandidateId: candidates[1].id, // Jane Doe (President)
          BallotCandidate_PositionId: positions[0].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot1.id,
          BallotCandidate_CandidateId: candidates[2].id, // Mike Johnson (Vice President)
          BallotCandidate_PositionId: positions[1].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot1.id,
          BallotCandidate_CandidateId: candidates[3].id, // Sarah Wilson (Vice President)
          BallotCandidate_PositionId: positions[1].id,
          BallotCandidate_IsActive: true,
        },
      }),
    ]);

    // Ballot 2 candidates (Secretary and Treasurer)
    await Promise.all([
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot2.id,
          BallotCandidate_CandidateId: candidates[4].id, // Alex Brown (Secretary)
          BallotCandidate_PositionId: positions[2].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot2.id,
          BallotCandidate_CandidateId: candidates[5].id, // Emma Davis (Secretary)
          BallotCandidate_PositionId: positions[2].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot2.id,
          BallotCandidate_CandidateId: candidates[6].id, // Chris Lee (Secretary)
          BallotCandidate_PositionId: positions[2].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot2.id,
          BallotCandidate_CandidateId: candidates[7].id, // David Miller (Treasurer)
          BallotCandidate_PositionId: positions[3].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot2.id,
          BallotCandidate_CandidateId: candidates[8].id, // Lisa Garcia (Treasurer)
          BallotCandidate_PositionId: positions[3].id,
          BallotCandidate_IsActive: true,
        },
      }),
      prisma.ballotCandidate.create({
        data: {
          id: generateId(),
          BallotCandidate_BallotId: ballot2.id,
          BallotCandidate_CandidateId: candidates[9].id, // Tom Anderson (Treasurer)
          BallotCandidate_PositionId: positions[3].id,
          BallotCandidate_IsActive: true,
        },
      }),
    ]);

    console.log('✅ Test data seeding completed successfully!');
    console.log('');
    console.log('📊 Test Data Summary:');
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Positions: ${positions.length}`);
    console.log(`   - Candidates: ${candidates.length}`);
    console.log(`   - Voters: ${voters.length}`);
    console.log(`   - Ballots: 2`);
    console.log('');
    console.log('🎯 Test Scenarios:');
    console.log('   Ballot 1: President & Vice President (1 vote limit each)');
    console.log('   Ballot 2: Secretary (2 vote limit) & Treasurer (3 vote limit)');
    console.log('');
    console.log('👥 Test Voters:');
    console.log('   - voter1@test.edu (Student ID: 2024-00001)');
    console.log('   - voter2@test.edu (Student ID: 2024-00002)');
    console.log('   - voter3@test.edu (Student ID: 2024-00003)');
    console.log('   Password for all: password123');
    console.log('');
    console.log('🔑 Admin Credentials:');
    console.log('   - superadmin / superadmin123');
    console.log('   - admin / admin123');

    return {
      ballot1,
      ballot2,
      voters,
      candidates,
      positions,
    };

  } catch (error) {
    console.error('❌ Error during test data seeding:', error);
    throw error;
  }
}

seedTestData()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
