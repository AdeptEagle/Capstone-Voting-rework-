import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    console.log('Existing admins:', admins);
    
    if (admins.length > 0) {
      console.log('Using first admin ID:', admins[0].id);
    }
  } catch (error) {
    console.error('Error checking admins:', error);
  }
}

checkAdmins()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 