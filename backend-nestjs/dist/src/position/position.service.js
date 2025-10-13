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
exports.PositionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
let PositionService = class PositionService {
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async getAllPositions(showAll = false) {
        console.log(`[PositionService] getAllPositions called with showAll: ${showAll}`);
        const whereClause = showAll ? {} : { isDeleted: false };
        console.log(`[PositionService] Using where clause:`, whereClause);
        const positions = await this.prisma.position.findMany({
            where: whereClause,
            orderBy: [
                {
                    displayOrder: 'asc',
                },
                {
                    Position_Title: 'asc',
                },
            ],
            include: {
                _count: {
                    select: {
                        candidates: true,
                        votes: true,
                        electionPositions: true,
                    },
                },
            },
        });
        console.log(`[PositionService] Found ${positions.length} positions`);
        console.log(`[PositionService] Position IDs:`, positions.map(p => ({ id: p.id, title: p.Position_Title, isDeleted: p.isDeleted })));
        return positions;
    }
    async createPosition(createPositionDto) {
        const { id, Position_Title, Position_Description, voteLimit, displayOrder } = createPositionDto;
        const existingPosition = await this.prisma.position.findFirst({
            where: { Position_Title: Position_Title },
        });
        if (existingPosition) {
            throw new common_1.ConflictException('Position with this title already exists');
        }
        if (id) {
            const existingPositionWithId = await this.prisma.position.findUnique({
                where: { id: id },
            });
            if (existingPositionWithId) {
                throw new common_1.ConflictException(`Position with ID "${id}" already exists`);
            }
        }
        const positionId = id || await this.idGenerator.generatePositionId();
        const position = await this.prisma.position.create({
            data: {
                id: positionId,
                Position_Title: Position_Title,
                Position_Description: Position_Description,
                voteLimit: voteLimit || 1,
                displayOrder: displayOrder || 0,
            },
            include: {
                _count: {
                    select: {
                        candidates: true,
                        votes: true,
                        electionPositions: true,
                    },
                },
            },
        });
        return {
            message: 'Position created successfully!',
            position,
        };
    }
    async getPositionById(id) {
        const position = await this.prisma.position.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        candidates: true,
                        votes: true,
                        electionPositions: true,
                    },
                },
            },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        if (position.isDeleted) {
            throw new common_1.NotFoundException('Position has been deleted');
        }
        return position;
    }
    async updatePosition(id, updatePositionDto) {
        const { Position_Title, Position_Description, voteLimit, displayOrder } = updatePositionDto;
        const existingPosition = await this.prisma.position.findUnique({
            where: { id },
        });
        if (!existingPosition) {
            throw new common_1.NotFoundException('Position not found');
        }
        if (Position_Title && Position_Title !== existingPosition.Position_Title) {
            const conflictingPosition = await this.prisma.position.findFirst({
                where: {
                    Position_Title: Position_Title,
                    NOT: { id },
                },
            });
            if (conflictingPosition) {
                throw new common_1.ConflictException('Position with this title already exists');
            }
        }
        const position = await this.prisma.position.update({
            where: { id },
            data: {
                Position_Title: Position_Title,
                Position_Description: Position_Description,
                voteLimit,
                displayOrder,
            },
            include: {
                _count: {
                    select: {
                        candidates: true,
                        votes: true,
                        electionPositions: true,
                    },
                },
            },
        });
        return {
            message: 'Position updated successfully!',
            position,
        };
    }
    async deletePosition(id) {
        console.log(`[PositionService] deletePosition called with ID: "${id}"`);
        console.log(`[PositionService] ID type: ${typeof id}`);
        console.log(`[PositionService] ID length: ${id?.length}`);
        console.log(`[PositionService] ID trimmed: "${id?.trim()}"`);
        const trimmedId = id?.trim();
        console.log(`[PositionService] Using trimmed ID: "${trimmedId}"`);
        const position = await this.prisma.position.findUnique({
            where: { id: trimmedId },
            include: {
                _count: {
                    select: {
                        candidates: true,
                        votes: true,
                        electionPositions: true,
                    },
                },
            },
        });
        if (!position) {
            console.log(`[PositionService] Position not found with ID: "${trimmedId}"`);
            throw new common_1.NotFoundException('Position not found');
        }
        console.log(`[PositionService] Found position:`, {
            id: position.id,
            title: position.Position_Title,
            isDeleted: position.isDeleted
        });
        if (position.isDeleted) {
            console.log(`[PositionService] Position already soft-deleted: "${trimmedId}"`);
            throw new common_1.NotFoundException('Position has already been deleted');
        }
        console.log(`[PositionService] Performing soft delete for position: "${trimmedId}"`);
        await this.prisma.position.update({
            where: { id: trimmedId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        console.log(`[PositionService] Position "${trimmedId}" soft-deleted successfully`);
        return {
            message: 'Position moved to trash successfully!',
        };
    }
};
exports.PositionService = PositionService;
exports.PositionService = PositionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], PositionService);
//# sourceMappingURL=position.service.js.map