import express from 'express';
import { AuthController } from '../controllers/sequelize/AuthController.js';
import { Admin, Voter, Department, Course } from '../models/sequelize/index.js';
import { sequelize } from '../config/sequelize.js';

// Create a simple Express app for testing
const app = express();
app.use(express.json());

// Add routes for testing
app.post('/api/auth/admin/login', AuthController.adminLogin);
app.post('/api/auth/user/register', AuthController.userRegister);
app.post('/api/auth/user/login', AuthController.userLogin);
app.post('/api/auth/admin/validate', AuthController.validateAdminToken);

async function testAuthAPI() {
  try {
    console.log('🧪 Testing Sequelize AuthController API endpoints...');
    
    // Start server
    const server = app.listen(3001, () => {
      console.log('✅ Test server started on port 3001');
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 1: Admin Login
    console.log('\n📋 Testing Admin Login API...');
    try {
      // Create a test admin
      const testAdmin = await Admin.create({
        id: 'test-api-admin-123',
        username: 'testapiadmin',
        email: 'testapi@example.com',
        password: 'password123',
        role: 'admin'
      });
      
      const loginResponse = await fetch('http://localhost:3001/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testapiadmin',
          password: 'password123'
        })
      });
      
      const loginResult = await loginResponse.json();
      console.log(`✅ Admin login API: ${loginResponse.status} - ${loginResult.role || loginResult.error}`);
      
      // Clean up test admin
      await testAdmin.destroy();
      
    } catch (error) {
      console.log(`❌ Admin login API test failed: ${error.message}`);
    }
    
    // Test 2: User Registration
    console.log('\n📋 Testing User Registration API...');
    try {
      const department = await Department.findOne();
      const course = await Course.findOne({
        where: { departmentId: department.id }
      });
      
      if (department && course) {
        const registerResponse = await fetch('http://localhost:3001/api/auth/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'API Test User',
            email: 'apitest@example.com',
            studentId: '2024-99999',
            password: 'password123',
            departmentId: department.id,
            courseId: course.id
          })
        });
        
        const registerResult = await registerResponse.json();
        console.log(`✅ User registration API: ${registerResponse.status} - ${registerResult.message || registerResult.error}`);
        
        // Clean up test user
        await Voter.destroy({
          where: { email: 'apitest@example.com' }
        });
        
      } else {
        console.log('⚠️ No department/course found for API testing');
      }
    } catch (error) {
      console.log(`❌ User registration API test failed: ${error.message}`);
    }
    
    // Test 3: User Login
    console.log('\n📋 Testing User Login API...');
    try {
      // Create a test user first
      const department = await Department.findOne();
      const course = await Course.findOne({
        where: { departmentId: department.id }
      });
      
      if (department && course) {
        const testUser = await Voter.create({
          name: 'API Login User',
          email: 'apilogin@example.com',
          studentId: '2024-88888',
          password: 'password123',
          departmentId: department.id,
          courseId: course.id
        });
        
        const loginResponse = await fetch('http://localhost:3001/api/auth/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: '2024-88888',
            password: 'password123'
          })
        });
        
        const loginResult = await loginResponse.json();
        console.log(`✅ User login API: ${loginResponse.status} - ${loginResult.message || loginResult.error}`);
        
        // Clean up test user
        await testUser.destroy();
        
      } else {
        console.log('⚠️ No department/course found for API testing');
      }
    } catch (error) {
      console.log(`❌ User login API test failed: ${error.message}`);
    }
    
    console.log('\n✅ All Sequelize AuthController API tests completed!');
    
    // Close server
    server.close(() => {
      console.log('✅ Test server closed');
    });
    
  } catch (error) {
    console.error('❌ Sequelize AuthController API test failed:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

testAuthAPI(); 