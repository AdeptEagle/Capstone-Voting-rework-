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
exports.PartyListController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const party_list_service_1 = require("./party-list.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let PartyListController = class PartyListController {
    constructor(partyListService) {
        this.partyListService = partyListService;
    }
    create(createPartyListDto, logo) {
        return this.partyListService.create(createPartyListDto, logo);
    }
    findAll() {
        return this.partyListService.findAll();
    }
    getStatistics() {
        return this.partyListService.getStatistics();
    }
    findOne(id) {
        return this.partyListService.findOne(id);
    }
    update(id, updatePartyListDto, logo) {
        return this.partyListService.update(id, updatePartyListDto, logo);
    }
    remove(id) {
        return this.partyListService.remove(id);
    }
};
exports.PartyListController = PartyListController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new party list' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Party list created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Party list with this name already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePartyListDto, Object]),
    __metadata("design:returntype", void 0)
], PartyListController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all party lists' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all party lists' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PartyListController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get party list statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Party list statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PartyListController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a party list by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Party list details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Party list not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartyListController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    (0, swagger_1.ApiOperation)({ summary: 'Update a party list' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Party list updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Party list not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Party list with this name already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePartyListDto, Object]),
    __metadata("design:returntype", void 0)
], PartyListController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a party list' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Party list deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Party list not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete party list with candidates' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartyListController.prototype, "remove", null);
exports.PartyListController = PartyListController = __decorate([
    (0, swagger_1.ApiTags)('Party List'),
    (0, common_1.Controller)('party-lists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [party_list_service_1.PartyListService])
], PartyListController);
//# sourceMappingURL=party-list.controller.js.map