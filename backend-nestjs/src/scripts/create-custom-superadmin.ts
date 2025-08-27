import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createCustomSuperAdmin() {
  try {
    console.log('🔧 Creating custom Super Admin with ID: DEV_SP...');

    // Check if DEV_SP already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: 'DEV_SP' }
    });

    if (existingAdmin) {
      console.log('✅ Custom Super Admin with ID DEV_SP already exists');
      console.log(`👤 Username: ${existingAdmin.Admin_Username}`);
      console.log(`📧 Email: ${existingAdmin.Admin_Email}`);
      console.log(`🔑 Role: ${existingAdmin.role}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('devsp123', 10);

    // Create new superadmin with custom ID
    const newSuperAdmin = await prisma.admin.create({
      data: {
        id: 'DEV_SP',
        Admin_Username: 'devsp_admin',
        Admin_Email: 'devsp@votingsys.com',
        password: hashedPassword,
        role: 'SUPERADMIN'
      }
    });

    console.log('✅ Custom Super Admin created successfully!');
    console.log(`🆔 ID: ${newSuperAdmin.id}`);
    console.log(`👤 Username: ${newSuperAdmin.Admin_Username}`);
    console.log(`📧 Email: ${newSuperAdmin.Admin_Email}`);
    console.log(`🔑 Role: ${newSuperAdmin.role}`);
    console.log(`🔐 Password: devsp123`);

  } catch (error) {
    console.error('❌ Error creating custom super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCustomSuperAdmin();
