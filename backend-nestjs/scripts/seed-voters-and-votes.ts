import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
  console.log('🌱 Starting voter and vote data seeding...');

  try {
    // Get existing data
    const existingDepartments = await prisma.department.findMany({
      where: { isDeleted: false }
    });
    const existingCourses = await prisma.course.findMany({
      where: { isDeleted: false }
    });
    const existingBallots = await prisma.ballot.findMany();
    const existingCandidates = await prisma.candidate.findMany({
      where: { isDeleted: false }
    });

    if (existingDepartments.length === 0 || existingCourses.length === 0) {
      console.log('❌ No departments or courses found. Please run the main seed script first.');
      return;
    }

    console.log(`📊 Found ${existingDepartments.length} departments, ${existingCourses.length} courses`);
    console.log(`📊 Found ${existingBallots.length} ballots, ${existingCandidates.length} candidates`);

    // Create voters
    console.log('🗳️ Creating voters...');
    const voters = [];
    
    for (let i = 1; i <= 150; i++) {
      const randomDept = existingDepartments[Math.floor(Math.random() * existingDepartments.length)];
      const deptCourses = existingCourses.filter(c => c.departmentId === randomDept.id);
      const randomCourse = deptCourses.length > 0 ? deptCourses[Math.floor(Math.random() * deptCourses.length)] : existingCourses[0];

      const voterNames = [
        'Alexandra Marie Santos', 'Carlos Miguel Reyes', 'Isabella Grace Cruz',
        'Diego Antonio Mendoza', 'Sofia Isabel Torres', 'Gabriel Enrique Lim',
        'Maria Clara Rodriguez', 'Luis Miguel Santos', 'Ana Sofia Martinez',
        'Jose Antonio Cruz', 'Carmen Elena Reyes', 'Roberto Carlos Torres',
        'Patricia Ann Santos', 'Fernando Jose Cruz', 'Monica Isabel Reyes',
        'Ricardo Antonio Santos', 'Elena Maria Cruz', 'Miguel Angel Reyes',
        'Valentina Sofia Santos', 'Sebastian Jose Cruz', 'Camila Elena Reyes',
        'Nicolas Antonio Santos', 'Isabella Maria Cruz', 'Santiago Jose Reyes',
        'Andrea Sofia Santos', 'Mateo Antonio Cruz', 'Lucia Elena Reyes',
        'Emilio Jose Santos', 'Catalina Maria Cruz', 'Alejandro Reyes'
      ];

      const voter = await prisma.voter.create({
        data: {
          id: generateId(),
          Voter_Name: voterNames[i % voterNames.length],
          Voter_Email: `voter${i}@student.edu`,
          Voter_StudentId: generateUniqueStudentId(),
          password: await bcrypt.hash('password123', 10),
          departmentId: randomDept.id,
          courseId: randomCourse.id,
          hasVoted: Math.random() > 0.3, // 70% have voted
        },
      });
      voters.push(voter);
    }

    console.log(`✅ Created ${voters.length} voters`);

    // Create votes for completed ballot
    console.log('🗳️ Creating vote data...');
    const completedBallot = existingBallots.find(b => b.Ballot_Status === 'ENDED');
    
    if (completedBallot) {
      const votes = [];
      const votersWhoVoted = voters.filter(v => v.hasVoted);
      
      console.log(`📊 Creating votes for ${votersWhoVoted.length} voters who have voted`);
      
      for (const voter of votersWhoVoted) {
        // Get all positions for this ballot
        const ballotPositions = await prisma.ballotPosition.findMany({
          where: { BallotPosition_BallotId: completedBallot.id }
        });
        
        for (const ballotPosition of ballotPositions) {
          // Get candidates for this position in this ballot
          const ballotCandidates = await prisma.ballotCandidate.findMany({
            where: {
              BallotCandidate_BallotId: completedBallot.id,
              BallotCandidate_PositionId: ballotPosition.BallotPosition_PositionId
            }
          });
          
          if (ballotCandidates.length > 0) {
            // Get the position to check vote limit
            const position = await prisma.position.findUnique({
              where: { id: ballotPosition.BallotPosition_PositionId }
            });
            
            if (position) {
              // For single-vote positions, vote for one candidate
              // For multi-vote positions, vote for multiple candidates
              const votesToCast = position.voteLimit === 1 ? 1 : 
                Math.floor(Math.random() * Math.min(position.voteLimit, ballotCandidates.length)) + 1;
              
              const selectedCandidates = ballotCandidates
                .sort(() => Math.random() - 0.5)
                .slice(0, votesToCast);
              
              for (const selectedCandidate of selectedCandidates) {
                const vote = await prisma.vote.create({
                  data: {
                    id: generateId(),
                    voterId: voter.id,
                    candidateId: selectedCandidate.BallotCandidate_CandidateId,
                    positionId: ballotPosition.BallotPosition_PositionId,
                    ballotId: completedBallot.id,
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    sessionId: `session_${generateId()}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    verificationCode: `VERIFY_${generateId()}`,
                    auditHash: `hash_${generateId()}`,
                  },
                });
                votes.push(vote);
              }
            }
          }
        }
      }
      
      console.log(`✅ Created ${votes.length} votes for completed ballot`);
    }

    // Create some votes for active ballot
    const activeBallot = existingBallots.find(b => b.Ballot_Status === 'ACTIVE');
    
    if (activeBallot) {
      const activeVotes = [];
      const votersForActive = voters.slice(0, 50); // First 50 voters
      
      console.log(`📊 Creating votes for active ballot`);
      
      for (const voter of votersForActive) {
        // Create votes for some positions in the active ballot
        const ballotPositions = await prisma.ballotPosition.findMany({
          where: { BallotPosition_BallotId: activeBallot.id },
          take: Math.floor(Math.random() * 3) + 1 // Random 1-3 positions
        });
        
        for (const ballotPosition of ballotPositions) {
          const ballotCandidates = await prisma.ballotCandidate.findMany({
            where: {
              BallotCandidate_BallotId: activeBallot.id,
              BallotCandidate_PositionId: ballotPosition.BallotPosition_PositionId
            }
          });
          
          if (ballotCandidates.length > 0) {
            const selectedCandidate = ballotCandidates[Math.floor(Math.random() * ballotCandidates.length)];
            
            const vote = await prisma.vote.create({
              data: {
                id: generateId(),
                voterId: voter.id,
                candidateId: selectedCandidate.BallotCandidate_CandidateId,
                positionId: ballotPosition.BallotPosition_PositionId,
                ballotId: activeBallot.id,
                ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                sessionId: `session_${generateId()}`,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                verificationCode: `VERIFY_${generateId()}`,
                auditHash: `hash_${generateId()}`,
              },
            });
            activeVotes.push(vote);
          }
        }
      }
      
      console.log(`✅ Created ${activeVotes.length} votes for active ballot`);
    }

    // Create user ballot history
    console.log('📚 Creating user ballot history...');
    const userBallotHistory = [];
    
    for (let i = 0; i < Math.min(voters.length, 100); i++) {
      const voter = voters[i];
      
      if (completedBallot) {
        const history = await prisma.userBallotHistory.create({
          data: {
            id: generateId(),
            UserBallotHistory_UserId: voter.id,
            UserBallotHistory_BallotId: completedBallot.id,
            UserBallotHistory_VotedAt: voter.hasVoted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
            UserBallotHistory_VoteCount: voter.hasVoted ? Math.floor(Math.random() * 5) + 1 : 0,
            UserBallotHistory_IsCompleted: voter.hasVoted,
            UserBallotHistory_LastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        });
        userBallotHistory.push(history);
      }
    }

    console.log(`✅ Created ${userBallotHistory.length} user ballot history records`);

    console.log('✅ Voter and vote data seeding completed successfully!');
    console.log('');
    console.log('📊 Summary of created data:');
    console.log(`   - Voters: ${voters.length}`);
    console.log(`   - Votes: ${await prisma.vote.count()}`);
    console.log(`   - User Ballot History: ${userBallotHistory.length}`);
    console.log('');
    console.log('🎯 System now has realistic voting data with:');
    console.log('   ✅ 150 voters across all departments');
    console.log('   ✅ 70% voter participation rate');
    console.log('   ✅ Comprehensive vote records');
    console.log('   ✅ User ballot history tracking');

  } catch (error) {
    console.error('❌ Error during voter and vote seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
