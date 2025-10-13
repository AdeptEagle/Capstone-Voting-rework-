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
exports.BallotTemplateController = void 0;
const common_1 = require("@nestjs/common");
const ballot_template_service_1 = require("./ballot-template.service");
const create_ballot_template_dto_1 = require("./dto/create-ballot-template.dto");
const update_ballot_template_dto_1 = require("./dto/update-ballot-template.dto");
const create_ballot_from_template_dto_1 = require("./dto/create-ballot-from-template.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BallotTemplateController = class BallotTemplateController {
    constructor(ballotTemplateService) {
        this.ballotTemplateService = ballotTemplateService;
    }
    async createTemplate(createTemplateDto, req) {
        return this.ballotTemplateService.createTemplate(createTemplateDto, req.user.id);
    }
    async getAllTemplates(includePublic, req) {
        const includePublicBool = includePublic === 'true';
        return this.ballotTemplateService.getAllTemplates(includePublicBool, req.user?.id);
    }
    async getTemplateById(id) {
        return this.ballotTemplateService.getTemplateById(id);
    }
    async updateTemplate(id, updateTemplateDto, req) {
        return this.ballotTemplateService.updateTemplate(id, updateTemplateDto, req.user.id);
    }
    async deleteTemplate(id, req) {
        return this.ballotTemplateService.deleteTemplate(id, req.user.id);
    }
    async cloneTemplate(id, newName, req) {
        return this.ballotTemplateService.cloneTemplate(id, newName, req.user.id);
    }
    async createBallotFromTemplate(id, createBallotDto, req) {
        console.log('🎯 Controller - createBallotFromTemplate called');
        console.log('📋 Template ID:', id);
        console.log('📝 DTO:', createBallotDto);
        console.log('👤 User ID:', req.user?.id);
        try {
            const result = await this.ballotTemplateService.createBallotFromTemplate(id, createBallotDto, req.user.id);
            console.log('✅ Controller - Ballot created successfully');
            return result;
        }
        catch (error) {
            console.error('❌ Controller - Error creating ballot:', error);
            throw error;
        }
    }
};
exports.BallotTemplateController = BallotTemplateController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ballot_template_dto_1.CreateBallotTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], BallotTemplateController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('includePublic')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BallotTemplateController.prototype, "getAllTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BallotTemplateController.prototype, "getTemplateById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ballot_template_dto_1.UpdateBallotTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], BallotTemplateController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BallotTemplateController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BallotTemplateController.prototype, "cloneTemplate", null);
__decorate([
    (0, common_1.Post)(':id/create-ballot'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_ballot_from_template_dto_1.CreateBallotFromTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], BallotTemplateController.prototype, "createBallotFromTemplate", null);
exports.BallotTemplateController = BallotTemplateController = __decorate([
    (0, common_1.Controller)('ballot-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ballot_template_service_1.BallotTemplateService])
], BallotTemplateController);
//# sourceMappingURL=ballot-template.controller.js.map