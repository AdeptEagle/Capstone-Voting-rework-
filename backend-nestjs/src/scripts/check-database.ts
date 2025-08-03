import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== Checking Database Content ===\n');

    // Check Admins
    const admins = await prisma.admin.findMany();
    console.log(`Admins: ${admins.length} records`);
    admins.forEach(admin => console.log(`  - ${admin.username} (${admin.email})`));

    // Check Departments
    const departments = await prisma.department.findMany();
    console.log(`\nDepartments: ${departments.length} records`);
    departments.forEach(dept => console.log(`  - ${dept.name} (${dept.description})`));

    // Check Courses
    const courses = await prisma.course.findMany();
    console.log(`\nCourses: ${courses.length} records`);
    courses.forEach(course => console.log(`  - ${course.name} (${course.code})`));

    // Check Positions
    const positions = await prisma.position.findMany();
    console.log(`\nPositions: ${positions.length} records`);
    positions.forEach(pos => console.log(`  - ${pos.title}`));

    // Check Candidates
    const candidates = await prisma.candidate.findMany();
    console.log(`\nCandidates: ${candidates.length} records`);
    candidates.forEach(candidate => console.log(`  - ${candidate.name} (${candidate.studentId})`));

    console.log('\n=== Database Check Complete ===');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 