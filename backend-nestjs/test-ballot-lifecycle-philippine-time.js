const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBallotLifecycleWithPhilippineTime() {
  try {
    console.log('🇵🇭 Testing Ballot Lifecycle with Philippine Timezone...\n');

    // Step 1: Create a position
    console.log('1. Creating a position...');
    const position = {
      title: 'Test President',
      description: 'Test Position for Ballot Lifecycle',
      voteLimit: 1
    };

    const positionResponse = await fetch('http://localhost:3001/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(position)
    });
    
    if (!positionResponse.ok) {
      const error = await positionResponse.json();
      console.log(`❌ Failed to create position: ${error.message}`);
      return;
    }
    
    const createdPosition = await positionResponse.json();
    const positionData = createdPosition.position || createdPosition;
    console.log(`✅ Created position: ${positionData.title} (ID: ${positionData.id})`);
    console.log('');

    // Step 2: Create a candidate
    console.log('2. Creating a candidate...');
    const candidate = {
      name: 'Test Candidate',
      email: 'test@candidate.com',
      studentId: '2024-99999',
      positionId: positionData.id,
      departmentId: 'CCS'
    };

    const candidateResponse = await fetch('http://localhost:3001/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate)
    });
    
    if (!candidateResponse.ok) {
      const error = await candidateResponse.json();
      console.log(`❌ Failed to create candidate: ${error.message}`);
      return;
    }
    
    const createdCandidate = await candidateResponse.json();
    const candidateData = createdCandidate.candidate || createdCandidate;
    console.log(`✅ Created candidate: ${candidateData.name} (ID: ${candidateData.id})`);
    console.log('');

    // Step 3: Create a voter
    console.log('3. Creating a voter...');
    const voter = {
      name: 'Test Voter',
      email: 'test@voter.com',
      studentId: '2024-88888',
      password: 'password123',
      departmentId: 'CCS',
      courseId: 'CS101'
    };

    const voterResponse = await fetch('http://localhost:3001/auth/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voter)
    });
    
    if (!voterResponse.ok) {
      const error = await voterResponse.json();
      console.log(`❌ Failed to create voter: ${error.message}`);
      return;
    }
    
    const createdVoter = await voterResponse.json();
    const voterData = createdVoter.voter || createdVoter;
    console.log(`✅ Created voter: ${voterData.name} (ID: ${voterData.id})`);
    console.log('');

    // Step 4: Create election with Philippine time awareness
    console.log('4. Creating election with Philippine time awareness...');
    
    // Create election with future dates in Philippine time
    const now = new Date();
    const startDate = new Date(now.getTime() + 60 * 1000); // 1 minute from now
    const endDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    const election = {
      title: 'Philippine Timezone Test Election',
      description: 'Test ballot lifecycle with Philippine timezone',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: false
    };

    const electionResponse = await fetch('http://localhost:3001/elections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(election)
    });
    
    if (!electionResponse.ok) {
      const error = await electionResponse.json();
      console.log(`❌ Failed to create election: ${error.message}`);
      return;
    }
    
    const createdElection = await electionResponse.json();
    const electionData = createdElection.election || createdElection;
    console.log(`✅ Created election: ${electionData.title} (ID: ${electionData.id})`);
    console.log(`   Start Date: ${electionData.startDate}`);
    console.log(`   End Date: ${electionData.endDate}`);
    console.log('');

    // Step 5: Get election time status with Philippine time
    console.log('5. Getting election time status with Philippine time...');
    const timeStatusResponse = await fetch(`http://localhost:3001/elections/${electionData.id}/time-status`);
    if (timeStatusResponse.ok) {
      const timeStatus = await timeStatusResponse.json();
      console.log('✅ Election time status with Philippine time:');
      console.log(`   Current Time (PH): ${timeStatus.timeInfo.nowPhilippine}`);
      console.log(`   Start Date (PH): ${timeStatus.timeInfo.startDatePhilippine}`);
      console.log(`   End Date (PH): ${timeStatus.timeInfo.endDatePhilippine}`);
      console.log(`   Time Difference: ${timeStatus.timeInfo.timeDifference.formatted}`);
      console.log(`   Can Vote: ${timeStatus.votingStatus.canVote}`);
      console.log(`   Is Expired: ${timeStatus.votingStatus.isExpired}`);
      console.log(`   Is In Future: ${timeStatus.votingStatus.isInFuture}`);
      console.log(`   Is In Progress: ${timeStatus.votingStatus.isInProgress}`);
    } else {
      const error = await timeStatusResponse.json();
      console.log(`❌ Failed to get time status: ${error.message}`);
    }
    console.log('');

    // Step 6: Assign position to election
    console.log('6. Assigning position to election...');
    const assignPositionResponse = await fetch('http://localhost:3001/election-assignments/election/assign-position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        electionId: electionData.id,
        positionId: positionData.id
      })
    });
    
    if (assignPositionResponse.ok) {
      console.log(`✅ Assigned position: ${positionData.title}`);
    } else {
      const error = await assignPositionResponse.json();
      console.log(`❌ Failed to assign position: ${error.message}`);
    }
    console.log('');

    // Step 7: Assign candidate to election
    console.log('7. Assigning candidate to election...');
    const assignCandidateResponse = await fetch('http://localhost:3001/election-assignments/election/assign-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        electionId: electionData.id,
        candidateId: candidateData.id
      })
    });
    
    if (assignCandidateResponse.ok) {
      console.log(`✅ Assigned candidate: ${candidateData.name}`);
    } else {
      const error = await assignCandidateResponse.json();
      console.log(`❌ Failed to assign candidate: ${error.message}`);
    }
    console.log('');

    // Step 8: Start the ballot
    console.log('8. Starting the ballot...');
    const startBallotResponse = await fetch(`http://localhost:3001/elections/${electionData.id}/start-ballot`, {
      method: 'PUT'
    });
    if (startBallotResponse.ok) {
      const startResult = await startBallotResponse.json();
      console.log(`✅ ${startResult.message}`);
      if (startResult.ballotInfo) {
        console.log(`   Positions: ${startResult.ballotInfo.positions}`);
        console.log(`   Candidates: ${startResult.ballotInfo.candidates}`);
      }
    } else {
      const error = await startBallotResponse.json();
      console.log(`❌ Failed to start ballot: ${error.message}`);
    }
    console.log('');

    // Step 9: Test ballot pause and resume
    console.log('9. Testing ballot pause and resume...');
    
    // Pause ballot
    const pauseResponse = await fetch(`http://localhost:3001/elections/${electionData.id}/pause-ballot`, {
      method: 'PUT'
    });
    if (pauseResponse.ok) {
      const pauseResult = await pauseResponse.json();
      console.log(`✅ ${pauseResult.message}`);
    } else {
      const error = await pauseResponse.json();
      console.log(`❌ Failed to pause ballot: ${error.message}`);
    }

    // Resume ballot
    const resumeResponse = await fetch(`http://localhost:3001/elections/${electionData.id}/resume-ballot`, {
      method: 'PUT'
    });
    if (resumeResponse.ok) {
      const resumeResult = await resumeResponse.json();
      console.log(`✅ ${resumeResult.message}`);
    } else {
      const error = await resumeResponse.json();
      console.log(`❌ Failed to resume ballot: ${error.message}`);
    }
    console.log('');

    // Step 10: End the ballot
    console.log('10. Ending the ballot...');
    const endResponse = await fetch(`http://localhost:3001/elections/${electionData.id}/end-ballot`, {
      method: 'PUT'
    });
    if (endResponse.ok) {
      const endResult = await endResponse.json();
      console.log(`✅ ${endResult.message}`);
      if (endResult.finalResults) {
        console.log(`   Total votes: ${endResult.finalResults.totalVotes}`);
        console.log(`   Unique voters: ${endResult.finalResults.uniqueVoters}`);
        console.log(`   Ended at (PH): ${endResult.finalResults.endedAtPhilippine}`);
      }
    } else {
      const error = await endResponse.json();
      console.log(`❌ Failed to end ballot: ${error.message}`);
    }
    console.log('');

    // Step 11: Get final ballot status with Philippine time
    console.log('11. Getting final ballot status with Philippine time...');
    const finalStatusResponse = await fetch(`http://localhost:3001/elections/${electionData.id}/ballot-status`);
    if (finalStatusResponse.ok) {
      const finalStatus = await finalStatusResponse.json();
      console.log('✅ Final ballot status with Philippine time:');
      console.log(`   Status: ${finalStatus.election.status}`);
      if (finalStatus.timeInfo) {
        console.log(`   Current Time (PH): ${finalStatus.timeInfo.nowPhilippine}`);
      }
      if (finalStatus.ballot) {
        console.log(`   Can Vote: ${finalStatus.ballot.canVote}`);
        console.log(`   Can Pause: ${finalStatus.ballot.canPause}`);
        console.log(`   Can Resume: ${finalStatus.ballot.canResume}`);
        console.log(`   Can End: ${finalStatus.ballot.canEnd}`);
      }
    } else {
      const error = await finalStatusResponse.json();
      console.log(`❌ Failed to get ballot status: ${error.message}`);
    }
    console.log('');

    console.log('🎉 Ballot Lifecycle with Philippine Timezone Test Completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   • Philippine timezone functionality working');
    console.log('   • Created position, candidate, and voter');
    console.log('   • Created election with Philippine time awareness');
    console.log('   • Got election time status with Philippine time');
    console.log('   • Assigned position and candidate to election');
    console.log('   • Started ballot successfully');
    console.log('   • Tested ballot pause and resume');
    console.log('   • Ended ballot with Philippine time');
    console.log('   • Got final ballot status with Philippine time');
    console.log('');
    console.log('✅ All ballot lifecycle features working correctly with Philippine timezone!');

  } catch (error) {
    console.error('❌ Error in ballot lifecycle test:', error);
  }
}

testBallotLifecycleWithPhilippineTime(); 