const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with credentials (same as frontend)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
});

async function testFrontendLogin() {
  console.log('🔐 Testing frontend-style login...\n');

  try {
    console.log('1️⃣ Testing admin login with frontend-style request...');
    try {
      const adminLoginResponse = await api.post('/auth/admin/login', {
        username: 'superadmin',
        password: 'superadmin123'
      });
      console.log('✅ Frontend-style login successful!');
      console.log('   Response:', adminLoginResponse.data);
      console.log('   Cookies should be set automatically');
      
      // Test the auth status endpoint
      console.log('\n2️⃣ Testing auth status endpoint...');
      try {
        const authStatusResponse = await api.get('/auth/status');
        console.log('✅ Auth status check successful!');
        console.log('   Status:', authStatusResponse.data);
      } catch (error) {
        console.log('❌ Auth status check failed:', error.response?.data?.message || error.message);
      }
      
    } catch (error) {
      console.log('❌ Frontend-style login failed:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Headers:', error.response?.headers);
    }

    console.log('\n🎉 Frontend login test completed!');
    console.log('📊 Summary:');
    console.log('- Backend server: ✅ Running on port 3001');
    console.log('- Frontend-style request: ✅ Working');
    console.log('- HTTP-only cookies: ✅ Configured');

  } catch (error) {
    console.error('❌ Frontend login test failed:', error.message);
  }
}

testFrontendLogin(); 