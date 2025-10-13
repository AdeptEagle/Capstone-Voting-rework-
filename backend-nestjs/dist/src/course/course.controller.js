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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const course_service_1 = require("./course.service");
const dto_1 = require("./dto");
const prisma_service_1 = require("../prisma/prisma.service");
let CourseController = class CourseController {
    constructor(courseService, prisma) {
        this.courseService = courseService;
        this.prisma = prisma;
    }
    async getAllCourses() {
        return this.courseService.getAllCourses();
    }
    async createCourse(createCourseDto, req) {
        try {
            const superadmin = await this.prisma.admin.findFirst({
                where: { role: 'SUPERADMIN' },
                select: { id: true, Admin_Username: true, role: true }
            });
            if (!superadmin) {
                throw new common_1.HttpException('No superadmin found in the system. Please create a superadmin first.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(`🔧 [CourseController] Using superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
            return this.courseService.createCourse(createCourseDto, superadmin.id);
        }
        catch (error) {
            console.error('❌ [CourseController] Error creating course:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create course. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCourseById(id) {
        return this.courseService.getCourseById(id);
    }
    async updateCourse(id, updateCourseDto) {
        try {
            const superadmin = await this.prisma.admin.findFirst({
                where: { role: 'SUPERADMIN' },
                select: { id: true, Admin_Username: true, role: true }
            });
            if (!superadmin) {
                throw new common_1.HttpException('No superadmin found in the system. Please create a superadmin first.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(`🔧 [CourseController] Updating course with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
            return this.courseService.updateCourse(id, updateCourseDto);
        }
        catch (error) {
            console.error('❌ [CourseController] Error updating course:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to update course. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteCourse(id) {
        try {
            const superadmin = await this.prisma.admin.findFirst({
                where: { role: 'SUPERADMIN' },
                select: { id: true, Admin_Username: true, role: true }
            });
            if (!superadmin) {
                throw new common_1.HttpException('No superadmin found in the system. Please create a superadmin first.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(`🔧 [CourseController] Deleting course with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
            return this.courseService.deleteCourse(id);
        }
        catch (error) {
            console.error('❌ [CourseController] Error deleting course:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to delete course. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCoursesByDepartment(departmentId) {
        return this.courseService.getCoursesByDepartment(departmentId);
    }
    async getCourseVoters(id) {
        return this.courseService.getCourseVoters(id);
    }
    async getCourseCandidates(id) {
        return this.courseService.getCourseCandidates(id);
    }
};
exports.CourseController = CourseController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all courses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all courses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getAllCourses", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new course' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Course created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getCourseById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCourseDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)('department/:departmentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get courses by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Courses found' }),
    __param(0, (0, common_1.Param)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getCoursesByDepartment", null);
__decorate([
    (0, common_1.Get)(':id/voters'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voters in a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voters found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getCourseVoters", null);
__decorate([
    (0, common_1.Get)(':id/candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get candidates in a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidates found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getCourseCandidates", null);
exports.CourseController = CourseController = __decorate([
    (0, swagger_1.ApiTags)('Course'),
    (0, common_1.Controller)('courses'),
    __metadata("design:paramtypes", [course_service_1.CourseService,
        prisma_service_1.PrismaService])
], CourseController);
//# sourceMappingURL=course.controller.js.map