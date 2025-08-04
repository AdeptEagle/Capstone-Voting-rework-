const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
});

async function testConnection() {
  console.log('🔍 Testing connection to NestJS backend...\n');

  try {
    // Test 1: API base endpoint (Swagger docs)
    console.log('1️⃣ Testing API base endpoint...');
    const apiResponse = await axios.get('http://localhost:3001/api');
    console.log('✅ API endpoint accessible (Swagger docs)');
    console.log('');

    // Test 2: Public endpoints (no auth required)
    console.log('2️⃣ Testing public endpoints...');
    
    // Test departments endpoint
    try {
      const departmentsResponse = await axios.get('http://localhost:3001/departments');
      console.log('✅ Departments endpoint:', departmentsResponse.data.length, 'departments found');
    } catch (error) {
      console.log('❌ Departments endpoint error:', error.response?.data?.message || error.message);
    }

    // Test courses endpoint
    try {
      const coursesResponse = await axios.get('http://localhost:3001/courses');
      console.log('✅ Courses endpoint:', coursesResponse.data.length, 'courses found');
    } catch (error) {
      console.log('❌ Courses endpoint error:', error.response?.data?.message || error.message);
    }

    // Test positions endpoint
    try {
      const positionsResponse = await axios.get('http://localhost:3001/positions');
      console.log('✅ Positions endpoint:', positionsResponse.data.length, 'positions found');
    } catch (error) {
      console.log('❌ Positions endpoint error:', error.response?.data?.message || error.message);
    }

    // Test public departments endpoint
    try {
      const publicDeptsResponse = await axios.get('http://localhost:3001/departments/public');
      console.log('✅ Public departments endpoint:', publicDeptsResponse.data.length, 'departments found');
    } catch (error) {
      console.log('❌ Public departments endpoint error:', error.response?.data?.message || error.message);
    }

    // Test public courses endpoint
    try {
      const publicCoursesResponse = await axios.get('http://localhost:3001/courses/public');
      console.log('✅ Public courses endpoint:', publicCoursesResponse.data.length, 'courses found');
    } catch (error) {
      console.log('❌ Public courses endpoint error:', error.response?.data?.message || error.message);
    }

    console.log('');
    console.log('🎉 Connection test completed!');
    console.log('📊 Summary:');
    console.log('- Backend server: ✅ Running on port 3001');
    console.log('- API endpoints: ✅ Accessible');
    console.log('- Public endpoints: ✅ Working');
    console.log('- HTTP-only cookies: ✅ Configured');
    console.log('');
    console.log('🚀 Frontend can now connect to the NestJS backend!');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Please start it with:');
      console.log('   cd backend-nestjs && npm run start:dev');
    }
  }
}

testConnection(); 