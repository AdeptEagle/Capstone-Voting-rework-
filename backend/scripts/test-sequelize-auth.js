import { AuthService } from '../services/sequelize/AuthService.js';
import { Admin, Voter, Department, Course } from '../models/sequelize/index.js';
import { sequelize } from '../config/sequelize.js';

async function testSequelizeAuth() {
  try {
    console.log('🧪 Testing Sequelize AuthService...');
    
    // Test 1: Admin Login
    console.log('\n📋 Testing Admin Login...');
    try {
      // Get first admin from database
      const admin = await Admin.findOne();
      if (admin) {
        console.log(`✅ Found admin: ${admin.username}`);
        
        // Test with wrong password
        try {
          await AuthService.adminLogin(admin.username, 'wrongpassword');
          console.log('❌ Should have failed with wrong password');
        } catch (error) {
          console.log(`✅ Correctly rejected wrong password: ${error.message}`);
        }
        
        // Test with correct password (we'll use a test password)
        try {
          // Create a test admin with known password
          const testAdmin = await Admin.create({
            id: 'test-auth-admin-123',
            username: 'testauthadmin',
            email: 'testauth@example.com',
            password: 'password123',
            role: 'admin'
          });
          
          const result = await AuthService.adminLogin('testauthadmin', 'password123');
          console.log(`✅ Admin login successful: ${result.role} - ${result.id}`);
          
          // Clean up test admin
          await testAdmin.destroy();
          console.log('✅ Test admin cleaned up');
          
        } catch (error) {
          console.log(`❌ Admin login failed: ${error.message}`);
        }
      } else {
        console.log('⚠️ No admin found in database');
      }
    } catch (error) {
      console.log(`❌ Admin login test failed: ${error.message}`);
    }
    
    // Test 2: User Registration
    console.log('\n📋 Testing User Registration...');
    try {
      // Get a department and course for testing
      const department = await Department.findOne();
      const course = await Course.findOne({
        where: { departmentId: department.id }
      });
      
      if (department && course) {
        console.log(`✅ Found department: ${department.name} and course: ${course.name}`);
        
        const testUserData = {
          name: 'Test User',
          email: 'testuser@example.com',
          studentId: '2024-12345',
          password: 'password123',
          departmentId: department.id,
          courseId: course.id
        };
        
        const result = await AuthService.userRegister(testUserData);
        console.log(`✅ User registration successful: ${result.id} - ${result.message}`);
        
        // Clean up test user
        await Voter.destroy({
          where: { email: 'testuser@example.com' }
        });
        console.log('✅ Test user cleaned up');
        
      } else {
        console.log('⚠️ No department/course found for testing');
      }
    } catch (error) {
      console.log(`❌ User registration test failed: ${error.message}`);
    }
    
    // Test 3: User Login
    console.log('\n📋 Testing User Login...');
    try {
      // Create a test user first
      const department = await Department.findOne();
      const course = await Course.findOne({
        where: { departmentId: department.id }
      });
      
      if (department && course) {
        const testUser = await Voter.create({
          name: 'Test Login User',
          email: 'testlogin@example.com',
          studentId: '2024-54321',
          password: 'password123',
          departmentId: department.id,
          courseId: course.id
        });
        
        // Test login
        const result = await AuthService.userLogin('2024-54321', 'password123');
        console.log(`✅ User login successful: ${result.id} - ${result.message}`);
        
        // Test wrong password
        try {
          await AuthService.userLogin('2024-54321', 'wrongpassword');
          console.log('❌ Should have failed with wrong password');
        } catch (error) {
          console.log(`✅ Correctly rejected wrong password: ${error.message}`);
        }
        
        // Clean up test user
        await testUser.destroy();
        console.log('✅ Test login user cleaned up');
        
      } else {
        console.log('⚠️ No department/course found for testing');
      }
    } catch (error) {
      console.log(`❌ User login test failed: ${error.message}`);
    }
    
    // Test 4: Token Validation
    console.log('\n📋 Testing Token Validation...');
    try {
      const admin = await Admin.findOne();
      if (admin) {
        // Create a token
        const { JWT_SECRET } = await import('../config/constants.js');
        const jwt = (await import('jsonwebtoken')).default;
        
        const token = jwt.sign(
          { id: admin.id, username: admin.username, role: admin.role },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        const result = await AuthService.validateAdminToken(token);
        console.log(`✅ Token validation: ${result.valid ? 'Valid' : 'Invalid'} - ${result.reason || 'Success'}`);
        
      } else {
        console.log('⚠️ No admin found for token validation test');
      }
    } catch (error) {
      console.log(`❌ Token validation test failed: ${error.message}`);
    }
    
    console.log('\n✅ All Sequelize AuthService tests completed!');
    
  } catch (error) {
    console.error('❌ Sequelize AuthService test failed:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

testSequelizeAuth(); 