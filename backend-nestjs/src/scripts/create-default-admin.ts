import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: 'ADMIN-1' },
    });

    if (existingAdmin) {
      console.log('✅ Default admin already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create default admin
    const admin = await prisma.admin.create({
      data: {
        id: 'ADMIN-1',
        username: 'admin',
        email: 'admin@votingsystem.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Default admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('ID: ADMIN-1');
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAdmin(); 