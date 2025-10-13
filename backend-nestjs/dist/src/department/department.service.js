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
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
let DepartmentService = class DepartmentService {
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async getAllDepartments() {
        return this.prisma.department.findMany({
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
                _count: {
                    select: {
                        courses: true,
                        voters: true,
                        candidates: true,
                    },
                },
            },
        });
    }
    async createDepartment(createDepartmentDto, adminId) {
        const { Department_Name, Department_Description, customId } = createDepartmentDto;
        const existingDepartment = await this.prisma.department.findFirst({
            where: { Department_Name: Department_Name },
        });
        if (existingDepartment) {
            throw new common_1.ConflictException('Department with this name already exists');
        }
        if (customId) {
            const existingCustomId = await this.prisma.department.findUnique({
                where: { id: customId },
            });
            if (existingCustomId) {
                throw new common_1.ConflictException(`Department with ID '${customId}' already exists`);
            }
        }
        const departmentId = customId || await this.idGenerator.generateDepartmentId();
        const department = await this.prisma.department.create({
            data: {
                id: departmentId,
                Department_Name: Department_Name,
                Department_Description: Department_Description,
                createdBy: adminId,
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
        return {
            message: 'Department created successfully!',
            department,
        };
    }
    async getDepartmentById(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
                _count: {
                    select: {
                        courses: true,
                        voters: true,
                        candidates: true,
                    },
                },
            },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        return department;
    }
    async updateDepartment(id, updateDepartmentDto) {
        const { Department_Name, Department_Description } = updateDepartmentDto;
        const existingDepartment = await this.prisma.department.findUnique({
            where: { id },
        });
        if (!existingDepartment) {
            throw new common_1.NotFoundException('Department not found');
        }
        if (Department_Name && Department_Name !== existingDepartment.Department_Name) {
            const conflictingDepartment = await this.prisma.department.findFirst({
                where: {
                    Department_Name: Department_Name,
                    NOT: { id },
                },
            });
            if (conflictingDepartment) {
                throw new common_1.ConflictException('Department with this name already exists');
            }
        }
        const department = await this.prisma.department.update({
            where: { id },
            data: {
                Department_Name: Department_Name,
                Department_Description: Department_Description,
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
        return {
            message: 'Department updated successfully!',
            department,
        };
    }
    async deleteDepartment(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        courses: true,
                        voters: true,
                        candidates: true,
                    },
                },
            },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        if (department.isDeleted) {
            throw new common_1.NotFoundException('Department has already been deleted');
        }
        await this.prisma.department.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        return {
            message: 'Department moved to trash successfully!',
        };
    }
    async getDepartmentCourses(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        return this.prisma.course.findMany({
            where: { departmentId: id },
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
                _count: {
                    select: {
                        voters: true,
                        candidates: true,
                    },
                },
            },
        });
    }
    async getDepartmentVoters(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        return this.prisma.voter.findMany({
            where: { departmentId: id },
            select: {
                id: true,
                Voter_Name: true,
                Voter_Email: true,
                Voter_StudentId: true,
                hasVoted: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async getDepartmentCandidates(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        return this.prisma.candidate.findMany({
            where: { departmentId: id },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
            },
        });
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], DepartmentService);
//# sourceMappingURL=department.service.js.map