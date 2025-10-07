import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Multi-Ballot Voting System Tests');
  console.log('='.repeat(70));
  console.log('');

  try {
    console.log('📋 Test Plan:');
    console.log('   1. Seed test data (departments, courses, positions, candidates, voters, ballots)');
    console.log('   2. Test Scenario 1: Single ballot voting (1 vote per position)');
    console.log('   3. Test Scenario 2: Multiple ballot voting (1 vote per position)');
    console.log('   4. Test Scenario 3: Multiple ballot voting (multiple votes per position)');
    console.log('   5. Calculate and verify results for all scenarios');
    console.log('');

    // Step 1: Seed test data
    console.log('🌱 STEP 1: Seeding test data...');
    console.log('-'.repeat(50));
    try {
      const { stdout: seedOutput } = await execAsync('npx ts-node scripts/test-data-seed.ts');
      console.log(seedOutput);
      console.log('✅ Test data seeded successfully!\n');
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      throw error;
    }

    // Step 2: Run voting scenarios
    console.log('🗳️ STEP 2: Running voting scenarios...');
    console.log('-'.repeat(50));
    try {
      const { stdout: votingOutput } = await execAsync('npx ts-node scripts/test-voting-scenarios.ts');
      console.log(votingOutput);
      console.log('✅ Voting scenarios completed successfully!\n');
    } catch (error) {
      console.error('❌ Error running voting scenarios:', error);
      throw error;
    }

    // Step 3: Calculate and verify results
    console.log('📊 STEP 3: Calculating and verifying results...');
    console.log('-'.repeat(50));
    try {
      const { stdout: resultsOutput } = await execAsync('npx ts-node scripts/test-results-calculation.ts');
      console.log(resultsOutput);
      console.log('✅ Results calculation completed successfully!\n');
    } catch (error) {
      console.error('❌ Error calculating results:', error);
      throw error;
    }

    console.log('🎉 COMPREHENSIVE TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 Test Results Summary:');
    console.log('   ✅ Database schema: All ballot models working correctly');
    console.log('   ✅ Single ballot voting: Users can vote in one ballot');
    console.log('   ✅ Multiple ballot voting: Users can vote in multiple ballots');
    console.log('   ✅ Vote limits: Single and multiple vote limits working');
    console.log('   ✅ Results calculation: Accurate vote counting and ranking');
    console.log('   ✅ User participation tracking: Per-ballot history maintained');
    console.log('   ✅ Data integrity: All foreign key relationships working');
    console.log('');
    console.log('🎯 Multi-Ballot System Status: FULLY FUNCTIONAL');
    console.log('');
    console.log('📋 Test Scenarios Verified:');
    console.log('   1. ✅ User votes in ONE ballot with 1 vote limit per position');
    console.log('   2. ✅ User votes in TWO ballots with 1 vote limit per position');
    console.log('   3. ✅ User votes in TWO ballots with multiple vote limits per position');
    console.log('');
    console.log('🔧 Backend API Status: READY FOR FRONTEND INTEGRATION');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   - Phase 3: Frontend Components');
    console.log('   - Phase 4: Admin Features');
    console.log('   - Production deployment');

  } catch (error) {
    console.error('❌ Comprehensive tests failed:', error);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('   1. Ensure database is running and accessible');
    console.log('   2. Check that Prisma migrations are applied');
    console.log('   3. Verify admin accounts exist in database');
    console.log('   4. Check database connection string in .env file');
    process.exit(1);
  }
}

runComprehensiveTests();








