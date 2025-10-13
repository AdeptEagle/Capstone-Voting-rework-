"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function createCustomSuperAdmin() {
    try {
        console.log('🔧 Creating custom Super Admin with ID: DEV_SP...');
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
        const hashedPassword = await bcrypt.hash('devsp123', 10);
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
    }
    catch (error) {
        console.error('❌ Error creating custom super admin:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createCustomSuperAdmin();
//# sourceMappingURL=create-custom-superadmin.js.map