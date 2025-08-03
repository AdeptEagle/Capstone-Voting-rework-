import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTables() {
  try {
    console.log('=== Listing All Tables in Database ===\n');

    // Query to list all tables
    const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('Tables found:');
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`);
    });

    console.log('\n=== Table List Complete ===');
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

listTables()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 