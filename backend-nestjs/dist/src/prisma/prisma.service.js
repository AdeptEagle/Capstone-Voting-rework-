"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    async onModuleInit() {
        try {
            console.log('🔄 Initializing database...');
            if (process.env.NODE_ENV !== 'production') {
                await this.initializeDatabase();
            }
            await this.$connect();
            console.log('✅ Database connected successfully');
            await this.createDefaultSuperAdmin();
        }
        catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            throw error;
        }
    }
    async initializeDatabase() {
        try {
            console.log('🔧 Setting up database schema...');
            const migrationsPath = (0, path_1.join)(process.cwd(), 'prisma', 'migrations');
            if (!(0, fs_1.existsSync)(migrationsPath)) {
                console.log('⚠️  No migrations found, creating initial migration...');
                this.runPrismaCommand('migrate dev --name init');
            }
            else {
                console.log('📦 Running existing migrations...');
                this.runPrismaCommand('migrate deploy');
            }
            console.log('✅ Database schema setup completed');
        }
        catch (error) {
            console.error('❌ Database schema setup failed:', error.message);
            try {
                console.log('🔄 Attempting schema push as fallback...');
                this.runPrismaCommand('db push --accept-data-loss');
                console.log('✅ Schema push completed');
            }
            catch (pushError) {
                console.error('❌ Schema push also failed:', pushError.message);
                throw pushError;
            }
        }
    }
    runPrismaCommand(command) {
        try {
            const result = (0, child_process_1.execSync)(`npx prisma ${command}`, {
                cwd: process.cwd(),
                stdio: 'pipe',
                encoding: 'utf8',
            });
            console.log(result);
        }
        catch (error) {
            console.error(`❌ Prisma command failed: ${command}`);
            console.error(error.message);
            throw error;
        }
    }
    async createDefaultSuperAdmin() {
        try {
            const existingSuperAdmin = await this.admin.findFirst({
                where: {
                    OR: [
                        { Admin_Username: 'superadmin' },
                        { Admin_Email: 'superadmin@votingsystem.com' },
                    ],
                },
            });
            if (!existingSuperAdmin) {
                const hashedPassword = await bcrypt.hash('superadmin123', 10);
                await this.admin.create({
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
                console.log('⚠️  Please change the password after first login!');
            }
            else {
                console.log('✅ Default Super Admin already exists');
            }
        }
        catch (error) {
            console.error('❌ Error creating default super admin:', error.message);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        console.log('🔌 Database disconnected');
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'test') {
            const tablenames = await this.$queryRaw `SELECT tablename FROM pg_tables WHERE schemaname='public'`;
            const tables = tablenames
                .map(({ tablename }) => tablename)
                .filter((name) => name !== '_prisma_migrations')
                .map((name) => `"public"."${name}"`)
                .join(', ');
            try {
                await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
            }
            catch (error) {
                console.log({ error });
            }
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map