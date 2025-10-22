import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting realistic test data seeding...');

  try {
    // 1. Check and create Departments if they don't exist
    console.log('📚 Checking departments...');
    const existingDepartments = await prisma.department.findMany();
    console.log(`Found ${existingDepartments.length} existing departments`);
    
    if (existingDepartments.length === 0) {
      console.log('Creating departments...');
      const departments = await Promise.all([
        prisma.department.create({
          data: {
            id: 'CS',
            Department_Name: 'Computer Science',
            Department_Description: 'Department of Computer Science',
            createdBy: 'SUPERADMIN-1'
          }
        }),
        prisma.department.create({
          data: {
            id: 'IT',
            Department_Name: 'Information Technology',
            Department_Description: 'Department of Information Technology',
            createdBy: 'SUPERADMIN-1'
          }
        }),
        prisma.department.create({
          data: {
            id: 'CE',
            Department_Name: 'Computer Engineering',
            Department_Description: 'Department of Computer Engineering',
            createdBy: 'SUPERADMIN-1'
          }
        })
      ]);
      console.log(`Created ${departments.length} departments`);
    }

    // 2. Check and create Courses if they don't exist
    console.log('🎓 Checking courses...');
    const existingCourses = await prisma.course.findMany();
    console.log(`Found ${existingCourses.length} existing courses`);
    
    if (existingCourses.length === 0) {
      console.log('Creating courses...');
      const courses = await Promise.all([
        prisma.course.create({
          data: {
            id: 'CS-2024',
            Course_Name: 'Bachelor of Science in Computer Science',
            Course_Code: 'CS-2024',
            departmentId: 'CS',
            createdBy: 'SUPERADMIN-1'
          }
        }),
        prisma.course.create({
          data: {
            id: 'IT-2024',
            Course_Name: 'Bachelor of Science in Information Technology',
            Course_Code: 'IT-2024',
            departmentId: 'IT',
            createdBy: 'SUPERADMIN-1'
          }
        }),
        prisma.course.create({
          data: {
            id: 'CE-2024',
            Course_Name: 'Bachelor of Science in Computer Engineering',
            Course_Code: 'CE-2024',
            departmentId: 'CE',
            createdBy: 'SUPERADMIN-1'
          }
        })
      ]);
      console.log(`Created ${courses.length} courses`);
    }

    // 3. Check and create Party Lists if they don't exist
    console.log('🎭 Checking party lists...');
    const existingPartyLists = await prisma.partyList.findMany();
    console.log(`Found ${existingPartyLists.length} existing party lists`);
    
    if (existingPartyLists.length === 0) {
      console.log('Creating party lists...');
      const partyLists = await Promise.all([
        prisma.partyList.create({
          data: {
            id: 'TECH-PARTY',
            name: 'Tech Forward Party',
            description: 'Advocating for technological advancement and innovation',
            color: '#007BFF'
          }
        }),
        prisma.partyList.create({
          data: {
            id: 'STUDENT-PARTY',
            name: 'Student Unity Party',
            description: 'Promoting student welfare and academic excellence',
            color: '#28A745'
          }
        }),
        prisma.partyList.create({
          data: {
            id: 'PROGRESS-PARTY',
            name: 'Progressive Students Party',
            description: 'Focused on progressive change and student rights',
            color: '#FF6B6B'
          }
        })
      ]);
      console.log(`Created ${partyLists.length} party lists`);
    }

    // 4. Check and create Candidates if they don't exist
    console.log('👥 Checking candidates...');
    const existingCandidates = await prisma.candidate.findMany();
    console.log(`Found ${existingCandidates.length} existing candidates`);
    
    if (existingCandidates.length === 0) {
      console.log('Creating candidates...');
      const positions = await prisma.position.findMany();
      const departments = await prisma.department.findMany();
      const courses = await prisma.course.findMany();
      const partyLists = await prisma.partyList.findMany();
      const candidates = [];

      for (const position of positions) {
        // Create 3 candidates per position
        for (let i = 0; i < 3; i++) {
          const partyList = partyLists[Math.floor(Math.random() * partyLists.length)];
          const department = departments[Math.floor(Math.random() * departments.length)];
          const course = courses.find(c => c.departmentId === department.id);
          
          const candidate = await prisma.candidate.create({
            data: {
              id: `${position.id}-CAND-${i + 1}`,
              Candidate_Name: `Candidate ${i + 1} for ${position.Position_Title}`,
              Candidate_Email: `candidate${i + 1}@university.edu`,
              Candidate_StudentId: `${department.id}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
              courseId: course.id,
              partyListId: partyList.id,
              positionId: position.id,
              manifesto: `I promise to work hard for the students and bring positive changes to our ${position.Position_Title.toLowerCase()} position.`
            }
          });
          candidates.push(candidate);
        }
      }
      console.log(`Created ${candidates.length} candidates`);
    }

    // 5. Check and create Voters if they don't exist
    console.log('🗳️ Checking voters...');
    const existingVoters = await prisma.voter.findMany();
    console.log(`Found ${existingVoters.length} existing voters`);
    
    if (existingVoters.length === 0) {
      console.log('Creating voters...');
      const departments = await prisma.department.findMany();
      const courses = await prisma.course.findMany();
      const voters = [];
      const softDeletedVoters = [];

      // Create active voters
      for (let i = 1; i <= 100; i++) {
        const department = departments[Math.floor(Math.random() * departments.length)];
        const course = courses.find(c => c.departmentId === department.id);
        
        const voter = await prisma.voter.create({
          data: {
            id: `VOTER-${String(i).padStart(3, '0')}`,
            Voter_Name: `Student ${i}`,
            Voter_StudentId: `${department.id}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            Voter_Email: `student${i}@university.edu`,
            courseId: course.id,
            password: await bcrypt.hash('password123', 10),
            hasVoted: Math.random() > 0.3 // 70% have voted
          }
        });
        voters.push(voter);
      }

      // Create soft-deleted voters (some who voted before deletion)
      for (let i = 1; i <= 20; i++) {
        const department = departments[Math.floor(Math.random() * departments.length)];
        const course = courses.find(c => c.departmentId === department.id);
        
        const voter = await prisma.voter.create({
          data: {
            id: `DELETED-VOTER-${String(i).padStart(3, '0')}`,
            Voter_Name: `Deleted Student ${i}`,
            Voter_StudentId: `${department.id}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            Voter_Email: `deleted${i}@university.edu`,
            courseId: course.id,
            password: await bcrypt.hash('password123', 10),
            hasVoted: Math.random() > 0.4, // 60% had voted before deletion
            deletedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Deleted within last 30 days
          }
        });
        softDeletedVoters.push(voter);
      }
      console.log(`Created ${voters.length} active voters and ${softDeletedVoters.length} soft-deleted voters`);
    }

    // 6. Check and create Ballots if they don't exist
    console.log('📋 Checking ballots...');
    const existingBallots = await prisma.ballot.findMany();
    console.log(`Found ${existingBallots.length} existing ballots`);
    
    if (existingBallots.length === 0) {
      console.log('Creating ballots...');
      const ballots = [];
      const softDeletedBallots = [];

      // Create active ballot
      const activeBallot = await prisma.ballot.create({
        data: {
          id: 'BALLOT-ACTIVE-001',
          Ballot_Title: 'Current Student Council Elections 2024',
          Ballot_Description: 'Elections for the current academic year student council positions',
          Ballot_StartDate: new Date(),
          Ballot_EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          Ballot_IsActive: true,
          Ballot_CreatedBy: 'SUPERADMIN-1'
        }
      });
      ballots.push(activeBallot);

      // Create completed ballot
      const completedBallot = await prisma.ballot.create({
        data: {
          id: 'BALLOT-COMPLETED-001',
          Ballot_Title: 'Previous Student Council Elections 2023',
          Ballot_Description: 'Completed elections from last academic year',
          Ballot_StartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          Ballot_EndDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          Ballot_IsActive: false,
          Ballot_CreatedBy: 'SUPERADMIN-1'
        }
      });
      ballots.push(completedBallot);

      // Create soft-deleted ballot with votes
      const softDeletedBallot = await prisma.ballot.create({
        data: {
          id: 'BALLOT-DELETED-001',
          Ballot_Title: 'Cancelled Elections 2024',
          Ballot_Description: 'This ballot was cancelled due to technical issues',
          Ballot_StartDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          Ballot_EndDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          Ballot_IsActive: false,
          Ballot_DeletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Deleted 3 days ago
          Ballot_CreatedBy: 'SUPERADMIN-1'
        }
      });
      softDeletedBallots.push(softDeletedBallot);

      console.log(`Created ${ballots.length} active/completed ballots and ${softDeletedBallots.length} soft-deleted ballots`);
    }

    // 7. Create some additional test data (votes, login logs, etc.)
    console.log('📊 Creating additional test data...');
    
    // Create some login logs
    const existingLoginLogs = await prisma.adminLoginLog.count();
    if (existingLoginLogs === 0) {
      console.log('Creating admin login logs...');
      for (let i = 0; i < 20; i++) {
        await prisma.adminLoginLog.create({
          data: {
            id: `ALL-${i}`,
            adminId: 'SUPERADMIN-1',
            loginTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      }
    }

    const existingUserLoginLogs = await prisma.userLoginLog.count();
    if (existingUserLoginLogs === 0) {
      console.log('Creating user login logs...');
      const voters = await prisma.voter.findMany({ take: 10 });
      for (let i = 0; i < 50; i++) {
        const voter = voters[Math.floor(Math.random() * voters.length)];
        
        await prisma.userLoginLog.create({
          data: {
            id: `ULL-${i}`,
            userId: voter.id,
            loginTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      }
    }

    // Create some audit logs
    const existingAuditLogs = await prisma.auditLog.count();
    if (existingAuditLogs === 0) {
      console.log('Creating audit logs...');
      const auditActions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VOTE'];
      const auditEntities = ['VOTER', 'CANDIDATE', 'BALLOT', 'VOTE', 'ADMIN'];
      const voters = await prisma.voter.findMany({ take: 10 });
      
      for (let i = 0; i < 50; i++) {
        await prisma.auditLog.create({
          data: {
            id: `AL-${i}`,
            eventType: auditEntities[Math.floor(Math.random() * auditEntities.length)],
            action: auditActions[Math.floor(Math.random() * auditActions.length)],
            userId: voters.length > 0 ? voters[Math.floor(Math.random() * voters.length)].id : null,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            details: `Audit log entry ${i} - ${auditActions[Math.floor(Math.random() * auditActions.length)]} action performed`,
            severity: 'INFO'
          }
        });
      }
    }

    console.log('✅ Realistic test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    
    const finalCounts = {
      departments: await prisma.department.count(),
      courses: await prisma.course.count(),
      partyLists: await prisma.partyList.count(),
      candidates: await prisma.candidate.count(),
      voters: await prisma.voter.count(),
      ballots: await prisma.ballot.count(),
      votes: await prisma.vote.count(),
      adminLoginLogs: await prisma.adminLoginLog.count(),
      userLoginLogs: await prisma.userLoginLog.count(),
      auditLogs: await prisma.auditLog.count()
    };

    console.log(`- ${finalCounts.departments} departments`);
    console.log(`- ${finalCounts.courses} courses`);
    console.log(`- ${finalCounts.partyLists} party lists`);
    console.log(`- ${finalCounts.candidates} candidates`);
    console.log(`- ${finalCounts.voters} voters`);
    console.log(`- ${finalCounts.ballots} ballots`);
    console.log(`- ${finalCounts.votes} votes`);
    console.log(`- ${finalCounts.adminLoginLogs} admin login logs`);
    console.log(`- ${finalCounts.userLoginLogs} user login logs`);
    console.log(`- ${finalCounts.auditLogs} audit logs`);
    console.log('\n🎯 Database now simulates a fully used voting system!');

  } catch (error) {
    console.error('❌ Error seeding realistic test data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
