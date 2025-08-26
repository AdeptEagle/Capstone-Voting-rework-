import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    console.log('=== Creating Default Admin with Custom ID ===\n');

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: { Admin_Username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Default admin already exists:', existingAdmin);
      return existingAdmin;
    }

    // Create default admin with custom ID
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.admin.create({
      data: {
        id: 'ADMIN-1',
        Admin_Username: 'admin',
        Admin_Email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Default admin created with custom ID:', admin);
    return admin;
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    throw error;
  }
}

createDefaultAdmin()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 