import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBallotResults() {
  try {
    console.log('🔍 Verifying ballot results...');
    
    const ballots = await prisma.ballot.findMany({
      where: { Ballot_IsDeleted: false },
      include: {
        results: true,
        _count: {
          select: {
            votes: true,
            userHistory: true,
          },
        },
      },
    });

    console.log(`📊 Found ${ballots.length} ballots`);
    
    ballots.forEach(ballot => {
      console.log(`\n🏛️ Ballot: ${ballot.Ballot_Title}`);
      console.log(`   Status: ${ballot.Ballot_Status}`);
      console.log(`   Allow Abstain: ${ballot.Ballot_AllowAbstain}`);
      console.log(`   Total Votes: ${ballot._count.votes}`);
      console.log(`   Total Voters: ${ballot._count.userHistory}`);
      
      if (ballot.results) {
        console.log(`   ✅ Results Calculated:`);
        console.log(`      - Total Votes: ${ballot.results.BallotResults_TotalVotes}`);
        console.log(`      - Total Voters: ${ballot.results.BallotResults_TotalVoters}`);
        console.log(`      - Voter Turnout: ${ballot.results.BallotResults_VoterTurnout.toFixed(2)}%`);
        console.log(`      - Is Final: ${ballot.results.BallotResults_IsFinal}`);
        console.log(`      - Last Updated: ${ballot.results.BallotResults_LastUpdated}`);
        
        // Check if results match actual vote counts
        const voteMatch = ballot.results.BallotResults_TotalVotes === ballot._count.votes;
        console.log(`      - Vote Count Match: ${voteMatch ? '✅' : '❌'}`);
        
        if (!voteMatch) {
          console.log(`      ⚠️  Mismatch: Results show ${ballot.results.BallotResults_TotalVotes} votes, but actual count is ${ballot._count.votes}`);
        }
      } else {
        console.log(`   ❌ No results calculated`);
      }
    });

    // Check result details
    const resultDetails = await prisma.ballotResultDetails.findMany({
      include: {
        candidate: true,
        position: true,
      },
    });

    console.log(`\n📊 Found ${resultDetails.length} result details`);
    
    // Group by ballot
    const detailsByBallot: { [key: string]: any[] } = resultDetails.reduce((acc: any, detail: any) => {
      const ballotId = detail.BallotResultDetails_BallotId;
      if (!acc[ballotId]) {
        acc[ballotId] = [];
      }
      acc[ballotId].push(detail);
      return acc;
    }, {});

    Object.entries(detailsByBallot).forEach(([ballotId, details]) => {
      const ballot = ballots.find(b => b.id === ballotId);
      console.log(`\n📋 Result Details for: ${ballot?.Ballot_Title}`);
      console.log(`   Total Details: ${details.length}`);
      
      // Group by position
      const detailsByPosition: { [key: string]: any[] } = details.reduce((acc: any, detail: any) => {
        const positionId = detail.BallotResultDetails_PositionId;
        if (!acc[positionId]) {
          acc[positionId] = [];
        }
        acc[positionId].push(detail);
        return acc;
      }, {});

      Object.entries(detailsByPosition).forEach(([positionId, positionDetails]) => {
        const position = positionDetails[0]?.position;
        console.log(`   📍 ${position?.Position_Title}:`);
        
        positionDetails
          .sort((a: any, b: any) => a.BallotResultDetails_Rank - b.BallotResultDetails_Rank)
          .forEach((detail: any) => {
            console.log(`      ${detail.BallotResultDetails_Rank}. ${detail.candidate?.Candidate_Name}: ${detail.BallotResultDetails_VoteCount} votes (${detail.BallotResultDetails_Percentage.toFixed(2)}%)`);
          });
      });
    });

  } catch (error) {
    console.error('❌ Error verifying ballot results:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyBallotResults();
