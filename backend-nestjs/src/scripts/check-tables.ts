import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('=== Checking Database Tables ===\n');

    // Check if tables exist by trying to query them
    const tables = [
      'admins',           // @@map("admins")
      'departments',      // @@map("departments") 
      'courses',          // @@map("courses")
      'positions',        // @@map("positions")
      'candidates',       // @@map("candidates")
      'voters',           // @@map("voters")
      'elections',        // @@map("elections")
      'votes'             // @@map("votes")
    ];

    for (const table of tables) {
      try {
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${table}`;
        console.log(`✅ ${table} table exists`);
      } catch (error) {
        console.log(`❌ ${table} table does NOT exist`);
      }
    }

    console.log('\n=== Table Check Complete ===');
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 