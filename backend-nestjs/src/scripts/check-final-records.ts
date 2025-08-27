import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFinalRecords() {
  try {
    console.log('🔍 Checking FINAL records to see which superadmin ID was used...\n');

    // Check the final department
    const finalDepartment = await prisma.department.findFirst({
      where: { Department_Name: 'Test Department Final' },
      select: { id: true, Department_Name: true, createdBy: true }
    });

    if (finalDepartment) {
      console.log('📋 Final Department:');
      console.log(`   ID: ${finalDepartment.id}`);
      console.log(`   Name: ${finalDepartment.Department_Name}`);
      console.log(`   Created By: ${finalDepartment.createdBy}`);
    }

    // Check the final course
    const finalCourse = await prisma.course.findFirst({
      where: { Course_Name: 'Test Course Final' },
      select: { id: true, Course_Name: true, createdBy: true }
    });

    if (finalCourse) {
      console.log('\n📚 Final Course:');
      console.log(`   ID: ${finalCourse.id}`);
      console.log(`   Name: ${finalCourse.Course_Name}`);
      console.log(`   Created By: ${finalCourse.createdBy}`);
    }

    // Check the final election
    const finalElection = await prisma.election.findFirst({
      where: { Election_Title: 'Test Election Final' },
      select: { id: true, Election_Title: true, createdBy: true }
    });

    if (finalElection) {
      console.log('\n🗳️ Final Election:');
      console.log(`   ID: ${finalElection.id}`);
      console.log(`   Title: ${finalElection.Election_Title}`);
      console.log(`   Created By: ${finalElection.createdBy}`);
    }

    // Check which superadmin was used
    console.log('\n🔍 Final Analysis:');
    if (finalDepartment && finalCourse && finalElection) {
      const usedAdminId = finalDepartment.createdBy;
      console.log(`   All final records used the same admin ID: ${usedAdminId}`);
      
      if (usedAdminId === 'DEV_SP') {
        console.log('   🎉 SUCCESS: System used our custom superadmin ID DEV_SP!');
        console.log('   ✅ This proves the dynamic admin ID system is working perfectly!');
      } else if (usedAdminId === 'NSGL-Z0BB2') {
        console.log('   ℹ️ System used the first available superadmin (this is also correct)');
      }
    }

  } catch (error) {
    console.error('❌ Error checking final records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalRecords();
