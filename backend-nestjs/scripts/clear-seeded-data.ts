import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearSeededData() {
  console.log('🧹 Starting to clear seeded data (preserving admins)...');

  try {
    // Clear all data except admins
    console.log('🗑️ Clearing votes...');
    await prisma.vote.deleteMany();

    console.log('🗑️ Clearing election candidates...');
    await prisma.electionCandidate.deleteMany();

    console.log('🗑️ Clearing election positions...');
    await prisma.electionPosition.deleteMany();

    console.log('🗑️ Clearing candidates...');
    await prisma.candidate.deleteMany();

    console.log('🗑️ Clearing voters...');
    await prisma.voter.deleteMany();

    console.log('🗑️ Clearing courses...');
    await prisma.course.deleteMany();

    console.log('🗑️ Clearing departments...');
    await prisma.department.deleteMany();

    console.log('🗑️ Clearing positions...');
    await prisma.position.deleteMany();

    console.log('🗑️ Clearing elections...');
    await prisma.election.deleteMany();

    console.log('🗑️ Clearing audit logs...');
    await prisma.auditLog.deleteMany();

    // Keep admins - don't delete them
    console.log('✅ Preserving admin accounts...');

    // Verify admins still exist
    const admins = await prisma.admin.findMany();
    console.log(`👑 Preserved ${admins.length} admin accounts:`);
    admins.forEach(admin => {
      console.log(`   - ${admin.Admin_Username} (${admin.role})`);
    });

    console.log('');
    console.log('✅ Database cleared successfully!');
    console.log('📊 Summary:');
    console.log('   - All voters, candidates, positions, departments, courses, elections, and votes have been removed');
    console.log('   - Admin accounts have been preserved');
    console.log('   - Database is ready for the new multi-ballot system');

  } catch (error) {
    console.error('❌ Error clearing seeded data:', error);
    throw error;
  }
}

clearSeededData()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

