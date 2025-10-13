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
exports.ElectionAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
let ElectionAssignmentService = class ElectionAssignmentService {
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async getAllElectionAssignments(electionId, candidateId) {
        const where = {};
        if (electionId) {
            where.electionId = electionId;
        }
        if (candidateId) {
            where.candidateId = candidateId;
        }
        return this.prisma.electionCandidate.findMany({
            where,
            include: {
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                        Election_Description: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_Email: true,
                        Candidate_StudentId: true,
                        photo: true,
                        manifesto: true,
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async createElectionAssignment(createElectionAssignmentDto) {
        const { electionId, candidateId } = createElectionAssignmentDto;
        const election = await this.prisma.election.findUnique({
            where: {
                id: electionId,
                isDeleted: false
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        const existingAssignment = await this.prisma.electionCandidate.findFirst({
            where: {
                electionId,
                candidateId,
            },
        });
        if (existingAssignment) {
            throw new common_1.ConflictException('Candidate is already assigned to this election');
        }
        const customId = await this.idGenerator.generateElectionCandidateId();
        const assignment = await this.prisma.electionCandidate.create({
            data: {
                id: customId,
                electionId,
                candidateId,
            },
            include: {
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                        Election_Description: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_Email: true,
                        Candidate_StudentId: true,
                        photo: true,
                        manifesto: true,
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            message: 'Election assignment created successfully!',
            assignment,
        };
    }
    async getElectionAssignmentById(id) {
        const assignment = await this.prisma.electionCandidate.findUnique({
            where: { id },
            include: {
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                        Election_Description: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_Email: true,
                        Candidate_StudentId: true,
                        photo: true,
                        manifesto: true,
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Election assignment not found');
        }
        return assignment;
    }
    async updateElectionAssignment(id, updateElectionAssignmentDto) {
        const assignment = await this.prisma.electionCandidate.findUnique({
            where: { id },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Election assignment not found');
        }
        const { electionId, candidateId } = updateElectionAssignmentDto;
        if (electionId) {
            const election = await this.prisma.election.findUnique({
                where: {
                    id: electionId,
                    isDeleted: false
                },
            });
            if (!election) {
                throw new common_1.NotFoundException('Election not found');
            }
        }
        if (candidateId) {
            const candidate = await this.prisma.candidate.findUnique({
                where: { id: candidateId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate not found');
            }
        }
        const updatedAssignment = await this.prisma.electionCandidate.update({
            where: { id },
            data: {
                electionId,
                candidateId,
            },
            include: {
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                        Election_Description: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_Email: true,
                        Candidate_StudentId: true,
                        photo: true,
                        manifesto: true,
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            message: 'Election assignment updated successfully!',
            assignment: updatedAssignment,
        };
    }
    async deleteElectionAssignment(id) {
        const assignment = await this.prisma.electionCandidate.findUnique({
            where: { id },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Election assignment not found');
        }
        await this.prisma.electionCandidate.delete({
            where: { id },
        });
        return {
            message: 'Election assignment deleted successfully!',
        };
    }
    async getCandidatesForElection(electionId) {
        const election = await this.prisma.election.findUnique({
            where: {
                id: electionId,
                isDeleted: false
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const candidates = await this.prisma.electionCandidate.findMany({
            where: { electionId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_Email: true,
                        Candidate_StudentId: true,
                        photo: true,
                        manifesto: true,
                        party_list_name: true,
                        partyListId: true,
                        partyList: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                                logo: true,
                            },
                        },
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
                description: election.Election_Description,
                startDate: election.startDate,
                endDate: election.endDate,
                isActive: election.isActive,
            },
            candidates,
        };
    }
    async getElectionsForCandidate(candidateId) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        const elections = await this.prisma.electionCandidate.findMany({
            where: { candidateId },
            include: {
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                        Election_Description: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
            },
        });
        return {
            candidate: {
                id: candidate.id,
                name: candidate.Candidate_Name,
                email: candidate.Candidate_Email,
                studentId: candidate.Candidate_StudentId,
                photo: candidate.photo,
                manifesto: candidate.manifesto,
            },
            elections,
        };
    }
    async bulkAssignCandidates(assignments) {
        const results = [];
        for (const assignment of assignments) {
            try {
                const result = await this.createElectionAssignment(assignment);
                results.push({ success: true, data: result });
            }
            catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error occurred',
                    data: assignment
                });
            }
        }
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        return {
            message: `Bulk assignment completed. ${successful} successful, ${failed} failed.`,
            results,
            summary: {
                total: assignments.length,
                successful,
                failed,
            },
        };
    }
    async removeCandidateFromElection(electionId, candidateId) {
        const assignment = await this.prisma.electionCandidate.findFirst({
            where: {
                electionId,
                candidateId,
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Election assignment not found');
        }
        await this.prisma.electionCandidate.delete({
            where: { id: assignment.id },
        });
        return {
            message: 'Candidate removed from election successfully!',
        };
    }
    async getElectionPositions(electionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const positions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            include: {
                position: true,
            },
        });
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
                description: election.Election_Description,
                startDate: election.startDate,
                endDate: election.endDate,
                isActive: election.isActive,
            },
            positions: positions.map(p => p.position),
        };
    }
    async getUnassignedPositions(electionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const allPositions = await this.prisma.position.findMany({
            orderBy: {
                Position_Title: 'asc',
            },
        });
        const assignedPositions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            select: { positionId: true },
        });
        const assignedPositionIds = assignedPositions.map(p => p.positionId);
        const unassignedPositions = allPositions.filter(position => !assignedPositionIds.includes(position.id));
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
            },
            unassignedPositions,
        };
    }
    async getPositionAssignmentStatus(electionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const allPositions = await this.prisma.position.findMany();
        const assignedPositions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            include: {
                position: true,
            },
        });
        const status = allPositions.map(position => {
            const isAssigned = assignedPositions.some(ap => ap.positionId === position.id);
            return {
                position,
                isAssigned,
                assignedAt: isAssigned ? assignedPositions.find(ap => ap.positionId === position.id)?.createdAt : null,
            };
        });
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
            },
            positionStatus: status,
        };
    }
    async assignPositionToElection(electionId, positionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const position = await this.prisma.position.findUnique({
            where: { id: positionId },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        const existingAssignment = await this.prisma.electionPosition.findFirst({
            where: {
                electionId,
                positionId,
            },
        });
        if (existingAssignment) {
            throw new common_1.ConflictException('Position is already assigned to this election');
        }
        const customId = await this.idGenerator.generateElectionPositionId();
        const assignment = await this.prisma.electionPosition.create({
            data: {
                id: customId,
                electionId,
                positionId,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        Position_Description: true,
                        voteLimit: true,
                    },
                },
            },
        });
        return {
            message: 'Position assigned to election successfully!',
            assignment,
        };
    }
    async removePositionFromElection(electionId, positionId) {
        const assignment = await this.prisma.electionPosition.findFirst({
            where: {
                electionId,
                positionId,
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Position assignment not found');
        }
        await this.prisma.electionPosition.delete({
            where: { id: assignment.id },
        });
        return {
            message: 'Position removed from election successfully!',
        };
    }
    async getUnassignedCandidates(electionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const allCandidates = await this.prisma.candidate.findMany({
            where: {
                isDeleted: false,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
            },
        });
        const assignedCandidates = await this.prisma.electionCandidate.findMany({
            where: { electionId },
            select: { candidateId: true },
        });
        const assignedCandidateIds = assignedCandidates.map(c => c.candidateId);
        const unassignedCandidates = allCandidates.filter(candidate => !assignedCandidateIds.includes(candidate.id));
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
            },
            unassignedCandidates,
        };
    }
    async getCandidateAssignmentStatus(electionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const allCandidates = await this.prisma.candidate.findMany({
            where: {
                isDeleted: false,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
            },
        });
        const assignedCandidates = await this.prisma.electionCandidate.findMany({
            where: { electionId },
            include: {
                candidate: {
                    include: {
                        position: true,
                        department: true,
                    },
                },
            },
        });
        const status = allCandidates.map(candidate => {
            const isAssigned = assignedCandidates.some(ac => ac.candidateId === candidate.id);
            return {
                candidate,
                isAssigned,
                assignedAt: isAssigned ? assignedCandidates.find(ac => ac.candidateId === candidate.id)?.createdAt : null,
            };
        });
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
            },
            candidateStatus: status,
        };
    }
    async assignCandidateToElection(electionId, candidateId) {
        return this.createElectionAssignment({ electionId, candidateId });
    }
    async getElectionBallot(electionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const electionPositions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            include: {
                position: true,
            },
        });
        const electionCandidates = await this.prisma.electionCandidate.findMany({
            where: { electionId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_Email: true,
                        Candidate_StudentId: true,
                        photo: true,
                        manifesto: true,
                        positionId: true,
                        party_list_name: true,
                        partyListId: true,
                        partyList: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                                logo: true,
                            },
                        },
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
            },
        });
        const ballot = electionPositions.map(electionPosition => {
            const positionCandidates = electionCandidates.filter(ec => ec.candidate.positionId === electionPosition.positionId);
            return {
                position: electionPosition.position,
                candidates: positionCandidates.map(ec => ec.candidate),
            };
        });
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
                description: election.Election_Description,
                startDate: election.startDate,
                endDate: election.endDate,
                isActive: election.isActive,
            },
            ballot,
        };
    }
};
exports.ElectionAssignmentService = ElectionAssignmentService;
exports.ElectionAssignmentService = ElectionAssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService])
], ElectionAssignmentService);
//# sourceMappingURL=election-assignment.service.js.map