const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSimplePhilippineTime() {
  try {
    console.log('🇵🇭 Simple Philippine Timezone Test...\n');

    // Step 1: Test Philippine timezone functionality
    console.log('1. Testing Philippine timezone functionality...');
    try {
      const philippineTimeResponse = await fetch('http://localhost:3001/timezone/philippine-time');
      if (philippineTimeResponse.ok) {
        const philippineTime = await philippineTimeResponse.json();
        console.log('✅ Philippine timezone working:');
        console.log(`   Current Time: ${philippineTime.currentTime}`);
        console.log(`   Timezone: ${philippineTime.timezone.timezone}`);
        console.log(`   Offset: ${philippineTime.timezone.offset}`);
      } else {
        console.log('❌ Philippine timezone not working');
        const error = await philippineTimeResponse.text();
        console.log(`   Error: ${error}`);
        return;
      }
    } catch (error) {
      console.log('❌ Error testing Philippine timezone:', error.message);
      return;
    }
    console.log('');

    // Step 2: Test timezone info endpoint
    console.log('2. Testing timezone info endpoint...');
    try {
      const timezoneInfoResponse = await fetch('http://localhost:3001/timezone/philippine-timezone-info');
      if (timezoneInfoResponse.ok) {
        const timezoneInfo = await timezoneInfoResponse.json();
        console.log('✅ Timezone info working:');
        console.log(`   Timezone: ${timezoneInfo.timezone}`);
        console.log(`   Current Time: ${timezoneInfo.currentTimeDisplay}`);
        console.log(`   Offset: ${timezoneInfo.offset}`);
      } else {
        console.log('❌ Timezone info not working');
      }
    } catch (error) {
      console.log('❌ Error testing timezone info:', error.message);
    }
    console.log('');

    // Step 3: Test date conversion
    console.log('3. Testing date conversion...');
    try {
      const testDate = new Date().toISOString();
      const convertResponse = await fetch(`http://localhost:3001/timezone/convert/${encodeURIComponent(testDate)}`);
      if (convertResponse.ok) {
        const convertResult = await convertResponse.json();
        console.log('✅ Date conversion working:');
        console.log(`   Original: ${convertResult.originalDate}`);
        console.log(`   Philippine: ${convertResult.philippineTime}`);
      } else {
        console.log('❌ Date conversion not working');
      }
    } catch (error) {
      console.log('❌ Error testing date conversion:', error.message);
    }
    console.log('');

    // Step 4: Test health endpoint
    console.log('4. Testing health endpoint...');
    try {
      const healthResponse = await fetch('http://localhost:3001/health');
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        console.log('✅ Health endpoint working:');
        console.log(`   Status: ${health.status}`);
      } else {
        console.log('❌ Health endpoint not working');
      }
    } catch (error) {
      console.log('❌ Error testing health:', error.message);
    }
    console.log('');

    console.log('🎉 Simple Philippine Timezone Test Completed!');

  } catch (error) {
    console.error('❌ Error in simple test:', error);
  }
}

testSimplePhilippineTime(); 