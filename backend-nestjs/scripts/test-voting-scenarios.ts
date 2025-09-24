import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate ID
function generateId(): string {
  const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${firstPart}-${secondPart}`;
}

async function testVotingScenarios() {
  console.log('🧪 Starting comprehensive voting scenario tests...');

  try {
    // Get test data
    const ballot1 = await prisma.ballot.findFirst({
      where: { Ballot_Title: 'Student Council Election 2024 - Round 1' },
      include: {
        ballotPositions: {
          include: {
            position: true,
          },
        },
        ballotCandidates: {
          include: {
            candidate: true,
          },
        },
      },
    });

    const ballot2 = await prisma.ballot.findFirst({
      where: { Ballot_Title: 'Student Council Election 2024 - Round 2' },
      include: {
        ballotPositions: {
          include: {
            position: true,
          },
        },
        ballotCandidates: {
          include: {
            candidate: true,
          },
        },
      },
    });

    const voters = await prisma.voter.findMany({
      where: {
        Voter_Email: {
          in: ['voter1@test.edu', 'voter2@test.edu', 'voter3@test.edu']
        }
      }
    });

    if (!ballot1 || !ballot2 || voters.length !== 3) {
      throw new Error('Test data not found. Please run test-data-seed.ts first.');
    }

    // Get dummy election for vote compatibility
    const dummyElection = await prisma.election.findFirst({
      where: { Election_Title: 'Dummy Election for Ballot System' }
    });

    if (!dummyElection) {
      throw new Error('Dummy election not found. Please run test-data-seed.ts first.');
    }

    console.log('📋 Test Data Retrieved:');
    console.log(`   Ballot 1: ${ballot1.Ballot_Title}`);
    console.log(`   Ballot 2: ${ballot2.Ballot_Title}`);
    console.log(`   Voters: ${voters.length}`);
    console.log(`   Dummy Election ID: ${dummyElection.id}`);

    // Get candidates for each position
    const presidentCandidates = ballot1.ballotCandidates.filter(
      bc => bc.candidate.positionId === ballot1.ballotPositions[0].position.id
    );
    const vicePresidentCandidates = ballot1.ballotCandidates.filter(
      bc => bc.candidate.positionId === ballot1.ballotPositions[1].position.id
    );

    const secretaryCandidates = ballot2.ballotCandidates.filter(
      bc => bc.candidate.positionId === ballot2.ballotPositions[0].position.id
    );
    const treasurerCandidates = ballot2.ballotCandidates.filter(
      bc => bc.candidate.positionId === ballot2.ballotPositions[1].position.id
    );

    console.log('\n🎯 SCENARIO 1: User votes in ONE ballot with 1 vote limit per position');
    console.log('='.repeat(70));

    const voter1 = voters[0];
    console.log(`👤 Voter: ${voter1.Voter_Name} (${voter1.Voter_Email})`);
    console.log(`📊 Voting in: ${ballot1.Ballot_Title}`);

    // Voter 1 votes in Ballot 1 only
    const voter1Votes = [
      {
        id: generateId(),
        voterId: voter1.id,
        candidateId: presidentCandidates[0].candidate.id, // John Smith
        positionId: ballot1.ballotPositions[0].position.id,
        ballotId: ballot1.id,
        electionId: dummyElection.id, // Required field
        createdAt: new Date(),
      },
      {
        id: generateId(),
        voterId: voter1.id,
        candidateId: vicePresidentCandidates[0].candidate.id, // Mike Johnson
        positionId: ballot1.ballotPositions[1].position.id,
        ballotId: ballot1.id,
        electionId: dummyElection.id, // Required field
        createdAt: new Date(),
      },
    ];

    await prisma.vote.createMany({ data: voter1Votes });

    // Create user ballot history
    await prisma.userBallotHistory.create({
      data: {
        id: generateId(),
        UserBallotHistory_UserId: voter1.id,
        UserBallotHistory_BallotId: ballot1.id,
        UserBallotHistory_VotedAt: new Date(),
        UserBallotHistory_VoteCount: voter1Votes.length,
        UserBallotHistory_IsCompleted: true,
      },
    });

    console.log(`✅ Voter 1 voted for:`);
    console.log(`   - President: ${presidentCandidates[0].candidate.Candidate_Name}`);
    console.log(`   - Vice President: ${vicePresidentCandidates[0].candidate.Candidate_Name}`);
    console.log(`   Total votes: ${voter1Votes.length}`);

    console.log('\n🎯 SCENARIO 2: User votes in TWO ballots with 1 vote limit per position');
    console.log('='.repeat(70));

    const voter2 = voters[1];
    console.log(`👤 Voter: ${voter2.Voter_Name} (${voter2.Voter_Email})`);
    console.log(`📊 Voting in: ${ballot1.Ballot_Title} AND ${ballot2.Ballot_Title}`);

    // Voter 2 votes in both ballots (but only 1 vote per position in ballot 2)
    const voter2Votes = [
      // Ballot 1 votes
      {
        id: generateId(),
        voterId: voter2.id,
        candidateId: presidentCandidates[1].candidate.id, // Jane Doe
        positionId: ballot1.ballotPositions[0].position.id,
        ballotId: ballot1.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      {
        id: generateId(),
        voterId: voter2.id,
        candidateId: vicePresidentCandidates[1].candidate.id, // Sarah Wilson
        positionId: ballot1.ballotPositions[1].position.id,
        ballotId: ballot1.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      // Ballot 2 votes (only 1 vote per position despite higher limits)
      {
        id: generateId(),
        voterId: voter2.id,
        candidateId: secretaryCandidates[0].candidate.id, // Alex Brown
        positionId: ballot2.ballotPositions[0].position.id,
        ballotId: ballot2.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      {
        id: generateId(),
        voterId: voter2.id,
        candidateId: treasurerCandidates[0].candidate.id, // David Miller
        positionId: ballot2.ballotPositions[1].position.id,
        ballotId: ballot2.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
    ];

    await prisma.vote.createMany({ data: voter2Votes });

    // Create user ballot history for both ballots
    await Promise.all([
      prisma.userBallotHistory.create({
        data: {
          id: generateId(),
          UserBallotHistory_UserId: voter2.id,
          UserBallotHistory_BallotId: ballot1.id,
          UserBallotHistory_VotedAt: new Date(),
          UserBallotHistory_VoteCount: 2,
          UserBallotHistory_IsCompleted: true,
        },
      }),
      prisma.userBallotHistory.create({
        data: {
          id: generateId(),
          UserBallotHistory_UserId: voter2.id,
          UserBallotHistory_BallotId: ballot2.id,
          UserBallotHistory_VotedAt: new Date(),
          UserBallotHistory_VoteCount: 2,
          UserBallotHistory_IsCompleted: true,
        },
      }),
    ]);

    console.log(`✅ Voter 2 voted for:`);
    console.log(`   Ballot 1:`);
    console.log(`     - President: ${presidentCandidates[1].candidate.Candidate_Name}`);
    console.log(`     - Vice President: ${vicePresidentCandidates[1].candidate.Candidate_Name}`);
    console.log(`   Ballot 2:`);
    console.log(`     - Secretary: ${secretaryCandidates[0].candidate.Candidate_Name}`);
    console.log(`     - Treasurer: ${treasurerCandidates[0].candidate.Candidate_Name}`);
    console.log(`   Total votes: ${voter2Votes.length}`);

    console.log('\n🎯 SCENARIO 3: User votes in TWO ballots with multiple vote limits');
    console.log('='.repeat(70));

    const voter3 = voters[2];
    console.log(`👤 Voter: ${voter3.Voter_Name} (${voter3.Voter_Email})`);
    console.log(`📊 Voting in: ${ballot1.Ballot_Title} AND ${ballot2.Ballot_Title}`);
    console.log(`📊 Using multiple vote limits in Ballot 2`);

    // Voter 3 votes in both ballots, using multiple votes in ballot 2
    const voter3Votes = [
      // Ballot 1 votes (1 vote per position)
      {
        id: generateId(),
        voterId: voter3.id,
        candidateId: presidentCandidates[0].candidate.id, // John Smith
        positionId: ballot1.ballotPositions[0].position.id,
        ballotId: ballot1.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      {
        id: generateId(),
        voterId: voter3.id,
        candidateId: vicePresidentCandidates[0].candidate.id, // Mike Johnson
        positionId: ballot1.ballotPositions[1].position.id,
        ballotId: ballot1.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      // Ballot 2 votes (multiple votes per position)
      // Secretary: 2 votes (vote limit is 2)
      {
        id: generateId(),
        voterId: voter3.id,
        candidateId: secretaryCandidates[0].candidate.id, // Alex Brown
        positionId: ballot2.ballotPositions[0].position.id,
        ballotId: ballot2.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      {
        id: generateId(),
        voterId: voter3.id,
        candidateId: secretaryCandidates[1].candidate.id, // Emma Davis
        positionId: ballot2.ballotPositions[0].position.id,
        ballotId: ballot2.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      // Treasurer: 3 votes (vote limit is 3)
      {
        id: generateId(),
        voterId: voter3.id,
        candidateId: treasurerCandidates[0].candidate.id, // David Miller
        positionId: ballot2.ballotPositions[1].position.id,
        ballotId: ballot2.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      {
        id: generateId(),
        voterId: voter3.id,
        candidateId: treasurerCandidates[1].candidate.id, // Lisa Garcia
        positionId: ballot2.ballotPositions[1].position.id,
        ballotId: ballot2.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
      {
        id: generateId(),
        voterId: voter3.id,
        candidateId: treasurerCandidates[2].candidate.id, // Tom Anderson
        positionId: ballot2.ballotPositions[1].position.id,
        ballotId: ballot2.id,
        electionId: dummyElection.id,
        createdAt: new Date(),
      },
    ];

    await prisma.vote.createMany({ data: voter3Votes });

    // Create user ballot history for both ballots
    await Promise.all([
      prisma.userBallotHistory.create({
        data: {
          id: generateId(),
          UserBallotHistory_UserId: voter3.id,
          UserBallotHistory_BallotId: ballot1.id,
          UserBallotHistory_VotedAt: new Date(),
          UserBallotHistory_VoteCount: 2,
          UserBallotHistory_IsCompleted: true,
        },
      }),
      prisma.userBallotHistory.create({
        data: {
          id: generateId(),
          UserBallotHistory_UserId: voter3.id,
          UserBallotHistory_BallotId: ballot2.id,
          UserBallotHistory_VotedAt: new Date(),
          UserBallotHistory_VoteCount: 5, // 2 for Secretary + 3 for Treasurer
          UserBallotHistory_IsCompleted: true,
        },
      }),
    ]);

    console.log(`✅ Voter 3 voted for:`);
    console.log(`   Ballot 1:`);
    console.log(`     - President: ${presidentCandidates[0].candidate.Candidate_Name}`);
    console.log(`     - Vice President: ${vicePresidentCandidates[0].candidate.Candidate_Name}`);
    console.log(`   Ballot 2:`);
    console.log(`     - Secretary: ${secretaryCandidates[0].candidate.Candidate_Name}, ${secretaryCandidates[1].candidate.Candidate_Name} (2 votes)`);
    console.log(`     - Treasurer: ${treasurerCandidates[0].candidate.Candidate_Name}, ${treasurerCandidates[1].candidate.Candidate_Name}, ${treasurerCandidates[2].candidate.Candidate_Name} (3 votes)`);
    console.log(`   Total votes: ${voter3Votes.length}`);

    console.log('\n📊 VOTING SUMMARY');
    console.log('='.repeat(70));
    
    const totalVotes = await prisma.vote.count();
    const ballot1Votes = await prisma.vote.count({ where: { ballotId: ballot1.id } });
    const ballot2Votes = await prisma.vote.count({ where: { ballotId: ballot2.id } });
    
    console.log(`Total votes cast: ${totalVotes}`);
    console.log(`Ballot 1 votes: ${ballot1Votes}`);
    console.log(`Ballot 2 votes: ${ballot2Votes}`);
    
    const userHistories = await prisma.userBallotHistory.findMany({
      include: {
        user: true,
        ballot: true,
      },
    });
    
    console.log('\n👥 User Ballot Participation:');
    userHistories.forEach(history => {
      console.log(`   ${history.user.Voter_Name}: ${history.ballot.Ballot_Title} (${history.UserBallotHistory_VoteCount} votes)`);
    });

    console.log('\n✅ All voting scenarios completed successfully!');
    console.log('\n🎯 Test Scenarios Summary:');
    console.log('   1. ✅ Single ballot voting (1 vote per position)');
    console.log('   2. ✅ Multiple ballot voting (1 vote per position)');
    console.log('   3. ✅ Multiple ballot voting (multiple votes per position)');
    console.log('\n📋 Next: Run results calculation tests');

  } catch (error) {
    console.error('❌ Error during voting scenario tests:', error);
    throw error;
  }
}

testVotingScenarios()
  .catch((e) => {
    console.error('❌ Error during testing:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
