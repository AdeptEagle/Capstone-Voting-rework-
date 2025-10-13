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
exports.CandidateController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const candidate_service_1 = require("./candidate.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CandidateController = class CandidateController {
    constructor(candidateService) {
        this.candidateService = candidateService;
    }
    async getAllCandidates(req) {
        const showAll = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN');
        return this.candidateService.getAllCandidates(showAll);
    }
    async createCandidate(createCandidateDto, photo) {
        console.log('📸 Controller - Create - Photo received:', photo);
        console.log('📸 Controller - Create - Photo type:', typeof photo);
        console.log('📸 Controller - Create - Photo properties:', photo ? Object.keys(photo) : 'No photo');
        console.log('📸 Controller - Create - CreateCandidateDto:', createCandidateDto);
        const photoUrl = createCandidateDto.photo;
        if (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('https://res.cloudinary.com/'))) {
            console.log('📸 Controller - Create - Using existing photo URL:', photoUrl);
            return this.candidateService.createCandidate(createCandidateDto, photoUrl);
        }
        console.log('📸 Controller - Create - Using uploaded file:', photo);
        return this.candidateService.createCandidate(createCandidateDto, photo);
    }
    async getCandidateById(id) {
        return this.candidateService.getCandidateById(id);
    }
    async updateCandidate(id, updateCandidateDto, photo) {
        console.log('📸 Controller - Photo received:', photo);
        console.log('📸 Controller - Photo type:', typeof photo);
        console.log('📸 Controller - Photo properties:', photo ? Object.keys(photo) : 'No photo');
        console.log('📸 Controller - UpdateCandidateDto:', updateCandidateDto);
        const photoUrl = updateCandidateDto.photo;
        if (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('https://res.cloudinary.com/'))) {
            console.log('📸 Controller - Using existing photo URL:', photoUrl);
            return this.candidateService.updateCandidate(id, updateCandidateDto, photoUrl);
        }
        console.log('📸 Controller - Using uploaded file:', photo);
        return this.candidateService.updateCandidate(id, updateCandidateDto, photo);
    }
    async deleteCandidate(id) {
        return this.candidateService.deleteCandidate(id);
    }
};
exports.CandidateController = CandidateController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all candidates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all candidates' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getAllCandidates", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new candidate' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidate created successfully' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCandidateDto, Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "createCandidate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get candidate by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCandidateById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update candidate' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCandidateDto, Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateCandidate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete candidate' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "deleteCandidate", null);
exports.CandidateController = CandidateController = __decorate([
    (0, swagger_1.ApiTags)('Candidate'),
    (0, common_1.Controller)('candidates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [candidate_service_1.CandidateService])
], CandidateController);
//# sourceMappingURL=candidate.controller.js.map