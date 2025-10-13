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
exports.PositionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const position_service_1 = require("./position.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PositionController = class PositionController {
    constructor(positionService) {
        this.positionService = positionService;
    }
    async getAllPositions(req) {
        console.log(`[PositionController] getAllPositions called`);
        console.log(`[PositionController] User:`, req.user);
        console.log(`[PositionController] User role:`, req.user?.role);
        const showAll = false;
        console.log(`[PositionController] showAll parameter: ${showAll} (always false for main list)`);
        return this.positionService.getAllPositions(showAll);
    }
    async createPosition(createPositionDto) {
        return this.positionService.createPosition(createPositionDto);
    }
    async getPositionById(id) {
        return this.positionService.getPositionById(id);
    }
    async updatePosition(id, updatePositionDto) {
        return this.positionService.updatePosition(id, updatePositionDto);
    }
    async deletePosition(id) {
        console.log(`[PositionController] deletePosition called with ID: "${id}"`);
        console.log(`[PositionController] ID type: ${typeof id}`);
        console.log(`[PositionController] ID length: ${id?.length}`);
        console.log(`[PositionController] ID trimmed: "${id?.trim()}"`);
        console.log(`[PositionController] ID trimmed length: ${id?.trim()?.length}`);
        const trimmedId = id?.trim();
        console.log(`[PositionController] Using trimmed ID: "${trimmedId}"`);
        return this.positionService.deletePosition(trimmedId);
    }
};
exports.PositionController = PositionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all positions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all positions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "getAllPositions", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new position' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Position created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePositionDto]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "createPosition", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get position by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "getPositionById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update position' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePositionDto]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "updatePosition", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete position' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "deletePosition", null);
exports.PositionController = PositionController = __decorate([
    (0, swagger_1.ApiTags)('Position'),
    (0, common_1.Controller)('positions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [position_service_1.PositionService])
], PositionController);
//# sourceMappingURL=position.controller.js.map