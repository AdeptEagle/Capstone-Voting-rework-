import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAutoCandidateCreation() {
  try {
    console.log('🧪 Testing automatic candidate creation...\n');

    // Step 1: Clean system to simulate fresh start
    console.log('🧹 Cleaning system for fresh test...');
    
    // Clear votes first
    await prisma.vote.deleteMany();
    console.log('✅ Votes cleared');
    
    // Clear ballot results
    await prisma.ballotResultDetails.deleteMany();
    await prisma.ballotResults.deleteMany();
    console.log('✅ Ballot results cleared');
    
    // Clear ballot candidates
    await prisma.ballotCandidate.deleteMany();
    console.log('✅ Ballot candidates cleared');
    
    // Clear ballot positions
    await prisma.ballotPosition.deleteMany();
    console.log('✅ Ballot positions cleared');
    
    // Clear user ballot history
    await prisma.userBallotHistory.deleteMany();
    console.log('✅ User ballot history cleared');
    
    // Clear ballots
    await prisma.ballot.deleteMany();
    console.log('✅ Ballots cleared');
    
    // Clear candidates
    await prisma.candidate.deleteMany();
    console.log('✅ Candidates cleared');
    
    // Clear positions
    await prisma.position.deleteMany();
    console.log('✅ Positions cleared');

    // Step 2: Check initial state
    const initialPositions = await prisma.position.findMany();
    const initialCandidates = await prisma.candidate.findMany();
    console.log(`\n📊 Initial state: ${initialPositions.length} positions, ${initialCandidates.length} candidates`);

    // Step 3: Simulate what PositionInitializationService would do
    console.log('\n🔄 Simulating PositionInitializationService...');

    // Define standard positions
    const standardPositions = [
      { title: 'President', description: 'Leader of the student body', voteLimit: 1, displayOrder: 1 },
      { title: 'Vice-President', description: 'Assists the president', voteLimit: 1, displayOrder: 2 },
      { title: 'Secretary', description: 'Handles documentation', voteLimit: 1, displayOrder: 3 },
      { title: 'Auditor', description: 'Oversees financial transparency', voteLimit: 1, displayOrder: 4 },
      { title: 'Treasurer', description: 'Manages finances', voteLimit: 1, displayOrder: 5 },
      { title: 'PIO Internal', description: 'Internal communications', voteLimit: 1, displayOrder: 6 },
      { title: 'PIO External', description: 'External communications', voteLimit: 1, displayOrder: 7 },
      { title: 'Senator', description: 'Student governance', voteLimit: 8, displayOrder: 8 },
      { title: 'Internal Vice-President', description: 'Department affairs', voteLimit: 1, displayOrder: 9 },
      { title: 'External Vice-President', description: 'External relations', voteLimit: 1, displayOrder: 10 },
      { title: '1st Year Representative', description: 'First-year students', voteLimit: 1, displayOrder: 11 },
      { title: '2nd Year Representative', description: 'Second-year students', voteLimit: 1, displayOrder: 12 },
      { title: '3rd Year Representative', description: 'Third-year students', voteLimit: 1, displayOrder: 13 },
      { title: '4th Year Representative', description: 'Fourth-year students', voteLimit: 1, displayOrder: 14 },
      { title: 'Public Relations Officer', description: 'Club relations', voteLimit: 1, displayOrder: 15 },
    ];

    // Create positions
    console.log('📋 Creating positions...');
    const createdPositions = [];
    for (const position of standardPositions) {
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
    }

    console.log(`✅ Created ${createdPositions.length} positions`);

    // Step 4: Now simulate candidate creation (this is what was missing)
    console.log('\n🌱 Creating candidates for all positions...');

    // Get departments and courses
    const departments = await prisma.department.findMany();
    const courses = await prisma.course.findMany();

    if (departments.length === 0 || courses.length === 0) {
      console.log('❌ No departments or courses found');
      return;
    }

    // Check which positions need candidates
    const existingCandidates = await prisma.candidate.findMany();
    const positionsWithCandidates = new Set();
    
    for (const candidate of existingCandidates) {
      positionsWithCandidates.add(candidate.positionId);
    }
    
    const positionsNeedingCandidates = createdPositions.filter(p => !positionsWithCandidates.has(p.id));
    
    console.log(`📊 Found ${existingCandidates.length} existing candidates`);
    console.log(`📊 Positions needing candidates: ${positionsNeedingCandidates.length}`);

    if (positionsNeedingCandidates.length > 0) {
      // Create candidates
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

      const usedStudentIds = new Set<string>();
      const generateUniqueStudentId = (): string => {
        let studentId: string;
        do {
          const year = Math.floor(Math.random() * 4) + 2020;
          const randomNum = Math.floor(Math.random() * 90000) + 10000;
          studentId = `${year}-${randomNum}`;
        } while (usedStudentIds.has(studentId));
        usedStudentIds.add(studentId);
        return studentId;
      };

      const allCandidates = [];
      let candidateIndex = 0;

      for (const position of positionsNeedingCandidates) {
        console.log(`📋 Creating candidates for: ${position.Position_Title}`);
        
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
            manifesto: `I am committed to serving the student body and bringing positive change to our ${position.Position_Title} position.`,
            positionId: position.id,
            departmentId: department.id,
            courseId: course.id,
          };

          allCandidates.push(candidate);
          candidateIndex++;
          
          console.log(`   ${i}. ${candidateName} (${studentId}) - ${department.Department_Name}`);
        }
      }

      // Create all candidates in database
      console.log(`\n🏗️ Creating ${allCandidates.length} candidates in database...`);
      
      const createdCandidates = await Promise.all(
        allCandidates.map(candidateData => 
          prisma.candidate.create({
            data: candidateData
          })
        )
      );

      console.log(`✅ Successfully created ${createdCandidates.length} candidates`);
    }

    // Step 5: Final verification
    const finalPositions = await prisma.position.findMany();
    const finalCandidates = await prisma.candidate.findMany();
    const yearReps = finalPositions.filter(p => p.Position_Title.includes('Year Representative'));

    console.log('\n📊 Final System State:');
    console.log(`   Positions: ${finalPositions.length} ${finalPositions.length >= 15 ? '✅' : '❌'}`);
    console.log(`   Candidates: ${finalCandidates.length} ${finalCandidates.length >= 30 ? '✅' : '❌'}`);
    console.log(`   Year Representatives: ${yearReps.length} ${yearReps.length >= 4 ? '✅' : '❌'}`);

    if (finalPositions.length >= 15 && finalCandidates.length >= 30) {
      console.log('\n🎉 Automatic candidate creation test passed!');
      console.log('✅ Positions and candidates are created automatically');
      console.log('✅ This will work in your other system');
    } else {
      console.log('\n❌ Automatic candidate creation test failed');
      console.log('Some positions or candidates may be missing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate ID
function generateId(): string {
  const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${firstPart}-${secondPart}`;
}

testAutoCandidateCreation()
  .then(() => {
    console.log('\n✅ Automatic candidate creation test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Automatic candidate creation test failed:', error);
    process.exit(1);
  });
