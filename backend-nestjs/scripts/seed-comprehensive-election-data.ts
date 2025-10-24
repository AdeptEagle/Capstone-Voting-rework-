import { PrismaClient } from '@prisma/client';

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

// Helper function to generate position ID
function generatePositionId(positionTitle: string): string {
  const positionIdMap: { [key: string]: string } = {
    'Student Council President': 'PRES',
    'Student Council Vice President': 'V-PRES',
    'Student Council Secretary': 'SEC',
    'Student Council Treasurer': 'TREAS',
    'Student Council Auditor': 'AUD',
    'Student Council Public Relations Officer': 'PRO',
    'Senator': 'SEN',
    'Year Level Representative': 'YLR',
    'Department Representative': 'DEP-REP'
  };

  if (positionIdMap[positionTitle]) {
    return positionIdMap[positionTitle];
  }

  const words = positionTitle.split(' ');
  const id = words.map(word => word.substring(0, 3)).join('').toUpperCase();
  return id.substring(0, 8);
}

async function main() {
  console.log('🌱 Starting comprehensive election data seeding...');
  console.log('📋 Excluding: courses, departments, voters, admins');
  console.log('✅ Including: positions, party lists, candidates, ballots, votes, audit logs');

  try {
    // Get existing data that we need to reference
    const existingDepartments = await prisma.department.findMany({
      where: { isDeleted: false }
    });
    const existingCourses = await prisma.course.findMany({
      where: { isDeleted: false }
    });
    const existingAdmins = await prisma.admin.findMany({
      where: { role: 'SUPERADMIN' }
    });

    if (existingDepartments.length === 0) {
      console.log('❌ No departments found. Please run the main seed script first.');
      return;
    }

    if (existingCourses.length === 0) {
      console.log('❌ No courses found. Please run the main seed script first.');
      return;
    }

    if (existingAdmins.length === 0) {
      console.log('❌ No superadmin found. Please run the main seed script first.');
      return;
    }

    const superAdmin = existingAdmins[0];
    console.log(`📊 Found ${existingDepartments.length} departments, ${existingCourses.length} courses`);

    // 1. Create comprehensive positions
    console.log('🎯 Creating comprehensive positions...');
    const positions = await Promise.all([
      prisma.position.upsert({
        where: { id: generatePositionId('Student Council President') },
        update: {},
        create: {
          id: generatePositionId('Student Council President'),
          Position_Title: 'Student Council President',
          Position_Description: 'Leader of the student body, represents all students and leads the council',
          voteLimit: 1,
          displayOrder: 1,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Student Council Vice President') },
        update: {},
        create: {
          id: generatePositionId('Student Council Vice President'),
          Position_Title: 'Student Council Vice President',
          Position_Description: 'Assists the president and takes over leadership when needed',
          voteLimit: 1,
          displayOrder: 2,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Student Council Secretary') },
        update: {},
        create: {
          id: generatePositionId('Student Council Secretary'),
          Position_Title: 'Student Council Secretary',
          Position_Description: 'Handles documentation, meeting minutes, and official communications',
          voteLimit: 1,
          displayOrder: 3,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Student Council Treasurer') },
        update: {},
        create: {
          id: generatePositionId('Student Council Treasurer'),
          Position_Title: 'Student Council Treasurer',
          Position_Description: 'Manages student council finances and budget allocation',
          voteLimit: 1,
          displayOrder: 4,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Student Council Auditor') },
        update: {},
        create: {
          id: generatePositionId('Student Council Auditor'),
          Position_Title: 'Student Council Auditor',
          Position_Description: 'Oversees financial transparency and accountability',
          voteLimit: 1,
          displayOrder: 5,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Student Council Public Relations Officer') },
        update: {},
        create: {
          id: generatePositionId('Student Council Public Relations Officer'),
          Position_Title: 'Student Council Public Relations Officer',
          Position_Description: 'Manages external communications, events, and student outreach',
          voteLimit: 1,
          displayOrder: 6,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Senator') },
        update: {},
        create: {
          id: generatePositionId('Senator'),
          Position_Title: 'Senator',
          Position_Description: 'Represents student interests in legislative matters',
          voteLimit: 5,
          displayOrder: 7,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Year Level Representative') },
        update: {},
        create: {
          id: generatePositionId('Year Level Representative'),
          Position_Title: 'Year Level Representative',
          Position_Description: 'Represents specific year level concerns and interests',
          voteLimit: 4,
          displayOrder: 8,
        },
      }),
      prisma.position.upsert({
        where: { id: generatePositionId('Department Representative') },
        update: {},
        create: {
          id: generatePositionId('Department Representative'),
          Position_Title: 'Department Representative',
          Position_Description: 'Represents department-specific concerns and academic interests',
          voteLimit: 3,
          displayOrder: 9,
        },
      }),
    ]);

    console.log(`✅ Created ${positions.length} positions`);

    // 2. Create multiple party lists
    console.log('🎭 Creating party lists...');
    const partyLists = await Promise.all([
      prisma.partyList.upsert({
        where: { id: 'PROG-PARTY' },
        update: {},
        create: {
          id: 'PROG-PARTY',
          name: 'Progressive Students Alliance',
          description: 'A party focused on progressive change, innovation, and student welfare improvements',
          color: '#FF6B6B',
          logo: null,
        },
      }),
      prisma.partyList.upsert({
        where: { id: 'UNITY-PARTY' },
        update: {},
        create: {
          id: 'UNITY-PARTY',
          name: 'Unity Coalition',
          description: 'A party promoting unity, collaboration, and bringing students together',
          color: '#4ECDC4',
          logo: null,
        },
      }),
      prisma.partyList.upsert({
        where: { id: 'TECH-PARTY' },
        update: {},
        create: {
          id: 'TECH-PARTY',
          name: 'Tech Forward Movement',
          description: 'Advocating for technological advancement, digital literacy, and innovation',
          color: '#007BFF',
          logo: null,
        },
      }),
      prisma.partyList.upsert({
        where: { id: 'ACAD-PARTY' },
        update: {},
        create: {
          id: 'ACAD-PARTY',
          name: 'Academic Excellence Party',
          description: 'Focused on academic improvement, research opportunities, and educational reforms',
          color: '#28A745',
          logo: null,
        },
      }),
      prisma.partyList.upsert({
        where: { id: 'CULT-PARTY' },
        update: {},
        create: {
          id: 'CULT-PARTY',
          name: 'Cultural Diversity Party',
          description: 'Promoting cultural awareness, diversity, and inclusive campus environment',
          color: '#FFC107',
          logo: null,
        },
      }),
    ]);

    console.log(`✅ Created ${partyLists.length} party lists`);

    // 3. Create comprehensive candidates
    console.log('👥 Creating comprehensive candidates...');
    const candidates = [];

    // Create multiple candidates per position from different parties
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const candidatesPerPosition = position.voteLimit > 1 ? 6 : 4; // More candidates for multi-vote positions
      
      for (let j = 0; j < candidatesPerPosition; j++) {
        const partyList = partyLists[j % partyLists.length];
        const randomDept = existingDepartments[Math.floor(Math.random() * existingDepartments.length)];
        const deptCourses = existingCourses.filter(c => c.departmentId === randomDept.id);
        const randomCourse = deptCourses.length > 0 ? deptCourses[Math.floor(Math.random() * deptCourses.length)] : existingCourses[0];

        const candidateNames = [
          'Alexandra Marie Santos', 'Carlos Miguel Reyes', 'Isabella Grace Cruz',
          'Diego Antonio Mendoza', 'Sofia Isabel Torres', 'Gabriel Enrique Lim',
          'Maria Clara Rodriguez', 'Luis Miguel Santos', 'Ana Sofia Martinez',
          'Jose Antonio Cruz', 'Carmen Elena Reyes', 'Roberto Carlos Torres',
          'Patricia Ann Santos', 'Fernando Jose Cruz', 'Monica Isabel Reyes',
          'Ricardo Antonio Santos', 'Elena Maria Cruz', 'Miguel Angel Reyes',
          'Valentina Sofia Santos', 'Sebastian Jose Cruz', 'Camila Elena Reyes',
          'Nicolas Antonio Santos', 'Isabella Maria Cruz', 'Santiago Jose Reyes'
        ];

        const candidate = await prisma.candidate.create({
          data: {
            id: generateId(),
            Candidate_Name: candidateNames[j % candidateNames.length],
            Candidate_Email: `${partyList.name.toLowerCase().replace(/\s+/g, '.')}.candidate${j + 1}@student.edu`,
            Candidate_StudentId: generateUniqueStudentId(),
            manifesto: `As a ${partyList.name} candidate for ${position.Position_Title}, I am committed to ${partyList.description.toLowerCase()}. I will work tirelessly to represent student interests and bring positive change to our campus community.`,
            positionId: position.id,
            departmentId: randomDept.id,
            courseId: randomCourse.id,
            partyListId: partyList.id,
            party_list_name: partyList.name,
          },
        });

        candidates.push(candidate);
      }
      console.log(`✅ Created ${candidatesPerPosition} candidates for ${position.Position_Title}`);
    }

    console.log(`✅ Created ${candidates.length} total candidates`);

    // 4. Create multiple ballots (active, completed, and scheduled)
    console.log('🏛️ Creating comprehensive ballots...');
    
    // Active ballot
    const activeBallot = await prisma.ballot.upsert({
      where: { id: 'BALLOT-ACTIVE-2024' },
      update: {},
      create: {
        id: 'BALLOT-ACTIVE-2024',
        Ballot_Title: 'Student Council Elections 2024 - Active',
        Ballot_Description: 'Current active election for Student Council positions',
        Ballot_StartDate: new Date(),
        Ballot_EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        Ballot_Status: 'ACTIVE',
        Ballot_IsActive: true,
        Ballot_MaxVotesPerUser: 1,
        Ballot_AllowMultipleVotes: false,
        Ballot_RequireAllPositions: true,
        Ballot_ShowResults: true,
        Ballot_ShowLiveResults: true,
        Ballot_AllowAbstain: false,
        Ballot_CreatedBy: superAdmin.id,
      },
    });

    // Completed ballot
    const completedBallot = await prisma.ballot.upsert({
      where: { id: 'BALLOT-COMPLETED-2023' },
      update: {},
      create: {
        id: 'BALLOT-COMPLETED-2023',
        Ballot_Title: 'Student Council Elections 2023 - Completed',
        Ballot_Description: 'Completed election from previous academic year',
        Ballot_StartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        Ballot_EndDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        Ballot_Status: 'ENDED',
        Ballot_IsActive: false,
        Ballot_MaxVotesPerUser: 1,
        Ballot_AllowMultipleVotes: false,
        Ballot_RequireAllPositions: true,
        Ballot_ShowResults: true,
        Ballot_ShowLiveResults: false,
        Ballot_AllowAbstain: false,
        Ballot_CreatedBy: superAdmin.id,
      },
    });

    // Scheduled ballot
    const scheduledBallot = await prisma.ballot.upsert({
      where: { id: 'BALLOT-SCHEDULED-2025' },
      update: {},
      create: {
        id: 'BALLOT-SCHEDULED-2025',
        Ballot_Title: 'Student Council Elections 2025 - Scheduled',
        Ballot_Description: 'Upcoming election scheduled for next semester',
        Ballot_StartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        Ballot_EndDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
        Ballot_Status: 'SCHEDULED',
        Ballot_IsActive: false,
        Ballot_MaxVotesPerUser: 1,
        Ballot_AllowMultipleVotes: false,
        Ballot_RequireAllPositions: true,
        Ballot_ShowResults: true,
        Ballot_ShowLiveResults: true,
        Ballot_AllowAbstain: false,
        Ballot_CreatedBy: superAdmin.id,
      },
    });

    const ballots = [activeBallot, completedBallot, scheduledBallot];
    console.log(`✅ Created ${ballots.length} ballots`);

    // 5. Link positions to ballots
    console.log('🔗 Linking positions to ballots...');
    const ballotPositions = [];
    
    for (const ballot of ballots) {
      for (const position of positions) {
        const ballotPosition = await prisma.ballotPosition.create({
          data: {
            id: generateId(),
            BallotPosition_BallotId: ballot.id,
            BallotPosition_PositionId: position.id,
            BallotPosition_DisplayOrder: position.displayOrder,
            BallotPosition_IsRequired: true,
          },
        });
        ballotPositions.push(ballotPosition);
      }
    }

    console.log(`✅ Created ${ballotPositions.length} ballot position links`);

    // 6. Link candidates to ballots
    console.log('🔗 Linking candidates to ballots...');
    const ballotCandidates = [];
    
    for (const ballot of ballots) {
      for (const candidate of candidates) {
        const ballotPosition = ballotPositions.find(
          bp => bp.BallotPosition_BallotId === ballot.id && 
                bp.BallotPosition_PositionId === candidate.positionId
        );
        
        if (ballotPosition) {
          const ballotCandidate = await prisma.ballotCandidate.create({
            data: {
              id: generateId(),
              BallotCandidate_BallotId: ballot.id,
              BallotCandidate_CandidateId: candidate.id,
              BallotCandidate_PositionId: candidate.positionId,
              BallotCandidate_IsActive: true,
            },
          });
          ballotCandidates.push(ballotCandidate);
        }
      }
    }

    console.log(`✅ Created ${ballotCandidates.length} ballot candidate links`);

    // 7. Create comprehensive vote data (simulating voters who have voted)
    console.log('🗳️ Creating comprehensive vote data...');
    
    // Get existing voters to create votes
    const existingVoters = await prisma.voter.findMany({
      where: { isDeleted: false },
      take: 150 // Limit to avoid too many votes
    });

    if (existingVoters.length > 0) {
      const votes = [];
      
      // Create votes for the completed ballot (simulating past voting)
      const completedBallotCandidates = ballotCandidates.filter(
        bc => bc.BallotCandidate_BallotId === completedBallot.id
      );
      
      for (let i = 0; i < Math.min(existingVoters.length, 100); i++) {
        const voter = existingVoters[i];
        
        // Create votes for each position in the completed ballot
        for (const position of positions) {
          const positionCandidates = completedBallotCandidates.filter(
            bc => bc.BallotCandidate_PositionId === position.id
          );
          
          if (positionCandidates.length > 0) {
            // For single-vote positions, vote for one candidate
            // For multi-vote positions, vote for multiple candidates
            const votesToCast = position.voteLimit === 1 ? 1 : 
              Math.floor(Math.random() * Math.min(position.voteLimit, positionCandidates.length)) + 1;
            
            const selectedCandidates = positionCandidates
              .sort(() => Math.random() - 0.5)
              .slice(0, votesToCast);
            
            for (const selectedCandidate of selectedCandidates) {
              const vote = await prisma.vote.create({
                data: {
                  id: generateId(),
                  voterId: voter.id,
                  candidateId: selectedCandidate.BallotCandidate_CandidateId,
                  positionId: position.id,
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

      console.log(`✅ Created ${votes.length} votes for completed ballot`);

      // Create some votes for the active ballot (simulating ongoing voting)
      const activeBallotCandidates = ballotCandidates.filter(
        bc => bc.BallotCandidate_BallotId === activeBallot.id
      );
      
      const activeVotes = [];
      for (let i = 0; i < Math.min(existingVoters.length, 50); i++) {
        const voter = existingVoters[i];
        
        // Create votes for some positions in the active ballot
        const positionsToVote = positions.slice(0, Math.floor(Math.random() * 3) + 1);
        
        for (const position of positionsToVote) {
          const positionCandidates = activeBallotCandidates.filter(
            bc => bc.BallotCandidate_PositionId === position.id
          );
          
          if (positionCandidates.length > 0) {
            const selectedCandidate = positionCandidates[Math.floor(Math.random() * positionCandidates.length)];
            
            const vote = await prisma.vote.create({
              data: {
                id: generateId(),
                voterId: voter.id,
                candidateId: selectedCandidate.BallotCandidate_CandidateId,
                positionId: position.id,
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
    } else {
      console.log('⚠️ No existing voters found, skipping vote creation');
    }

    // 8. Create ballot results for completed ballot
    console.log('📊 Creating ballot results...');
    
    const ballotResults = await prisma.ballotResults.create({
      data: {
        id: generateId(),
        BallotResults_BallotId: completedBallot.id,
        BallotResults_TotalVotes: 0, // Will be calculated
        BallotResults_TotalVoters: 0, // Will be calculated
        BallotResults_VoterTurnout: 0, // Will be calculated
        BallotResults_IsFinal: true,
      },
    });

    // Create result details for each candidate in completed ballot
    const completedBallotCandidates = ballotCandidates.filter(
      bc => bc.BallotCandidate_BallotId === completedBallot.id
    );

    const resultDetails = [];
    for (const ballotCandidate of completedBallotCandidates) {
      const voteCount = Math.floor(Math.random() * 50) + 10; // Random vote count between 10-60
      
      const resultDetail = await prisma.ballotResultDetails.create({
        data: {
          id: generateId(),
          BallotResultDetails_BallotId: completedBallot.id,
          BallotResultDetails_PositionId: ballotCandidate.BallotCandidate_PositionId,
          BallotResultDetails_CandidateId: ballotCandidate.BallotCandidate_CandidateId,
          BallotResultDetails_VoteCount: voteCount,
          BallotResultDetails_Percentage: 0, // Will be calculated
          BallotResultDetails_Rank: 0, // Will be calculated
        },
      });
      resultDetails.push(resultDetail);
    }

    console.log(`✅ Created ballot results and ${resultDetails.length} result details`);

    // 9. Create comprehensive audit logs
    console.log('📝 Creating comprehensive audit logs...');
    
    const auditActions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VOTE', 'BALLOT_CREATE', 'CANDIDATE_REGISTER'];
    const auditEntities = ['VOTER', 'CANDIDATE', 'BALLOT', 'VOTE', 'ADMIN', 'POSITION', 'PARTY_LIST'];
    const severities = ['INFO', 'WARNING', 'ERROR', 'SUCCESS'];

    const auditLogs = [];
    for (let i = 0; i < 200; i++) {
      const auditLog = await prisma.auditLog.create({
        data: {
          id: generateId(),
          eventType: auditEntities[Math.floor(Math.random() * auditEntities.length)],
          action: auditActions[Math.floor(Math.random() * auditActions.length)],
          userId: existingVoters.length > 0 ? existingVoters[Math.floor(Math.random() * existingVoters.length)].id : null,
          timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random time within last 60 days
          details: `Audit log entry ${i + 1}: ${auditActions[Math.floor(Math.random() * auditActions.length)]} action performed on ${auditEntities[Math.floor(Math.random() * auditEntities.length)]}`,
          metadata: {
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: `session_${generateId()}`,
          },
          severity: severities[Math.floor(Math.random() * severities.length)],
        },
      });
      auditLogs.push(auditLog);
    }

    console.log(`✅ Created ${auditLogs.length} audit logs`);

    // 10. Create user ballot history
    console.log('📚 Creating user ballot history...');
    
    const userBallotHistory = [];
    for (let i = 0; i < Math.min(existingVoters.length, 80); i++) {
      const voter = existingVoters[i];
      
      // Create history for completed ballot
      const history = await prisma.userBallotHistory.create({
        data: {
          id: generateId(),
          UserBallotHistory_UserId: voter.id,
          UserBallotHistory_BallotId: completedBallot.id,
          UserBallotHistory_VotedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          UserBallotHistory_VoteCount: Math.floor(Math.random() * 5) + 1,
          UserBallotHistory_IsCompleted: true,
          UserBallotHistory_LastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
      userBallotHistory.push(history);
    }

    console.log(`✅ Created ${userBallotHistory.length} user ballot history records`);

    console.log('✅ Comprehensive election data seeding completed successfully!');
    console.log('');
    console.log('📊 Summary of created data:');
    console.log(`   - Positions: ${positions.length}`);
    console.log(`   - Party Lists: ${partyLists.length}`);
    console.log(`   - Candidates: ${candidates.length}`);
    console.log(`   - Ballots: ${ballots.length}`);
    console.log(`   - Ballot Positions: ${ballotPositions.length}`);
    console.log(`   - Ballot Candidates: ${ballotCandidates.length}`);
    console.log(`   - Votes: ${await prisma.vote.count()}`);
    console.log(`   - Ballot Results: 1`);
    console.log(`   - Result Details: ${resultDetails.length}`);
    console.log(`   - Audit Logs: ${auditLogs.length}`);
    console.log(`   - User Ballot History: ${userBallotHistory.length}`);
    console.log('');
    console.log('🎭 Party Lists:');
    partyLists.forEach(party => {
      console.log(`   - ${party.name} (${party.color})`);
    });
    console.log('');
    console.log('🏛️ Ballots:');
    ballots.forEach(ballot => {
      console.log(`   - ${ballot.Ballot_Title} (${ballot.Ballot_Status})`);
    });
    console.log('');
    console.log('🎯 System now simulates a fully active election with:');
    console.log('   ✅ Multiple party lists with diverse candidates');
    console.log('   ✅ Active, completed, and scheduled ballots');
    console.log('   ✅ Comprehensive voting data');
    console.log('   ✅ Detailed audit trails');
    console.log('   ✅ Realistic election results');

  } catch (error) {
    console.error('❌ Error during comprehensive seeding:', error);
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
