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

async function demoSeedPositionsAndCandidates() {
  try {
    console.log('🎭 Demo: Seeding positions and candidates for demonstration...\n');

    // Define all standard positions
    const standardPositions = [
      // Supreme Student Council Positions
      { title: 'President', description: 'Leader of the student body, represents all students', voteLimit: 1, displayOrder: 1 },
      { title: 'Vice-President', description: 'Assists the president and takes over when needed', voteLimit: 1, displayOrder: 2 },
      { title: 'Secretary', description: 'Handles documentation and communication', voteLimit: 1, displayOrder: 3 },
      { title: 'Auditor', description: 'Oversees financial transparency and accountability', voteLimit: 1, displayOrder: 4 },
      { title: 'Treasurer', description: 'Manages student council finances', voteLimit: 1, displayOrder: 5 },
      { title: 'PIO Internal', description: 'Manages internal communications and events', voteLimit: 1, displayOrder: 6 },
      { title: 'PIO External', description: 'Manages external communications and partnerships', voteLimit: 1, displayOrder: 7 },
      { title: 'Senator', description: 'Represents student interests in governance', voteLimit: 8, displayOrder: 8 },
      
      // Department Officer Positions
      { title: 'Internal Vice-President', description: 'Handles internal department affairs', voteLimit: 1, displayOrder: 9 },
      { title: 'External Vice-President', description: 'Handles external department relations', voteLimit: 1, displayOrder: 10 },
      
      // Year Representatives
      { title: '1st Year Representative', description: 'Represents first-year students', voteLimit: 1, displayOrder: 11 },
      { title: '2nd Year Representative', description: 'Represents second-year students', voteLimit: 1, displayOrder: 12 },
      { title: '3rd Year Representative', description: 'Represents third-year students', voteLimit: 1, displayOrder: 13 },
      { title: '4th Year Representative', description: 'Represents fourth-year students', voteLimit: 1, displayOrder: 14 },
      
      // Club Positions
      { title: 'Public Relations Officer', description: 'Manages club public relations', voteLimit: 1, displayOrder: 15 },
    ];

    // Get departments and courses for candidate assignment
    const departments = await prisma.department.findMany();
    const courses = await prisma.course.findMany();

    if (departments.length === 0 || courses.length === 0) {
      console.log('❌ No departments or courses found. Please run database seeding first.');
      return;
    }

    console.log(`📊 Found ${departments.length} departments and ${courses.length} courses`);

    // Check existing positions
    const existingPositions = await prisma.position.findMany();
    console.log(`📊 Found ${existingPositions.length} existing positions`);

    // Create missing positions
    const existingTitles = existingPositions.map(p => p.Position_Title);
    const missingPositions = standardPositions.filter(
      position => !existingTitles.includes(position.title)
    );

    if (missingPositions.length > 0) {
      console.log(`📋 Creating ${missingPositions.length} missing positions...`);
      
      const createdPositions = [];
      for (const position of missingPositions) {
        try {
          console.log(`🔄 Creating: ${position.title}`);
          const createdPosition = await prisma.position.create({
            data: {
              id: generateId(),
              Position_Title: position.title,
              Position_Description: position.description,
              voteLimit: position.voteLimit,
              displayOrder: position.displayOrder,
            },
          });
          createdPositions.push(createdPosition);
          console.log(`✅ Created: ${createdPosition.Position_Title}`);
        } catch (error) {
          console.error(`❌ Failed to create ${position.title}:`, error);
          throw error;
        }
      }
      
      console.log(`✅ Successfully created ${createdPositions.length} positions`);
    } else {
      console.log('✅ All positions already exist');
    }

    // Now create candidates for all positions
    console.log('\n🌱 Creating candidates for all positions...');

    // Get all positions (existing + newly created)
    const allPositions = await prisma.position.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    // Check if candidates already exist
    const existingCandidates = await prisma.candidate.findMany();
    if (existingCandidates.length > 0) {
      console.log(`📊 Found ${existingCandidates.length} existing candidates`);
      console.log('🔄 Clearing existing candidates to create fresh demo data...');
      await prisma.candidate.deleteMany();
      console.log('✅ Existing candidates cleared');
    }

    // Sample names for candidates
    const candidateNames = [
      'John Michael Santos', 'Maria Clara Reyes', 'Carlos Antonio Cruz', 'Ana Sofia Mendoza',
      'Luis Miguel Torres', 'Isabella Grace Lim', 'Gabriel Enrique Santos', 'Sofia Isabel Reyes',
      'Diego Alejandro Cruz', 'Camila Esperanza Vega', 'Sebastian Andres Lopez', 'Valentina Sofia Ruiz',
      'Mateo Alejandro Herrera', 'Sofia Esperanza Morales', 'Nicolas Sebastian Jimenez', 'Isabella Camila Vargas',
      'Santiago Andres Ramirez', 'Valeria Sofia Castillo', 'Alejandro Sebastian Mendez', 'Camila Valentina Rojas',
      'Daniel Alejandro Pena', 'Sofia Camila Silva', 'Sebastian Mateo Castro', 'Valentina Sofia Ortega',
      'Mateo Santiago Flores', 'Isabella Valentina Aguilar', 'Nicolas Alejandro Vega', 'Sofia Camila Medina',
      'Santiago Sebastian Herrera', 'Valentina Sofia Rios', 'Alejandro Mateo Guerrero', 'Camila Sofia Navarro',
      'Daniel Sebastian Moreno', 'Sofia Valentina Jimenez', 'Sebastian Santiago Vargas', 'Valentina Camila Torres',
      'Mateo Alejandro Silva', 'Isabella Sofia Castro', 'Nicolas Sebastian Flores', 'Sofia Valentina Aguilar',
      'Santiago Mateo Vega', 'Valentina Sofia Medina', 'Alejandro Sebastian Rios', 'Camila Sofia Guerrero',
      'Daniel Alejandro Navarro', 'Sofia Valentina Moreno', 'Sebastian Santiago Jimenez', 'Valentina Camila Vargas'
    ];

    console.log(`📊 Creating candidates for ${allPositions.length} positions...`);

    // Create candidates for each position
    const allCandidates = [];
    let candidateIndex = 0;

    // DISABLED: Automatic candidate creation removed
    console.log('📋 Skipping candidate creation (disabled)');
    /*
    for (const position of allPositions) {
      console.log(`📋 Creating candidates for: ${position.Position_Title}`);
      
      // Create 2 candidates for this position
      for (let i = 1; i <= 2; i++) {
        const candidateName = candidateNames[candidateIndex % candidateNames.length];
        const studentId = generateUniqueStudentId();
        const department = departments[Math.floor(Math.random() * departments.length)];
        const course = courses.filter(c => c.departmentId === department.id)[0] || courses[0];
        
        const candidate = {
          id: generateId(),
          Candidate_Name: candidateName,
          Candidate_Email: `${candidateName.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
          Candidate_StudentId: studentId,
          manifesto: `I am committed to serving the student body and bringing positive change to our ${position.Position_Title} position. I will work tirelessly to represent your interests and make our community better for everyone.`,
          positionId: position.id,
          departmentId: department.id,
          courseId: course.id,
        };

        allCandidates.push(candidate);
        candidateIndex++;
        
        console.log(`   ${i}. ${candidateName} (${studentId}) - ${department.Department_Name}`);
      }
    }
    */

    // DISABLED: Candidate database creation removed
    console.log(`\n🏗️ Skipping candidate database creation (disabled)`);
    const createdCandidates = []; // Empty array

    console.log(`✅ No candidates created (automatic seeding disabled)`);

    // Show summary by position
    console.log('\n📊 Candidates created by position:');
    for (const position of allPositions) {
      const positionCandidates = createdCandidates.filter(c => c.positionId === position.id);
      console.log(`\n📋 ${position.Position_Title}:`);
      positionCandidates.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.Candidate_Name} (${candidate.Candidate_StudentId})`);
      });
    }

    // Show summary by department
    console.log('\n📊 Candidates by department:');
    const departmentCounts = new Map();
    for (const candidate of createdCandidates) {
      const department = departments.find(d => d.id === candidate.departmentId);
      if (department) {
        departmentCounts.set(department.Department_Name, (departmentCounts.get(department.Department_Name) || 0) + 1);
      }
    }
    
    for (const [department, count] of departmentCounts) {
      console.log(`   ${department}: ${count} candidates`);
    }

    // Check Year Representatives specifically
    const yearReps = allPositions.filter(p => p.Position_Title.includes('Year Representative'));
    console.log(`\n🎯 Year Representatives: ${yearReps.length}`);
    yearReps.forEach((rep, index) => {
      console.log(`   ${index + 1}. ${rep.Position_Title}`);
    });

    console.log('\n🎉 Demo seeding completed successfully!');
    console.log(`📊 Total positions: ${allPositions.length}`);
    console.log(`📊 Total candidates created: ${createdCandidates.length}`);
    console.log(`📊 Candidates per position: 2`);
    console.log(`📊 Year Representatives: ${yearReps.length}`);

    console.log('\n🎭 Demo system is ready!');
    console.log('✅ All positions and candidates are available for demonstration');
    console.log('✅ You can now create ballots and run elections');

  } catch (error) {
    console.error('❌ Demo seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

demoSeedPositionsAndCandidates()
  .then(() => {
    console.log('\n✅ Demo seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Demo seeding failed:', error);
    process.exit(1);
  });
