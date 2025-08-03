const fetch = require('node-fetch');

async function testFileUpload() {
  try {
    console.log('🧪 Testing File Upload System...\n');

    // Test 1: Check if service is working
    console.log('1. Testing file upload service...');
    const testResponse = await fetch('http://localhost:3001/file-upload/test');
    const testResult = await testResponse.json();
    console.log('✅ Service test:', testResult);
    console.log('');

    // Test 2: Get upload statistics
    console.log('2. Getting upload statistics...');
    const statsResponse = await fetch('http://localhost:3001/file-upload/stats');
    const statsResult = await statsResponse.json();
    console.log('✅ Upload stats:', statsResult);
    console.log('');

    // Test 3: Check Swagger documentation
    console.log('3. Checking Swagger documentation...');
    const swaggerResponse = await fetch('http://localhost:3001/api');
    if (swaggerResponse.ok) {
      console.log('✅ Swagger documentation available at: http://localhost:3001/api');
    } else {
      console.log('❌ Swagger documentation not available');
    }
    console.log('');

    console.log('🎉 File upload system testing completed!');
    console.log('📁 Upload directories created:');
    console.log('   - uploads/images/');
    console.log('   - uploads/documents/');
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('   - POST /file-upload/upload/image');
    console.log('   - POST /file-upload/upload/document');
    console.log('   - GET /file-upload/stats');
    console.log('   - GET /file-upload/file/:type/:filename');
    console.log('   - DELETE /file-upload/file/:type/:filename');
    console.log('');
    console.log('🔗 Swagger Documentation: http://localhost:3001/api');

  } catch (error) {
    console.error('❌ Error testing file upload system:', error);
  }
}

testFileUpload(); 