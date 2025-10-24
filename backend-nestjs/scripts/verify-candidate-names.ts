import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCandidateNames() {
  try {
    console.log('🔍 Verifying candidate names uniqueness...');
    
    const candidates = await prisma.candidate.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        Candidate_Name: true,
        Candidate_Email: true,
        positionId: true,
        party_list_name: true
      }
    });

    console.log(`📊 Found ${candidates.length} candidates`);
    
    // Check for duplicate names
    const nameCounts = new Map();
    const duplicates = [];
    
    candidates.forEach(candidate => {
      const name = candidate.Candidate_Name;
      if (nameCounts.has(name)) {
        nameCounts.set(name, nameCounts.get(name) + 1);
        duplicates.push(name);
      } else {
        nameCounts.set(name, 1);
      }
    });

    if (duplicates.length > 0) {
      console.log('❌ Found duplicate candidate names:');
      duplicates.forEach(name => {
        console.log(`   - ${name} (${nameCounts.get(name)} times)`);
      });
    } else {
      console.log('✅ All candidate names are unique!');
    }

    // Show first 10 candidates as sample
    console.log('\n📋 Sample of candidates:');
    candidates.slice(0, 10).forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.Candidate_Name} (${candidate.party_list_name})`);
    });

  } catch (error) {
    console.error('❌ Error verifying candidate names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCandidateNames();
