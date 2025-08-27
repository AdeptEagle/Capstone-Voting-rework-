import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultSuperAdmin() {
  try {
    console.log('🔧 Creating default Super Admin...\n');

    // Check if default superadmin already exists
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { Admin_Username: 'superadmin' },
          { Admin_Email: 'superadmin@votingsystem.com' },
        ],
      },
    });

    if (existingSuperAdmin) {
      console.log('✅ Default Super Admin already exists');
      console.log('👤 Username:', existingSuperAdmin.Admin_Username);
      console.log('📧 Email:', existingSuperAdmin.Admin_Email);
      console.log('🔑 Role:', existingSuperAdmin.role);
      return;
    }

    // Create default superadmin
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    
    const superAdmin = await prisma.admin.create({
      data: {
        id: 'SUPERADMIN-1',
        Admin_Username: 'superadmin',
        Admin_Email: 'superadmin@votingsystem.com',
        password: hashedPassword,
        role: 'SUPERADMIN',
      },
    });

    console.log('✅ Default Super Admin created successfully!');
    console.log('👤 Username: superadmin');
    console.log('🔐 Password: superadmin123');
    console.log('📧 Email: superadmin@votingsystem.com');
    console.log('🔑 Role: SUPERADMIN');
    console.log('🆔 ID:', superAdmin.id);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating default super admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDefaultSuperAdmin(); 