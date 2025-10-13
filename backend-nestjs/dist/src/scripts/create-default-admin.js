"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function createDefaultAdmin() {
    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: { id: 'ADMIN-1' },
        });
        if (existingAdmin) {
            console.log('✅ Default admin already exists');
            return;
        }
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.admin.create({
            data: {
                id: 'ADMIN-1',
                Admin_Username: 'admin',
                Admin_Email: 'admin@votingsystem.com',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log('✅ Default admin created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('ID: ADMIN-1');
    }
    catch (error) {
        console.error('❌ Error creating default admin:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createDefaultAdmin();
//# sourceMappingURL=create-default-admin.js.map