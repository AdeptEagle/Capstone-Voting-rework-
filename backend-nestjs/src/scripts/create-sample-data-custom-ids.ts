import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('=== Creating Sample Data with Custom IDs ===\n');

    // Get the admin ID
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      console.log('No admin found. Please create an admin first.');
      return;
    }

    const adminId = admin.id;
    console.log(`Using admin ID: ${adminId}\n`);

    // Create Departments
    console.log('Creating departments...');
    const dept1 = await prisma.department.create({
      data: {
        id: 'DEPT-1',
        name: 'Computer Science',
        description: 'Department of Computer Science',
        createdBy: adminId
      }
    });
    console.log(`✅ Created department: ${dept1.name} (${dept1.id})`);

    const dept2 = await prisma.department.create({
      data: {
        id: 'DEPT-2',
        name: 'Engineering',
        description: 'Department of Engineering',
        createdBy: adminId
      }
    });
    console.log(`✅ Created department: ${dept2.name} (${dept2.id})`);

    // Create Courses
    console.log('\nCreating courses...');
    const course1 = await prisma.course.create({
      data: {
        id: 'COURSE-1',
        name: 'Software Engineering',
        code: 'CS301',
        description: 'Advanced software engineering principles',
        departmentId: dept1.id,
        createdBy: adminId
      }
    });
    console.log(`✅ Created course: ${course1.name} (${course1.code}) - ${course1.id}`);

    const course2 = await prisma.course.create({
      data: {
        id: 'COURSE-2',
        name: 'Database Systems',
        code: 'CS302',
        description: 'Database design and management',
        departmentId: dept1.id,
        createdBy: adminId
      }
    });
    console.log(`✅ Created course: ${course2.name} (${course2.code}) - ${course2.id}`);

    // Create Positions
    console.log('\nCreating positions...');
    const pos1 = await prisma.position.create({
      data: {
        id: 'POS-1',
        title: 'Student Council President',
        description: 'Lead the student council'
      }
    });
    console.log(`✅ Created position: ${pos1.title} (${pos1.id})`);

    const pos2 = await prisma.position.create({
      data: {
        id: 'POS-2',
        title: 'Vice President',
        description: 'Assist the president'
      }
    });
    console.log(`✅ Created position: ${pos2.title} (${pos2.id})`);

    // Create Candidates
    console.log('\nCreating candidates...');
    const candidate1 = await prisma.candidate.create({
      data: {
        id: 'CAND-1',
        name: 'John Doe',
        email: 'john.doe@student.edu',
        studentId: '2024001',
        courseId: course1.id,
        positionId: pos1.id
      }
    });
    console.log(`✅ Created candidate: ${candidate1.name} (${candidate1.studentId}) - ${candidate1.id}`);

    const candidate2 = await prisma.candidate.create({
      data: {
        id: 'CAND-2',
        name: 'Jane Smith',
        email: 'jane.smith@student.edu',
        studentId: '2024002',
        courseId: course2.id,
        positionId: pos1.id
      }
    });
    console.log(`✅ Created candidate: ${candidate2.name} (${candidate2.studentId}) - ${candidate2.id}`);

    const candidate3 = await prisma.candidate.create({
      data: {
        id: 'CAND-3',
        name: 'Mike Johnson',
        email: 'mike.johnson@student.edu',
        studentId: '2024003',
        courseId: course1.id,
        positionId: pos2.id
      }
    });
    console.log(`✅ Created candidate: ${candidate3.name} (${candidate3.studentId}) - ${candidate3.id}`);

    // Create Voters
    console.log('\nCreating voters...');
    const voter1 = await prisma.voter.create({
      data: {
        id: 'VOTER-1',
        name: 'Alice Brown',
        studentId: '2024101',
        email: 'alice@student.edu',
        courseId: course1.id
      }
    });
    console.log(`✅ Created voter: ${voter1.name} (${voter1.studentId}) - ${voter1.id}`);

    const voter2 = await prisma.voter.create({
      data: {
        id: 'VOTER-2',
        name: 'Bob Wilson',
        studentId: '2024102',
        email: 'bob@student.edu',
        courseId: course2.id
      }
    });
    console.log(`✅ Created voter: ${voter2.name} (${voter2.studentId}) - ${voter2.id}`);

    console.log('\n🎉 === Sample Data Creation Complete ===');
    console.log('\n📊 Summary:');
    console.log(`   👤 Admin: ${adminId}`);
    console.log(`   🏢 Departments: ${dept1.id}, ${dept2.id}`);
    console.log(`   📚 Courses: ${course1.id}, ${course2.id}`);
    console.log(`   🎯 Positions: ${pos1.id}, ${pos2.id}`);
    console.log(`   👨‍💼 Candidates: ${candidate1.id}, ${candidate2.id}, ${candidate3.id}`);
    console.log(`   🗳️  Voters: ${voter1.id}, ${voter2.id}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleData()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 