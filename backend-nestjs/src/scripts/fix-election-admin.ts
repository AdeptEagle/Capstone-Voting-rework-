import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixElectionAdmin() {
  try {
    console.log('🔧 === Fixing Election Admin Reference ===\n');

    // Check if the election exists
    const election = await prisma.election.findUnique({
      where: { id: 'ELECTION-2024-FALL' },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!election) {
      console.log('❌ Election ELECTION-2024-FALL not found');
      return;
    }

    console.log(`✅ Found election: ${election.title}`);
    console.log(`   Current createdBy: ${election.createdBy}`);
    console.log(`   Current admin: ${election.admin ? election.admin.username : 'NULL'}\n`);

    // Check if admin exists
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      console.log('❌ No admin found in database');
      return;
    }

    console.log(`✅ Found admin: ${admin.username} (${admin.id})`);

    // If the election already has a valid admin, we're good
    if (election.admin) {
      console.log('✅ Election already has a valid admin reference');
      return;
    }

    // Update the election to reference the valid admin
    const updatedElection = await prisma.election.update({
      where: { id: 'ELECTION-2024-FALL' },
      data: {
        createdBy: admin.id
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    console.log('\n🎉 === Election Admin Fixed ===');
    console.log(`✅ Election: ${updatedElection.title}`);
    console.log(`✅ Created By: ${updatedElection.admin.username} (${updatedElection.admin.id})`);
    console.log('\n🚀 The frontend should now show the correct admin name!');

  } catch (error) {
    console.error('❌ Error fixing election admin:', error);
    throw error;
  }
}

fixElectionAdmin()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
