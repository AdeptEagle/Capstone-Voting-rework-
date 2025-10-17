import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate ID in format xxxx-xxxxx
function generateId(): string {
  const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${firstPart}-${secondPart}`;
}

// Helper function to generate student ID
function generateStudentId(): string {
  const year = Math.floor(Math.random() * 4) + 2020; // Random year between 2020-2023
  const randomNum = Math.floor(Math.random() * 90000) + 10000; // Random 5-digit number
  return `${year}-${randomNum}`;
}

// Set to track used student IDs to avoid duplicates
const usedStudentIds = new Set<string>();

// Helper function to generate unique student ID
function generateUniqueStudentId(): string {
  let studentId: string;
  do {
    studentId = generateStudentId();
  } while (usedStudentIds.has(studentId));
  usedStudentIds.add(studentId);
  return studentId;
}

async function main() {
  console.log('🌱 Starting candidate and party list seeding...');

  try {
    // Get existing data
    const positions = await prisma.position.findMany({
      where: { isDeleted: false },
      orderBy: { displayOrder: 'asc' }
    });

    const departments = await prisma.department.findMany({
      where: { isDeleted: false }
    });

    const courses = await prisma.course.findMany({
      where: { isDeleted: false }
    });

    const admins = await prisma.admin.findMany({
      where: { role: 'SUPERADMIN' }
    });

    if (positions.length === 0) {
      console.log('❌ No positions found. Please run the main seed script first.');
      return;
    }

    if (departments.length === 0) {
      console.log('❌ No departments found. Please run the main seed script first.');
      return;
    }

    if (courses.length === 0) {
      console.log('❌ No courses found. Please run the main seed script first.');
      return;
    }

    if (admins.length === 0) {
      console.log('❌ No superadmin found. Please run the main seed script first.');
      return;
    }

    const superAdmin = admins[0];

    console.log(`📊 Found ${positions.length} positions, ${departments.length} departments, ${courses.length} courses`);

    // Create 2 party lists
    console.log('🎭 Creating party lists...');
    const partyLists = await Promise.all([
      prisma.partyList.create({
        data: {
          id: 'PROG-PARTY',
          name: 'Progressive Party',
          description: 'A party focused on progressive change and student welfare',
          color: '#FF6B6B',
          logo: null,
        },
      }),
      prisma.partyList.create({
        data: {
          id: 'UNITY-PARTY',
          name: 'Unity Party',
          description: 'A party promoting unity and collaboration among students',
          color: '#4ECDC4',
          logo: null,
        },
      }),
    ]);

    console.log(`✅ Created ${partyLists.length} party lists`);

    // Create candidates for each position (one from each party)
    console.log('👥 Creating candidates...');
    const candidates = [];

    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      
      // Get random department and course
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      const deptCourses = courses.filter(c => c.departmentId === randomDept.id);
      const randomCourse = deptCourses.length > 0 ? deptCourses[Math.floor(Math.random() * deptCourses.length)] : courses[0];

      // Create candidate from Progressive Party
      const progressiveCandidate = await prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: `Progressive Candidate ${i + 1}`,
          Candidate_Email: `progressive.candidate${i + 1}@student.edu`,
          Candidate_StudentId: generateUniqueStudentId(),
          manifesto: `As a Progressive Party candidate for ${position.Position_Title}, I will work towards innovative solutions and student welfare improvements.`,
          positionId: position.id,
          departmentId: randomDept.id,
          courseId: randomCourse.id,
          partyListId: partyLists[0].id,
          party_list_name: partyLists[0].name,
        },
      });

      // Create candidate from Unity Party
      const unityCandidate = await prisma.candidate.create({
        data: {
          id: generateId(),
          Candidate_Name: `Unity Candidate ${i + 1}`,
          Candidate_Email: `unity.candidate${i + 1}@student.edu`,
          Candidate_StudentId: generateUniqueStudentId(),
          manifesto: `As a Unity Party candidate for ${position.Position_Title}, I will promote collaboration and bring students together.`,
          positionId: position.id,
          departmentId: randomDept.id,
          courseId: randomCourse.id,
          partyListId: partyLists[1].id,
          party_list_name: partyLists[1].name,
        },
      });

      candidates.push(progressiveCandidate, unityCandidate);
      console.log(`✅ Created candidates for ${position.Position_Title}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary of created data:');
    console.log(`   - Party Lists: ${partyLists.length}`);
    console.log(`   - Candidates: ${candidates.length}`);
    console.log(`   - Candidates per position: 2`);
    console.log('');
    console.log('🎭 Party Lists:');
    partyLists.forEach(party => {
      console.log(`   - ${party.name} (${party.color})`);
    });
    console.log('');
    console.log('👥 Candidates by position:');
    positions.forEach((position, index) => {
      const positionCandidates = candidates.filter(c => c.positionId === position.id);
      console.log(`   - ${position.Position_Title}: ${positionCandidates.length} candidates`);
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
