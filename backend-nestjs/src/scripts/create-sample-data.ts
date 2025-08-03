import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('=== Creating Sample Data ===\n');

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
    console.log(`Created department: ${dept1.name}`);

    const dept2 = await prisma.department.create({
      data: {
        id: 'DEPT-2',
        name: 'Engineering',
        description: 'Department of Engineering',
        createdBy: adminId
      }
    });
    console.log(`Created department: ${dept2.name}`);

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
    console.log(`Created course: ${course1.name} (${course1.code})`);

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
    console.log(`Created course: ${course2.name} (${course2.code})`);

    // Create Positions
    console.log('\nCreating positions...');
    const pos1 = await prisma.position.create({
      data: {
        id: 'POS-1',
        title: 'Student Council President',
        description: 'Lead the student council'
      }
    });
    console.log(`Created position: ${pos1.title}`);

    const pos2 = await prisma.position.create({
      data: {
        id: 'POS-2',
        title: 'Vice President',
        description: 'Assist the president'
      }
    });
    console.log(`Created position: ${pos2.title}`);

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
    console.log(`Created candidate: ${candidate1.name} (${candidate1.studentId})`);

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
    console.log(`Created candidate: ${candidate2.name} (${candidate2.studentId})`);

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
    console.log(`Created candidate: ${candidate3.name} (${candidate3.studentId})`);

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
    console.log(`Created voter: ${voter1.name} (${voter1.studentId})`);

    const voter2 = await prisma.voter.create({
      data: {
        id: 'VOTER-2',
        name: 'Bob Wilson',
        studentId: '2024102',
        email: 'bob@student.edu',
        courseId: course2.id
      }
    });
    console.log(`Created voter: ${voter2.name} (${voter2.studentId})`);

    console.log('\n=== Sample Data Creation Complete ===');
    console.log('\nNow you should see data in Prisma Studio!');

  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSampleData()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 