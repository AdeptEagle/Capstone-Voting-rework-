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
exports.DepartmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const department_service_1 = require("./department.service");
const dto_1 = require("./dto");
const prisma_service_1 = require("../prisma/prisma.service");
let DepartmentController = class DepartmentController {
    constructor(departmentService, prisma) {
        this.departmentService = departmentService;
        this.prisma = prisma;
    }
    async getAllDepartments() {
        return this.departmentService.getAllDepartments();
    }
    async createDepartment(createDepartmentDto, req) {
        try {
            const superadmin = await this.prisma.admin.findFirst({
                where: { role: 'SUPERADMIN' },
                select: { id: true, Admin_Username: true, role: true }
            });
            if (!superadmin) {
                throw new common_1.HttpException('No superadmin found in the system. Please create a superadmin first.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(`🔧 [DepartmentController] Using superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
            return this.departmentService.createDepartment(createDepartmentDto, superadmin.id);
        }
        catch (error) {
            console.error('❌ [DepartmentController] Error creating department:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create department. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDepartmentById(id) {
        return this.departmentService.getDepartmentById(id);
    }
    async updateDepartment(id, updateDepartmentDto) {
        try {
            const superadmin = await this.prisma.admin.findFirst({
                where: { role: 'SUPERADMIN' },
                select: { id: true, Admin_Username: true, role: true }
            });
            if (!superadmin) {
                throw new common_1.HttpException('No superadmin found in the system. Please create a superadmin first.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(`🔧 [DepartmentController] Updating department with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
            return this.departmentService.updateDepartment(id, updateDepartmentDto);
        }
        catch (error) {
            console.error('❌ [DepartmentController] Error updating department:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to update department. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteDepartment(id) {
        try {
            const superadmin = await this.prisma.admin.findFirst({
                where: { role: 'SUPERADMIN' },
                select: { id: true, Admin_Username: true, role: true }
            });
            if (!superadmin) {
                throw new common_1.HttpException('No superadmin found in the system. Please create a superadmin first.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(`🔧 [DepartmentController] Deleting department with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
            return this.departmentService.deleteDepartment(id);
        }
        catch (error) {
            console.error('❌ [DepartmentController] Error deleting department:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to delete department. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDepartmentCourses(id) {
        return this.departmentService.getDepartmentCourses(id);
    }
    async getDepartmentVoters(id) {
        return this.departmentService.getDepartmentVoters(id);
    }
    async getDepartmentCandidates(id) {
        return this.departmentService.getDepartmentCandidates(id);
    }
};
exports.DepartmentController = DepartmentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all departments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all departments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "getAllDepartments", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new department' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Department created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateDepartmentDto, Object]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get department by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "getDepartmentById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "updateDepartment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "deleteDepartment", null);
__decorate([
    (0, common_1.Get)(':id/courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get courses in a department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Courses found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "getDepartmentCourses", null);
__decorate([
    (0, common_1.Get)(':id/voters'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voters in a department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voters found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "getDepartmentVoters", null);
__decorate([
    (0, common_1.Get)(':id/candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get candidates in a department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidates found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "getDepartmentCandidates", null);
exports.DepartmentController = DepartmentController = __decorate([
    (0, swagger_1.ApiTags)('Department'),
    (0, common_1.Controller)('departments'),
    __metadata("design:paramtypes", [department_service_1.DepartmentService,
        prisma_service_1.PrismaService])
], DepartmentController);
//# sourceMappingURL=department.controller.js.map