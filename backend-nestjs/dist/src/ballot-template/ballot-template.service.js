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
exports.BallotTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ballot_service_1 = require("../ballot/ballot.service");
let BallotTemplateService = class BallotTemplateService {
    constructor(prisma, ballotService) {
        this.prisma = prisma;
        this.ballotService = ballotService;
    }
    async createTemplate(createTemplateDto, createdBy) {
        const { name, description, templateData, isPublic } = createTemplateDto;
        this.validateTemplateData(templateData);
        return this.prisma.ballotTemplate.create({
            data: {
                id: this.generateId(),
                BallotTemplate_Name: name,
                BallotTemplate_Description: description,
                BallotTemplate_Data: templateData,
                BallotTemplate_IsPublic: isPublic || false,
                BallotTemplate_CreatedBy: createdBy,
            },
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
    }
    async getAllTemplates(includePublic = true, createdBy) {
        const where = {
            BallotTemplate_IsDeleted: false,
        };
        if (!includePublic && createdBy) {
            where.BallotTemplate_CreatedBy = createdBy;
        }
        else if (includePublic && createdBy) {
            where.OR = [
                { BallotTemplate_CreatedBy: createdBy },
                { BallotTemplate_IsPublic: true },
            ];
        }
        else if (!includePublic) {
            where.BallotTemplate_IsPublic = false;
        }
        return this.prisma.ballotTemplate.findMany({
            where,
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
            orderBy: {
                BallotTemplate_CreatedAt: 'desc',
            },
        });
    }
    async getTemplateById(id) {
        const template = await this.prisma.ballotTemplate.findFirst({
            where: {
                id,
                BallotTemplate_IsDeleted: false,
            },
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Ballot template not found');
        }
        return template;
    }
    async updateTemplate(id, updateTemplateDto, updatedBy) {
        const template = await this.getTemplateById(id);
        if (template.BallotTemplate_CreatedBy !== updatedBy) {
            throw new common_1.BadRequestException('You can only update your own templates');
        }
        const { name, description, templateData, isPublic } = updateTemplateDto;
        if (templateData) {
            this.validateTemplateData(templateData);
        }
        return this.prisma.ballotTemplate.update({
            where: { id },
            data: {
                ...(name && { BallotTemplate_Name: name }),
                ...(description !== undefined && { BallotTemplate_Description: description }),
                ...(templateData && { BallotTemplate_Data: templateData }),
                ...(isPublic !== undefined && { BallotTemplate_IsPublic: isPublic }),
            },
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
    }
    async deleteTemplate(id, deletedBy) {
        const template = await this.getTemplateById(id);
        if (template.BallotTemplate_CreatedBy !== deletedBy) {
            throw new common_1.BadRequestException('You can only delete your own templates');
        }
        return this.prisma.ballotTemplate.update({
            where: { id },
            data: {
                BallotTemplate_IsDeleted: true,
                BallotTemplate_DeletedAt: new Date(),
            },
        });
    }
    async createBallotFromTemplate(templateId, createBallotDto, createdBy) {
        console.log('🔍 Template Service - createBallotFromTemplate called');
        console.log('📋 Template ID:', templateId);
        console.log('📝 Create Ballot DTO:', createBallotDto);
        console.log('👤 Created By:', createdBy);
        console.log('🗄️ Database State Debug:');
        const departments = await this.prisma.department.findMany({
            select: { id: true, Department_Name: true, _count: { select: { courses: true } } }
        });
        console.log('🏢 Departments:', departments);
        const courses = await this.prisma.course.findMany({
            select: { id: true, Course_Name: true, Course_Code: true, departmentId: true, _count: { select: { candidates: true } } }
        });
        console.log('📚 Courses:', courses);
        const positions = await this.prisma.position.findMany({
            select: { id: true, Position_Title: true, _count: { select: { candidates: true } } }
        });
        console.log('💼 Positions:', positions);
        const candidates = await this.prisma.candidate.findMany({
            select: { id: true, Candidate_Name: true, positionId: true, departmentId: true, courseId: true }
        });
        console.log('👥 Candidates:', candidates);
        if (!createdBy) {
            throw new Error('User ID is required');
        }
        const template = await this.getTemplateById(templateId);
        const templateData = template.BallotTemplate_Data;
        console.log('📊 Template Data:', templateData);
        const ballotConfig = {
            Ballot_Title: createBallotDto.title || templateData.title,
            Ballot_Description: createBallotDto.description || templateData.description,
            Ballot_StartDate: createBallotDto.startDate,
            Ballot_EndDate: createBallotDto.endDate,
            Ballot_RequireAllPositions: templateData.requireAllPositions !== false,
            Ballot_ShowResults: templateData.showResults !== false,
            Ballot_ShowResultsAfter: createBallotDto.showResultsAfter,
            Ballot_ShowLiveResults: templateData.showLiveResults !== false,
            templateId: templateId,
            candidateIds: createBallotDto.candidateIds || [],
        };
        const ballot = await this.ballotService.createBallotFromTemplate(ballotConfig, createdBy);
        console.log('✅ Positions will be created automatically from template data');
        if (createBallotDto.candidateIds && createBallotDto.candidateIds.length > 0) {
            console.log('🎯 Adding candidates to ballot:', createBallotDto.candidateIds);
            console.log('👥 Candidate count:', createBallotDto.candidateIds.length);
            const candidateDetails = await this.prisma.candidate.findMany({
                where: { id: { in: createBallotDto.candidateIds } },
                select: { id: true, Candidate_Name: true, positionId: true, position: { select: { Position_Title: true } } }
            });
            console.log('👥 Candidate details:', candidateDetails);
            try {
                await this.addCandidatesToBallot(ballot.id, createBallotDto.candidateIds);
                console.log('✅ Successfully added candidates to ballot');
            }
            catch (error) {
                console.error('❌ Error adding candidates to ballot:', error);
                throw error;
            }
        }
        else {
            console.log('⚠️ No candidates provided for ballot');
        }
        console.log('🎉 Ballot creation completed successfully');
        return ballot;
    }
    async cloneTemplate(templateId, newName, createdBy) {
        const originalTemplate = await this.getTemplateById(templateId);
        return this.prisma.ballotTemplate.create({
            data: {
                id: this.generateId(),
                BallotTemplate_Name: newName,
                BallotTemplate_Description: originalTemplate.BallotTemplate_Description,
                BallotTemplate_Data: originalTemplate.BallotTemplate_Data,
                BallotTemplate_IsPublic: false,
                BallotTemplate_CreatedBy: createdBy,
            },
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
    }
    validateTemplateData(templateData) {
        if (!templateData || typeof templateData !== 'object') {
            throw new common_1.BadRequestException('Template data must be a valid object');
        }
        if (!templateData.title) {
            throw new common_1.BadRequestException('Template must have a title');
        }
        if (templateData.positions) {
            if (!Array.isArray(templateData.positions)) {
                throw new common_1.BadRequestException('Positions must be an array');
            }
            for (const position of templateData.positions) {
                if (!position.positionId) {
                    throw new common_1.BadRequestException('Each position must have a positionId');
                }
            }
        }
    }
    async addPositionToBallot(ballotId, positionData) {
        return this.prisma.ballotPosition.create({
            data: {
                id: this.generateId(),
                BallotPosition_BallotId: ballotId,
                BallotPosition_PositionId: positionData.positionId,
                BallotPosition_DisplayOrder: positionData.displayOrder,
                BallotPosition_IsRequired: positionData.isRequired,
            },
        });
    }
    async addCandidatesToBallot(ballotId, candidateIds) {
        console.log('🎯 Adding candidates to ballot:', ballotId, candidateIds);
        try {
            const uniqueCandidateIds = [...new Set(candidateIds)];
            console.log('🔍 Unique candidate IDs:', uniqueCandidateIds);
            const candidates = await this.prisma.candidate.findMany({
                where: { id: { in: uniqueCandidateIds } },
                select: { id: true, positionId: true }
            });
            console.log('🔍 Found candidates:', candidates);
            for (const candidate of candidates) {
                try {
                    const existingCandidate = await this.prisma.ballotCandidate.findFirst({
                        where: {
                            BallotCandidate_BallotId: ballotId,
                            BallotCandidate_CandidateId: candidate.id,
                        },
                    });
                    if (existingCandidate) {
                        console.log('⚠️ Candidate already in ballot:', candidate.id);
                        continue;
                    }
                    await this.prisma.ballotCandidate.create({
                        data: {
                            id: this.generateId(),
                            BallotCandidate_BallotId: ballotId,
                            BallotCandidate_CandidateId: candidate.id,
                            BallotCandidate_PositionId: candidate.positionId,
                        },
                    });
                    console.log('✅ Added candidate:', candidate.id, 'to ballot:', ballotId);
                }
                catch (error) {
                    console.error('❌ Error adding candidate:', candidate.id, 'Error:', error);
                    throw error;
                }
            }
            console.log('✅ Successfully added all candidates to ballot');
        }
        catch (error) {
            console.error('❌ Error in addCandidatesToBallot:', error);
            throw error;
        }
    }
    generateId() {
        return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.BallotTemplateService = BallotTemplateService;
exports.BallotTemplateService = BallotTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ballot_service_1.BallotService])
], BallotTemplateService);
//# sourceMappingURL=ballot-template.service.js.map