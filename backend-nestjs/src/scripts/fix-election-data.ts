import { PrismaClient } from '@prisma/client';
import { IdGeneratorService } from '../utils/id-generator.service';
import { PrismaService } from '../prisma/prisma.service';

const prisma = new PrismaClient();
const prismaService = new PrismaService();
const idGenerator = new IdGeneratorService(prismaService);

async function fixElectionData() {
  try {
    console.log('🔧 === Fixing Election Data ===\n');

    // Check if the election exists
    const election = await prisma.election.findUnique({
      where: { id: 'ELECTION-2024-FALL' },
      include: {
        electionPositions: {
          include: {
            position: true
          }
        },
        electionCandidates: {
          include: {
            candidate: true
          }
        }
      }
    });

    if (!election) {
      console.log('❌ Election ELECTION-2024-FALL not found');
      return;
    }

    console.log(`✅ Found election: ${election.title}`);
    console.log(`   Current positions: ${election.electionPositions.length}`);
    console.log(`   Current candidates: ${election.electionCandidates.length}\n`);

    // If election already has positions and candidates, we're good
    if (election.electionPositions.length > 0 && election.electionCandidates.length > 0) {
      console.log('✅ Election already has positions and candidates assigned');
      return;
    }

    // Get or create positions
    console.log('🎯 Setting up positions...');
    const positions = await Promise.all([
      prisma.position.upsert({
        where: { id: 'POS-PRESIDENT' },
        update: {},
        create: {
          id: 'POS-PRESIDENT',
          title: 'Student Council President',
          description: 'Lead the student council and represent student body',
          displayOrder: 1
        }
      }),
      prisma.position.upsert({
        where: { id: 'POS-VP' },
        update: {},
        create: {
          id: 'POS-VP',
          title: 'Vice President',
          description: 'Assist the president and lead in their absence',
          displayOrder: 2
        }
      })
    ]);

    console.log(`✅ Created/found ${positions.length} positions`);

    // Get or create candidates
    console.log('\n👨‍💼 Setting up candidates...');
    const candidates = await Promise.all([
      prisma.candidate.upsert({
        where: { id: 'CAND-PRES-1' },
        update: {},
        create: {
          id: 'CAND-PRES-1',
          name: 'Alexandra Santos',
          email: 'alexandra.santos@student.edu',
          studentId: '2024-001',
          courseId: 'COURSE-CS301',
          positionId: 'POS-PRESIDENT',
          manifesto: 'Passionate leader with experience in student organizations'
        }
      }),
      prisma.candidate.upsert({
        where: { id: 'CAND-PRES-2' },
        update: {},
        create: {
          id: 'CAND-PRES-2',
          name: 'Miguel Cruz',
          email: 'miguel.cruz@student.edu',
          studentId: '2024-002',
          courseId: 'COURSE-BUS501',
          positionId: 'POS-PRESIDENT',
          manifesto: 'Business-minded leader focused on student success'
        }
      }),
      prisma.candidate.upsert({
        where: { id: 'CAND-VP-1' },
        update: {},
        create: {
          id: 'CAND-VP-1',
          name: 'David Kim',
          email: 'david.kim@student.edu',
          studentId: '2024-004',
          courseId: 'COURSE-CS302',
          positionId: 'POS-VP',
          manifesto: 'Database expert with leadership experience'
        }
      })
    ]);

    console.log(`✅ Created/found ${candidates.length} candidates`);

    // Add positions to election if not already added
    console.log('\n🔗 Adding positions to election...');
    for (const position of positions) {
      const existingPosition = election.electionPositions.find(ep => ep.positionId === position.id);
      if (!existingPosition) {
        const assignmentId = await idGenerator.generateElectionPositionId();
        await prisma.electionPosition.create({
          data: {
            id: assignmentId,
            electionId: election.id,
            positionId: position.id
          }
        });
        console.log(`✅ Added position: ${position.title}`);
      } else {
        console.log(`⏭️  Position already added: ${position.title}`);
      }
    }

    // Add candidates to election if not already added
    console.log('\n🔗 Adding candidates to election...');
    for (const candidate of candidates) {
      const existingCandidate = election.electionCandidates.find(ec => ec.candidateId === candidate.id);
      if (!existingCandidate) {
        const assignmentId = await idGenerator.generateElectionCandidateId();
        await prisma.electionCandidate.create({
          data: {
            id: assignmentId,
            electionId: election.id,
            candidateId: candidate.id
          }
        });
        console.log(`✅ Added candidate: ${candidate.name} (${candidate.positionId})`);
      } else {
        console.log(`⏭️  Candidate already added: ${candidate.name}`);
      }
    }

    // Verify the election now has positions and candidates
    const updatedElection = await prisma.election.findUnique({
      where: { id: 'ELECTION-2024-FALL' },
      include: {
        electionPositions: {
          include: {
            position: true
          }
        },
        electionCandidates: {
          include: {
            candidate: true
          }
        }
      }
    });

    console.log('\n🎉 === Election Data Fixed ===');
    console.log(`✅ Election: ${updatedElection.title}`);
    console.log(`✅ Positions: ${updatedElection.electionPositions.length}`);
    console.log(`✅ Candidates: ${updatedElection.electionCandidates.length}`);
    console.log('\n🚀 You can now start the ballot!');

  } catch (error) {
    console.error('❌ Error fixing election data:', error);
    throw error;
  }
}

fixElectionData()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
