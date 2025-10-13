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
exports.IdGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IdGeneratorService = class IdGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateCustomId(model, prefix, format = 'simple') {
        const count = await model.count();
        const number = count + 1;
        switch (format) {
            case 'padded':
                return `${prefix}-${number.toString().padStart(3, '0')}`;
            case 'year':
                const year = new Date().getFullYear();
                return `${prefix}-${year}-${number}`;
            default:
                return `${prefix}-${number}`;
        }
    }
    async generateAdminId(format = 'simple') {
        return this.generateCustomId(this.prisma.admin, 'ADMIN', format);
    }
    async generateDepartmentId(format = 'simple') {
        return this.generateCustomId(this.prisma.department, 'DEPT', format);
    }
    async generateCourseId(format = 'simple') {
        return this.generateCustomId(this.prisma.course, 'COURSE', format);
    }
    async generatePositionId(format = 'simple') {
        return this.generateCustomId(this.prisma.position, 'POS', format);
    }
    async generateCandidateId(format = 'simple') {
        return this.generateCustomId(this.prisma.candidate, 'CAND', format);
    }
    async generateVoterId(format = 'simple') {
        return this.generateCustomId(this.prisma.voter, 'VTR', format);
    }
    async generateElectionId(format = 'simple') {
        return this.generateCustomId(this.prisma.election, 'ELEC', format);
    }
    async generateVoteId(format = 'simple') {
        return this.generateCustomId(this.prisma.vote, 'VOTE', format);
    }
    async generateElectionPositionId(format = 'simple') {
        return this.generateCustomId(this.prisma.electionPosition, 'ELECPOS', format);
    }
    async generateElectionCandidateId(format = 'simple') {
        return this.generateCustomId(this.prisma.electionCandidate, 'ELECCAND', format);
    }
    async generatePasswordResetTokenId(format = 'simple') {
        return this.generateCustomId(this.prisma.passwordResetToken, 'PWD', format);
    }
    async generateAdminLoginLogId(format = 'simple') {
        return this.generateCustomId(this.prisma.adminLoginLog, 'ADMINLOG', format);
    }
    async generateUserLoginLogId(format = 'simple') {
        return this.generateCustomId(this.prisma.userLoginLog, 'USERLOG', format);
    }
    async generateId(modelName, format = 'simple') {
        const modelMap = {
            admin: this.prisma.admin,
            department: this.prisma.department,
            course: this.prisma.course,
            position: this.prisma.position,
            candidate: this.prisma.candidate,
            voter: this.prisma.voter,
            election: this.prisma.election,
            vote: this.prisma.vote,
            admin_login_log: this.prisma.adminLoginLog,
            user_login_log: this.prisma.userLoginLog,
            partylist: this.prisma.partyList,
        };
        const model = modelMap[modelName.toLowerCase()];
        if (!model) {
            throw new Error(`Unknown model: ${modelName}`);
        }
        const count = await model.count();
        const number = count + 1;
        switch (format) {
            case 'padded':
                return `${modelName.toUpperCase()}-${number.toString().padStart(3, '0')}`;
            case 'year':
                const year = new Date().getFullYear();
                return `${modelName.toUpperCase()}-${year}-${number}`;
            default:
                return `${modelName.toUpperCase()}-${number}`;
        }
    }
    async generateCustomFormatId(model, prefix, format = 'simple') {
        return this.generateCustomId(model, prefix, format);
    }
    async getModelCount(modelName) {
        const modelMap = {
            admin: this.prisma.admin,
            department: this.prisma.department,
            course: this.prisma.course,
            position: this.prisma.position,
            candidate: this.prisma.candidate,
            voter: this.prisma.voter,
            election: this.prisma.election,
            vote: this.prisma.vote,
            partylist: this.prisma.partyList,
        };
        const model = modelMap[modelName.toLowerCase()];
        if (!model) {
            throw new Error(`Unknown model: ${modelName}`);
        }
        return model.count();
    }
};
exports.IdGeneratorService = IdGeneratorService;
exports.IdGeneratorService = IdGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdGeneratorService);
//# sourceMappingURL=id-generator.service.js.map