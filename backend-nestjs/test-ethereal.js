const fetch = require('node-fetch');

async function testEtherealEmail() {
  try {
    console.log('🧪 Testing Ethereal Email Service...\n');

    // Test email connection
    console.log('1. Testing email connection...');
    const testResponse = await fetch('http://localhost:3001/auth/test-email', {
      method: 'POST',
    });
    const testResult = await testResponse.json();
    console.log('✅ Email connection test:', testResult);
    console.log('');

    // Test password reset
    console.log('2. Testing password reset email...');
    const resetResponse = await fetch('http://localhost:3001/auth/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        userType: 'voter'
      }),
    });
    const resetResult = await resetResponse.json();
    console.log('✅ Password reset test:', resetResult);
    console.log('');

    console.log('🎉 Ethereal email testing completed!');
    console.log('📧 Check the server console for Ethereal email URLs');
    console.log('🔗 You can view the emails at the URLs shown in the server logs');

  } catch (error) {
    console.error('❌ Error testing Ethereal email:', error);
  }
}

testEtherealEmail(); 