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
exports.PartyListService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
const file_upload_service_1 = require("../services/file-upload.service");
let PartyListService = class PartyListService {
    constructor(prisma, idGenerator, fileUploadService) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.fileUploadService = fileUploadService;
    }
    async create(createPartyListDto, logo) {
        const existingPartyList = await this.prisma.partyList.findFirst({
            where: {
                name: createPartyListDto.name,
                isDeleted: false,
            },
        });
        if (existingPartyList) {
            throw new common_1.ConflictException('Party list with this name already exists');
        }
        let logoUrl = null;
        if (logo) {
            try {
                const uploadResult = await this.fileUploadService.processUploadedFile(logo, 'image');
                logoUrl = uploadResult.url;
            }
            catch (error) {
                console.error('Error uploading party list logo:', error);
            }
        }
        else if (createPartyListDto.logoUrl) {
            logoUrl = createPartyListDto.logoUrl;
        }
        const partyList = await this.prisma.partyList.create({
            data: {
                id: await this.idGenerator.generateId('PartyList'),
                name: createPartyListDto.name,
                description: createPartyListDto.description,
                color: createPartyListDto.color,
                logo: logoUrl,
            },
            include: {
                candidates: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                        Candidate_Name: true,
                        position: {
                            select: {
                                Position_Title: true,
                            },
                        },
                    },
                },
            },
        });
        return partyList;
    }
    async findAll() {
        return this.prisma.partyList.findMany({
            where: { isDeleted: false },
            include: {
                candidates: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                        Candidate_Name: true,
                        position: {
                            select: {
                                Position_Title: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const partyList = await this.prisma.partyList.findFirst({
            where: { id, isDeleted: false },
            include: {
                candidates: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_Email: true,
                        position: {
                            select: {
                                Position_Title: true,
                            },
                        },
                        department: {
                            select: {
                                Department_Name: true,
                            },
                        },
                        course: {
                            select: {
                                Course_Name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!partyList) {
            throw new common_1.NotFoundException('Party list not found');
        }
        return partyList;
    }
    async update(id, updatePartyListDto, logo) {
        const existingPartyList = await this.prisma.partyList.findFirst({
            where: { id, isDeleted: false },
        });
        if (!existingPartyList) {
            throw new common_1.NotFoundException('Party list not found');
        }
        if (updatePartyListDto.name) {
            const duplicatePartyList = await this.prisma.partyList.findFirst({
                where: {
                    name: updatePartyListDto.name,
                    id: { not: id },
                    isDeleted: false,
                },
            });
            if (duplicatePartyList) {
                throw new common_1.ConflictException('Party list with this name already exists');
            }
        }
        let logoUrl = existingPartyList.logo;
        if (logo) {
            try {
                const uploadResult = await this.fileUploadService.processUploadedFile(logo, 'image');
                logoUrl = uploadResult.url;
            }
            catch (error) {
                console.error('Error uploading party list logo:', error);
            }
        }
        else if (updatePartyListDto.logoUrl !== undefined) {
            logoUrl = updatePartyListDto.logoUrl;
        }
        return this.prisma.partyList.update({
            where: { id },
            data: {
                ...updatePartyListDto,
                logo: logoUrl,
            },
            include: {
                candidates: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                        Candidate_Name: true,
                        position: {
                            select: {
                                Position_Title: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async remove(id) {
        const partyList = await this.prisma.partyList.findFirst({
            where: { id, isDeleted: false },
        });
        if (!partyList) {
            throw new common_1.NotFoundException('Party list not found');
        }
        const candidateCount = await this.prisma.candidate.count({
            where: {
                partyListId: id,
                isDeleted: false,
            },
        });
        if (candidateCount > 0) {
            throw new common_1.ConflictException('Cannot delete party list that has candidates. Please remove all candidates first.');
        }
        return this.prisma.partyList.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async getStatistics() {
        const totalPartyLists = await this.prisma.partyList.count({
            where: { isDeleted: false },
        });
        const partyListsWithCounts = await this.prisma.partyList.findMany({
            where: { isDeleted: false },
            select: {
                id: true,
                name: true,
                color: true,
                _count: {
                    select: {
                        candidates: {
                            where: { isDeleted: false },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return {
            totalPartyLists,
            partyLists: partyListsWithCounts,
        };
    }
};
exports.PartyListService = PartyListService;
exports.PartyListService = PartyListService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService,
        file_upload_service_1.FileUploadService])
], PartyListService);
//# sourceMappingURL=party-list.service.js.map