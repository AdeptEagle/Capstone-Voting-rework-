"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function createDefaultSuperAdmin() {
    try {
        console.log('🔧 Creating default Super Admin...\n');
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
    }
    catch (error) {
        console.error('❌ Error creating default super admin:', error.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
createDefaultSuperAdmin();
//# sourceMappingURL=create-default-superadmin.js.map