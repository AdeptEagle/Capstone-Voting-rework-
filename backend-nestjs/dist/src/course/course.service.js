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
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
let CourseService = class CourseService {
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async getAllCourses() {
        return this.prisma.course.findMany({
            where: {
                isDeleted: false,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
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
    async createCourse(createCourseDto, adminId) {
        const { Course_Name, Course_Code, Course_Description, departmentId, customId } = createCourseDto;
        const department = await this.prisma.department.findUnique({
            where: { id: departmentId },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        const existingCourse = await this.prisma.course.findFirst({
            where: { Course_Code: Course_Code },
        });
        if (existingCourse) {
            throw new common_1.ConflictException('Course with this code already exists');
        }
        if (customId) {
            const existingCustomId = await this.prisma.course.findUnique({
                where: { id: customId },
            });
            if (existingCustomId) {
                throw new common_1.ConflictException(`Course with ID '${customId}' already exists`);
            }
        }
        const courseId = customId || await this.idGenerator.generateCourseId();
        const course = await this.prisma.course.create({
            data: {
                id: courseId,
                Course_Name: Course_Name,
                Course_Code: Course_Code,
                Course_Description: Course_Description,
                departmentId,
                createdBy: adminId,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
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
            message: 'Course created successfully!',
            course,
        };
    }
    async getCourseById(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
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
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        return course;
    }
    async updateCourse(id, updateCourseDto) {
        const { Course_Name, Course_Code, Course_Description, departmentId } = updateCourseDto;
        const existingCourse = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!existingCourse) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (departmentId) {
            const department = await this.prisma.department.findUnique({
                where: { id: departmentId },
            });
            if (!department) {
                throw new common_1.NotFoundException('Department not found');
            }
        }
        if (Course_Code && Course_Code !== existingCourse.Course_Code) {
            const conflictingCourse = await this.prisma.course.findFirst({
                where: {
                    Course_Code: Course_Code,
                    NOT: { id },
                },
            });
            if (conflictingCourse) {
                throw new common_1.ConflictException('Course with this code already exists');
            }
        }
        const course = await this.prisma.course.update({
            where: { id },
            data: {
                Course_Name: Course_Name,
                Course_Code: Course_Code,
                Course_Description: Course_Description,
                departmentId,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
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
            message: 'Course updated successfully!',
            course,
        };
    }
    async deleteCourse(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        voters: true,
                        candidates: true,
                    },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.isDeleted) {
            throw new common_1.NotFoundException('Course has already been deleted');
        }
        await this.prisma.course.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        return {
            message: 'Course moved to trash successfully!',
        };
    }
    async getCoursesByDepartment(departmentId) {
        const department = await this.prisma.department.findUnique({
            where: { id: departmentId },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        return this.prisma.course.findMany({
            where: {
                departmentId,
                isDeleted: false,
            },
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
    async getCourseVoters(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        return this.prisma.voter.findMany({
            where: { courseId: id },
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
    async getCourseCandidates(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        return this.prisma.candidate.findMany({
            where: {
                courseId: id,
                isDeleted: false,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
            },
        });
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], CourseService);
//# sourceMappingURL=course.service.js.map