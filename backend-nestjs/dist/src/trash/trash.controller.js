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
exports.TrashController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trash_service_1 = require("./trash.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let TrashController = class TrashController {
    constructor(trashService) {
        this.trashService = trashService;
    }
    async getTrashSummary() {
        return await this.trashService.getTrashSummary();
    }
    async getDeletedCandidates() {
        return await this.trashService.getDeletedCandidates();
    }
    async getDeletedPositions() {
        return await this.trashService.getDeletedPositions();
    }
    async getDeletedDepartments() {
        return await this.trashService.getDeletedDepartments();
    }
    async getDeletedCourses() {
        return await this.trashService.getDeletedCourses();
    }
    async getDeletedVoters() {
        return await this.trashService.getDeletedVoters();
    }
    async getDeletedElections() {
        return [];
    }
    async restoreCandidate(id) {
        return await this.trashService.restoreCandidate(id);
    }
    async restorePosition(id) {
        return await this.trashService.restorePosition(id);
    }
    async restoreDepartment(id) {
        return await this.trashService.restoreDepartment(id);
    }
    async restoreCourse(id) {
        return await this.trashService.restoreCourse(id);
    }
    async restoreVoter(id) {
        return await this.trashService.restoreVoter(id);
    }
    async restoreElection(id) {
        return { message: 'Elections no longer exist' };
    }
    async bulkRestore(body) {
        return { message: 'Bulk restore not implemented yet' };
    }
    async permanentlyDeleteCandidate(id) {
        return await this.trashService.permanentlyDeleteCandidate(id);
    }
    async permanentlyDeletePosition(id) {
        return await this.trashService.permanentlyDeletePosition(id);
    }
    async permanentlyDeleteDepartment(id) {
        return await this.trashService.permanentlyDeleteDepartment(id);
    }
    async permanentlyDeleteCourse(id) {
        return await this.trashService.permanentlyDeleteCourse(id);
    }
    async permanentlyDeleteVoter(id) {
        return await this.trashService.permanentlyDeleteVoter(id);
    }
    async permanentlyDeleteElection(id) {
        return { message: 'Elections no longer exist' };
    }
    async emptyTrash() {
        return await this.trashService.emptyTrash();
    }
};
exports.TrashController = TrashController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get summary of all deleted items' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trash summary retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getTrashSummary", null);
__decorate([
    (0, common_1.Get)('candidates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted candidates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deleted candidates retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getDeletedCandidates", null);
__decorate([
    (0, common_1.Get)('positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted positions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deleted positions retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getDeletedPositions", null);
__decorate([
    (0, common_1.Get)('departments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted departments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deleted departments retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getDeletedDepartments", null);
__decorate([
    (0, common_1.Get)('courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted courses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deleted courses retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getDeletedCourses", null);
__decorate([
    (0, common_1.Get)('voters'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted voters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deleted voters retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getDeletedVoters", null);
__decorate([
    (0, common_1.Get)('elections'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted elections (deprecated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of deleted elections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getDeletedElections", null);
__decorate([
    (0, common_1.Post)('restore/candidate/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a deleted candidate' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted candidate not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreCandidate", null);
__decorate([
    (0, common_1.Post)('restore/position/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a deleted position' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted position not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restorePosition", null);
__decorate([
    (0, common_1.Post)('restore/department/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a deleted department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreDepartment", null);
__decorate([
    (0, common_1.Post)('restore/course/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a deleted course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreCourse", null);
__decorate([
    (0, common_1.Post)('restore/voter/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a deleted voter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted voter not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreVoter", null);
__decorate([
    (0, common_1.Post)('restore/election/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted election (deprecated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreElection", null);
__decorate([
    (0, common_1.Post)('restore/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk restore deleted items' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Items restored successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "bulkRestore", null);
__decorate([
    (0, common_1.Delete)('permanent/candidate/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a candidate (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot delete candidate with dependencies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted candidate not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentlyDeleteCandidate", null);
__decorate([
    (0, common_1.Delete)('permanent/position/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a position (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot delete position with dependencies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted position not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentlyDeletePosition", null);
__decorate([
    (0, common_1.Delete)('permanent/department/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a department (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot delete department with dependencies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted department not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentlyDeleteDepartment", null);
__decorate([
    (0, common_1.Delete)('permanent/course/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a course (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot delete course with dependencies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted course not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentlyDeleteCourse", null);
__decorate([
    (0, common_1.Delete)('permanent/voter/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a voter (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voter permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot delete voter with dependencies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Deleted voter not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentlyDeleteVoter", null);
__decorate([
    (0, common_1.Delete)('permanent/election/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete election (cannot be undone)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Election permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Election not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete election with voting history' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentlyDeleteElection", null);
__decorate([
    (0, common_1.Delete)('empty'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Empty trash - permanently delete all soft-deleted items (SuperAdmin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trash emptied successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "emptyTrash", null);
exports.TrashController = TrashController = __decorate([
    (0, swagger_1.ApiTags)('Trash Management'),
    (0, common_1.Controller)('trash'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [trash_service_1.TrashService])
], TrashController);
//# sourceMappingURL=trash.controller.js.map