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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
const bcrypt = require("bcryptjs");
let AdminService = class AdminService {
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async getAllAdmins() {
        return this.prisma.admin.findMany({
            select: {
                id: true,
                Admin_Username: true,
                Admin_Email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async createAdmin(createAdminDto) {
        const { Admin_Username, Admin_Email, password } = createAdminDto;
        const existingAdmin = await this.prisma.admin.findFirst({
            where: {
                OR: [
                    { Admin_Username: Admin_Username },
                    { Admin_Email: Admin_Email },
                ],
            },
        });
        if (existingAdmin) {
            throw new common_1.ConflictException('Admin with this username or email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const customId = await this.idGenerator.generateAdminId('simple');
        const admin = await this.prisma.admin.create({
            data: {
                id: customId,
                Admin_Username: Admin_Username,
                Admin_Email: Admin_Email,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        return {
            message: 'Admin created successfully!',
            admin: {
                id: admin.id,
                Admin_Username: admin.Admin_Username,
                Admin_Email: admin.Admin_Email,
                role: admin.role,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            },
        };
    }
    async createAdminWithCustomId(createAdminDto, idFormat = 'simple') {
        const { Admin_Username, Admin_Email, password } = createAdminDto;
        const existingAdmin = await this.prisma.admin.findFirst({
            where: {
                OR: [
                    { Admin_Username: Admin_Username },
                    { Admin_Email: Admin_Email },
                ],
            },
        });
        if (existingAdmin) {
            throw new common_1.ConflictException('Admin with this username or email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const customId = await this.idGenerator.generateAdminId(idFormat);
        const admin = await this.prisma.admin.create({
            data: {
                id: customId,
                Admin_Username: Admin_Username,
                Admin_Email: Admin_Email,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        return {
            message: 'Admin created successfully!',
            admin: {
                id: admin.id,
                Admin_Username: admin.Admin_Username,
                Admin_Email: admin.Admin_Email,
                role: admin.role,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            },
        };
    }
    async getIdFormatExamples() {
        const examples = {
            simple: {
                admin: 'ADMIN-1',
                department: 'DEPT-1',
                course: 'COURSE-1',
                position: 'POS-1',
                candidate: 'CAND-1',
                voter: 'VOTER-1',
                election: 'ELEC-1',
                vote: 'VOTE-1',
            },
            padded: {
                admin: 'ADMIN-001',
                department: 'DEPT-001',
                course: 'COURSE-001',
                position: 'POS-001',
                candidate: 'CAND-001',
                voter: 'VOTER-001',
                election: 'ELEC-001',
                vote: 'VOTE-001',
            },
            year: {
                admin: 'ADMIN-2024-1',
                department: 'DEPT-2024-1',
                course: 'COURSE-2024-1',
                position: 'POS-2024-1',
                candidate: 'CAND-2024-1',
                voter: 'VOTER-2024-1',
                election: 'ELEC-2024-1',
                vote: 'VOTE-2024-1',
            },
        };
        return {
            message: 'ID Format Examples',
            formats: examples,
            currentCounts: {
                admin: await this.idGenerator.getModelCount('admin'),
                department: await this.idGenerator.getModelCount('department'),
                course: await this.idGenerator.getModelCount('course'),
                position: await this.idGenerator.getModelCount('position'),
                candidate: await this.idGenerator.getModelCount('candidate'),
                voter: await this.idGenerator.getModelCount('voter'),
                election: await this.idGenerator.getModelCount('election'),
                vote: await this.idGenerator.getModelCount('vote'),
            },
        };
    }
    async getAdminById(id) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
            select: {
                id: true,
                Admin_Username: true,
                Admin_Email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!admin) {
            throw new common_1.NotFoundException('Admin not found');
        }
        return admin;
    }
    async updateAdmin(id, updateAdminDto) {
        const { Admin_Username, Admin_Email, password, role } = updateAdminDto;
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { id },
        });
        if (!existingAdmin) {
            throw new common_1.NotFoundException('Admin not found');
        }
        if (Admin_Username || Admin_Email) {
            const conflictingAdmin = await this.prisma.admin.findFirst({
                where: {
                    OR: [
                        { Admin_Username: Admin_Username || existingAdmin.Admin_Username },
                        { Admin_Email: Admin_Email || existingAdmin.Admin_Email },
                    ],
                    NOT: { id },
                },
            });
            if (conflictingAdmin) {
                throw new common_1.ConflictException('Admin with this username or email already exists');
            }
        }
        const updateData = {};
        if (Admin_Username)
            updateData.Admin_Username = Admin_Username;
        if (Admin_Email)
            updateData.Admin_Email = Admin_Email;
        if (role)
            updateData.role = role;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const admin = await this.prisma.admin.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                Admin_Username: true,
                Admin_Email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return {
            message: 'Admin updated successfully!',
            admin,
        };
    }
    async deleteAdmin(id) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
        });
        if (!admin) {
            throw new common_1.NotFoundException('Admin not found');
        }
        await this.prisma.admin.delete({
            where: { id },
        });
        return {
            message: 'Admin deleted successfully!',
        };
    }
    async getAdminByUsername(username) {
        return this.prisma.admin.findUnique({
            where: { Admin_Username: username },
        });
    }
    async getAdminByEmail(email) {
        return this.prisma.admin.findUnique({
            where: { Admin_Email: email },
        });
    }
    async createSuperAdmin(createAdminDto) {
        const { Admin_Username, Admin_Email, password } = createAdminDto;
        const existingAdmin = await this.prisma.admin.findFirst({
            where: {
                OR: [
                    { Admin_Username: Admin_Username },
                    { Admin_Email: Admin_Email },
                ],
            },
        });
        if (existingAdmin) {
            throw new common_1.ConflictException('Super Admin with this username or email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const customId = await this.idGenerator.generateAdminId('simple');
        const admin = await this.prisma.admin.create({
            data: {
                id: customId,
                Admin_Username: Admin_Username,
                Admin_Email: Admin_Email,
                password: hashedPassword,
                role: 'SUPERADMIN',
            },
        });
        return {
            message: 'Super Admin created successfully!',
            admin: {
                id: admin.id,
                Admin_Username: admin.Admin_Username,
                Admin_Email: admin.Admin_Email,
                role: admin.role,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            },
        };
    }
    async getAdminStats() {
        const totalAdmins = await this.prisma.admin.count();
        const superAdmins = await this.prisma.admin.count({
            where: { role: 'SUPERADMIN' }
        });
        const regularAdmins = await this.prisma.admin.count({
            where: { role: 'ADMIN' }
        });
        const recentAdmins = await this.prisma.admin.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            select: {
                id: true,
                Admin_Username: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        const adminActivity = await this.prisma.admin.findMany({
            select: {
                id: true,
                Admin_Username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        elections: true,
                        departments: true,
                        courses: true,
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        return {
            overview: {
                totalAdmins,
                superAdmins,
                regularAdmins,
                superAdminPercentage: totalAdmins > 0 ? (superAdmins / totalAdmins * 100).toFixed(2) : '0',
                regularAdminPercentage: totalAdmins > 0 ? (regularAdmins / totalAdmins * 100).toFixed(2) : '0',
            },
            recentActivity: {
                newAdmins: recentAdmins.length,
                recentAdmins,
            },
            adminActivity,
        };
    }
    async getAdminLoginLogs(page = 1, limit = 50, adminId) {
        const skip = (page - 1) * limit;
        const whereClause = adminId ? { adminId } : {};
        const [loginLogs, total] = await Promise.all([
            this.prisma.adminLoginLog.findMany({
                where: whereClause,
                include: {
                    admin: {
                        select: {
                            id: true,
                            Admin_Username: true,
                            Admin_Email: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    loginTime: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.adminLoginLog.count({
                where: whereClause,
            }),
        ]);
        return {
            loginLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAdminLoginStats() {
        const totalLogins = await this.prisma.adminLoginLog.count();
        const activeSessions = await this.prisma.adminLoginLog.count({
            where: { isActive: true },
        });
        const todayLogins = await this.prisma.adminLoginLog.count({
            where: {
                loginTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        });
        const avgSessionDuration = await this.prisma.adminLoginLog.aggregate({
            where: {
                duration: { not: null },
            },
            _avg: {
                duration: true,
            },
        });
        const recentLogins = await this.prisma.adminLoginLog.findMany({
            take: 10,
            include: {
                admin: {
                    select: {
                        Admin_Username: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                loginTime: 'desc',
            },
        });
        return {
            totalLogins,
            activeSessions,
            todayLogins,
            avgSessionDuration: avgSessionDuration._avg.duration ? Math.round(avgSessionDuration._avg.duration / 60) : 0,
            recentLogins,
        };
    }
    async getAdminLoginLogById(id) {
        return this.prisma.adminLoginLog.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                        role: true,
                    },
                },
            },
        });
    }
    async getUserLoginLogs(page = 1, limit = 50, searchTerm, department, course) {
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (searchTerm) {
            whereClause.user = {
                OR: [
                    { Voter_Name: { contains: searchTerm, mode: 'insensitive' } },
                    { Voter_StudentId: { contains: searchTerm, mode: 'insensitive' } },
                    { Voter_Email: { contains: searchTerm, mode: 'insensitive' } }
                ]
            };
        }
        if (department) {
            whereClause.user = {
                ...whereClause.user,
                department: {
                    Department_Name: department
                }
            };
        }
        if (course) {
            whereClause.user = {
                ...whereClause.user,
                course: {
                    Course_Name: course
                }
            };
        }
        const [loginLogs, total] = await Promise.all([
            this.prisma.userLoginLog.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            Voter_Name: true,
                            Voter_Email: true,
                            Voter_StudentId: true,
                            department: {
                                select: {
                                    Department_Name: true,
                                },
                            },
                            course: {
                                select: {
                                    Course_Name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    loginTime: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.userLoginLog.count({
                where: whereClause,
            }),
        ]);
        return {
            loginLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserLoginStats() {
        const totalLogins = await this.prisma.userLoginLog.count();
        const activeSessions = await this.prisma.userLoginLog.count({
            where: { isActive: true },
        });
        const todayLogins = await this.prisma.userLoginLog.count({
            where: {
                loginTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        });
        const avgSessionDuration = await this.prisma.userLoginLog.aggregate({
            where: {
                duration: { not: null },
            },
            _avg: {
                duration: true,
            },
        });
        const recentLogins = await this.prisma.userLoginLog.findMany({
            take: 10,
            include: {
                user: {
                    select: {
                        Voter_Name: true,
                        Voter_StudentId: true,
                        department: {
                            select: {
                                Department_Name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                loginTime: 'desc',
            },
        });
        return {
            totalLogins,
            activeSessions,
            todayLogins,
            avgSessionDuration: avgSessionDuration._avg.duration ? Math.round(avgSessionDuration._avg.duration / 60) : 0,
            recentLogins,
        };
    }
    async getUserLoginLogById(id) {
        return this.prisma.userLoginLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_Email: true,
                        Voter_StudentId: true,
                        department: {
                            select: {
                                Department_Name: true,
                            },
                        },
                        course: {
                            select: {
                                Course_Name: true,
                            },
                        },
                    },
                },
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], AdminService);
//# sourceMappingURL=admin.service.js.map