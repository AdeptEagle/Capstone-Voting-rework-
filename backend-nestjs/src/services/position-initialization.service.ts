import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PositionInitializationService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Add a small delay to ensure database is ready
    setTimeout(async () => {
      await this.ensurePositionsExist();
    }, 3000);
  }

  private async ensurePositionsExist() {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`🔍 Checking for positions... (Attempt ${retryCount + 1}/${maxRetries})`);
        
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

        // Check existing positions
        const existingPositions = await this.prisma.position.findMany({
          select: { Position_Title: true }
        });

        const existingTitles = existingPositions.map(p => p.Position_Title);
        const missingPositions = standardPositions.filter(
          position => !existingTitles.includes(position.title)
        );

        console.log(`📊 Found ${existingPositions.length} existing positions`);
        console.log(`📊 Missing ${missingPositions.length} positions`);

        if (missingPositions.length === 0) {
          console.log('✅ All standard positions are already present');
          return;
        }

        console.log(`📋 Creating ${missingPositions.length} missing positions...`);

        // Create missing positions
        const createdPositions = [];
        for (const position of missingPositions) {
          try {
            console.log(`🔄 Creating position: ${position.title}`);
            const createdPosition = await this.prisma.position.create({
              data: {
                id: this.generateId(),
                Position_Title: position.title,
                Position_Description: position.description,
                voteLimit: position.voteLimit,
                displayOrder: position.displayOrder,
              },
            });
            createdPositions.push(createdPosition);
            console.log(`✅ Created: ${createdPosition.Position_Title}`);
          } catch (error) {
            console.error(`❌ Failed to create position ${position.title}:`, error);
            // Continue with other positions
          }
        }

        console.log(`✅ Successfully created ${createdPositions.length} positions:`);
        createdPositions.forEach(position => {
          console.log(`   - ${position.Position_Title}`);
        });

        // Verify all positions are now present
        const finalCheck = await this.prisma.position.findMany({
          select: { Position_Title: true }
        });

        console.log(`🔍 Final verification: ${finalCheck.length} positions present`);

        if (finalCheck.length >= standardPositions.length) {
          console.log('🎉 All standard positions are now available!');
          
          // DISABLED: Automatic candidate seeding removed
          // await this.ensureCandidatesForAllPositions();
          
          console.log('🎉 All standard positions are now available! (Candidates must be created manually)');
          return;
        } else {
          throw new Error(`Only ${finalCheck.length}/${standardPositions.length} positions found`);
        }

      } catch (error) {
        console.error(`❌ Error initializing positions (Attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.error('💥 Failed to initialize positions after maximum retries');
          // Don't throw error to prevent application startup failure
        }
      }
    }
  }

  private async ensureCandidatesForAllPositions() {
    try {
      console.log('\n🌱 Creating candidates for all positions...');

      // Get all positions
      const positions = await this.prisma.position.findMany({
        orderBy: { displayOrder: 'asc' }
      });

      if (positions.length === 0) {
        console.log('⚠️ No positions found, skipping candidate creation');
        return;
      }

      // Get departments and courses for assignment
      const departments = await this.prisma.department.findMany({
        where: { isDeleted: false },
      });
      const courses = await this.prisma.course.findMany({
        where: { isDeleted: false },
      });

      if (departments.length === 0 || courses.length === 0) {
        console.log('⚠️ No departments or courses found, skipping candidate creation');
        return;
      }

      // Check which positions need candidates
      const existingCandidates = await this.prisma.candidate.findMany({
        where: { isDeleted: false },
      });
      const positionsWithCandidates = new Set();
      
      for (const candidate of existingCandidates) {
        positionsWithCandidates.add(candidate.positionId);
      }
      
      const positionsNeedingCandidates = positions.filter(p => !positionsWithCandidates.has(p.id));
      
      console.log(`📊 Found ${existingCandidates.length} existing candidates`);
      console.log(`📊 Positions needing candidates: ${positionsNeedingCandidates.length}`);
      
      if (positionsNeedingCandidates.length === 0) {
        console.log('✅ All positions already have candidates');
        return;
      }

      console.log(`📊 Creating candidates for ${positionsNeedingCandidates.length} positions...`);

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

      // Set to track used student IDs to avoid duplicates
      const usedStudentIds = new Set<string>();

      // Helper function to generate unique student ID
      const generateUniqueStudentId = (): string => {
        let studentId: string;
        do {
          const year = Math.floor(Math.random() * 4) + 2020; // Random year between 2020-2023
          const randomNum = Math.floor(Math.random() * 90000) + 10000; // Random 5-digit number
          studentId = `${year}-${randomNum}`;
        } while (usedStudentIds.has(studentId));
        usedStudentIds.add(studentId);
        return studentId;
      };

      // Create candidates for each position that needs them
      const allCandidates = [];
      let candidateIndex = 0;

      for (const position of positionsNeedingCandidates) {
        console.log(`📋 Creating candidates for: ${position.Position_Title}`);
        
        // Create 2 candidates for this position
        for (let i = 1; i <= 2; i++) {
          const candidateName = candidateNames[candidateIndex % candidateNames.length];
          const studentId = generateUniqueStudentId();
          const department = departments[Math.floor(Math.random() * departments.length)];
          const course = courses.filter(c => c.departmentId === department.id)[0] || courses[0];
          
          const candidate = {
            id: this.generateId(),
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

      // Create all candidates in database
      console.log(`\n🏗️ Creating ${allCandidates.length} candidates in database...`);
      
      const createdCandidates = await Promise.all(
        allCandidates.map(candidateData => 
          this.prisma.candidate.create({
            data: candidateData
          })
        )
      );

      console.log(`✅ Successfully created ${createdCandidates.length} candidates`);

      // Show summary by position
      console.log('\n📊 Candidates created by position:');
      for (const position of positions) {
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

      console.log('\n🎉 Candidate creation completed successfully!');
      console.log(`📊 Total candidates created: ${createdCandidates.length}`);
      console.log(`📊 Candidates per position: 2`);
      console.log(`📊 Total positions: ${positions.length}`);

    } catch (error) {
      console.error('❌ Error creating candidates:', error);
      throw error;
    }
  }

  private generateId(): string {
    const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${firstPart}-${secondPart}`;
  }
}
