import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating default Super Admin account...');

    // Check if Super Admin already exists
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: { role: 'SUPERADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists:', existingSuperAdmin.username);
      return;
    }

    // Create Super Admin
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const superAdmin = await prisma.admin.create({
      data: {
        id: 'SUPER-001',
        username: 'superadmin',
        email: 'superadmin@votingsystem.com',
        password: hashedPassword,
        role: 'SUPERADMIN',
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Username: superadmin');
    console.log('   Password: superadmin123');
    console.log('   Email: superadmin@votingsystem.com');
    console.log('   Role: SUPERADMIN');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin(); 