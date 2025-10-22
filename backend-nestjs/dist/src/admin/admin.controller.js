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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getAllAdmins(req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.getAllAdmins();
    }
    async createAdmin(createAdminDto, req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.createAdmin(createAdminDto);
    }
    async createSuperAdmin(createAdminDto, req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.createSuperAdmin(createAdminDto);
    }
    async createAdminWithCustomId(createAdminDto, format = 'simple', req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.createAdminWithCustomId(createAdminDto, format);
    }
    async getIdFormatExamples(req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.getIdFormatExamples();
    }
    async getMyProfile(req) {
        return this.adminService.getAdminById(req.user.sub);
    }
    async updateMyProfile(updateAdminDto, req) {
        return this.adminService.updateAdmin(req.user.sub, updateAdminDto);
    }
    async getAdminStats(req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.getAdminStats();
    }
    async getAdminLoginLogs(req, page = '1', limit = '50', adminId) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.getAdminLoginLogs(parseInt(page), parseInt(limit), adminId);
    }
    async getAdminLoginStats(req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.getAdminLoginStats();
    }
    async getAdminLoginLogById(id, req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.getAdminLoginLogById(id);
    }
    async getUserLoginLogs(req, page = '1', limit = '50', search, department, course) {
        if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Access denied - Admin or Super Admin required');
        }
        return this.adminService.getUserLoginLogs(parseInt(page), parseInt(limit), search, department, course);
    }
    async getUserLoginStats(req) {
        if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Access denied - Admin or Super Admin required');
        }
        return this.adminService.getUserLoginStats();
    }
    async getUserLoginLogById(id, req) {
        if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Access denied - Admin or Super Admin required');
        }
        return this.adminService.getUserLoginLogById(id);
    }
    async getAdminById(id, req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.getAdminById(id);
    }
    async updateAdmin(id, updateAdminDto, req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.updateAdmin(id, updateAdminDto);
    }
    async deleteAdmin(id, req) {
        if (req.user.role !== 'SUPERADMIN') {
            throw new common_1.ForbiddenException('Access denied - Super Admin required');
        }
        return this.adminService.deleteAdmin(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all admins (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all admins' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllAdmins", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new admin (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Admin created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Admin already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('super-admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Super Admin (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Super Admin created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Super Admin already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSuperAdmin", null);
__decorate([
    (0, common_1.Post)('custom-id'),
    (0, swagger_1.ApiOperation)({ summary: 'Create admin with custom ID format (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Admin created with custom ID format' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Admin already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAdminDto, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdminWithCustomId", null);
__decorate([
    (0, common_1.Get)('id-formats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ID format examples and current counts (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'ID format examples retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getIdFormatExamples", null);
__decorate([
    (0, common_1.Get)('profile/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current admin profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin profile retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Put)('profile/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current admin profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admin not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin statistics (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin statistics retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Get)('login-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin login logs (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin login logs retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('adminId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminLoginLogs", null);
__decorate([
    (0, common_1.Get)('login-logs/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin login statistics (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin login statistics retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminLoginStats", null);
__decorate([
    (0, common_1.Get)('login-logs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific admin login log (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin login log retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Login log not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminLoginLogById", null);
__decorate([
    (0, common_1.Get)('user-login-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user login logs (Admin and Super Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User login logs retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Admin or Super Admin required' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('department')),
    __param(5, (0, common_1.Query)('course')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserLoginLogs", null);
__decorate([
    (0, common_1.Get)('user-login-logs/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user login statistics (Admin and Super Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User login statistics retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Admin or Super Admin required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserLoginStats", null);
__decorate([
    (0, common_1.Get)('user-login-logs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific user login log (Admin and Super Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User login log retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Login log not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Admin or Super Admin required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserLoginLogById", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin by ID (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admin not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update admin (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admin not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete admin (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Admin not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - Super Admin required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteAdmin", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admins'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map