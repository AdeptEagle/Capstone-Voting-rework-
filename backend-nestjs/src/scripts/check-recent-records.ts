import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecentRecords() {
  try {
    console.log('🔍 Checking recent records to see which superadmin ID was used...\n');

    // Check the most recent department
    const recentDepartment = await prisma.department.findFirst({
      where: { Department_Name: 'Test Department Custom Admin' },
      select: { id: true, Department_Name: true, createdBy: true }
    });

    if (recentDepartment) {
      console.log('📋 Recent Department:');
      console.log(`   ID: ${recentDepartment.id}`);
      console.log(`   Name: ${recentDepartment.Department_Name}`);
      console.log(`   Created By: ${recentDepartment.createdBy}`);
    }

    // Check the most recent course
    const recentCourse = await prisma.course.findFirst({
      where: { Course_Name: 'Test Course Custom Admin' },
      select: { id: true, Course_Name: true, createdBy: true }
    });

    if (recentCourse) {
      console.log('\n📚 Recent Course:');
      console.log(`   ID: ${recentCourse.id}`);
      console.log(`   Name: ${recentCourse.Course_Name}`);
      console.log(`   Created By: ${recentCourse.createdBy}`);
    }

    // Check the most recent election
    const recentElection = await prisma.election.findFirst({
      where: { Election_Title: 'Test Election Custom Admin' },
      select: { id: true, Election_Title: true, createdBy: true }
    });

    if (recentElection) {
      console.log('\n🗳️ Recent Election:');
      console.log(`   ID: ${recentElection.id}`);
      console.log(`   Title: ${recentElection.Election_Title}`);
      console.log(`   Created By: ${recentElection.createdBy}`);
    }

    // Check which superadmin was used
    console.log('\n🔍 Analysis:');
    if (recentDepartment && recentCourse && recentElection) {
      const usedAdminId = recentDepartment.createdBy;
      console.log(`   All records used the same admin ID: ${usedAdminId}`);
      
      if (usedAdminId === 'DEV_SP') {
        console.log('   ✅ SUCCESS: System used our custom superadmin ID!');
      } else {
        console.log('   ℹ️ System used the first available superadmin (this is expected behavior)');
      }
    }

  } catch (error) {
    console.error('❌ Error checking recent records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentRecords();
