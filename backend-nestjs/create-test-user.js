const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔍 Checking for existing departments and courses...');
    
    // Get first department and course
    const department = await prisma.department.findFirst();
    const course = await prisma.course.findFirst();
    
    if (!department || !course) {
      console.error('❌ No departments or courses found. Please run the main seed script first.');
      return;
    }
    
    console.log(`📚 Using department: ${department.Department_Name}`);
    console.log(`🎓 Using course: ${course.Course_Name}`);
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = await prisma.voter.create({
      data: {
        id: 'TEST-USER-001',
        Voter_Name: 'Test User',
        Voter_Email: 'test@example.com',
        Voter_StudentId: '2024-12345',
        password: hashedPassword,
        courseId: course.id,
        departmentId: department.id,
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Student ID: 2024-12345');
    console.log('   Password: password123');
    console.log('   Email: test@example.com');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Test user already exists. You can use:');
      console.log('   Student ID: 2024-12345');
      console.log('   Password: password123');
    } else {
      console.error('❌ Error creating test user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
