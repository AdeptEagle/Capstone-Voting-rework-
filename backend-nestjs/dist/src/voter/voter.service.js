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
exports.VoterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const id_generator_service_1 = require("../utils/id-generator.service");
const voting_gateway_1 = require("../websocket/voting.gateway");
let VoterService = class VoterService {
    constructor(prisma, idGenerator, votingGateway) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.votingGateway = votingGateway;
    }
    async getAllVoters() {
        return this.prisma.voter.findMany({
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
            },
        });
    }
    async getVoterById(id) {
        const voter = await this.prisma.voter.findUnique({
            where: { id },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
            },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        return voter;
    }
    async getVoterByStudentId(studentId) {
        const voter = await this.prisma.voter.findUnique({
            where: { Voter_StudentId: studentId },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
            },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        return voter;
    }
    async createVoter(createVoterDto) {
        const { Voter_Email, Voter_StudentId, password, ...rest } = createVoterDto;
        const existingEmail = await this.prisma.voter.findUnique({
            where: { Voter_Email: Voter_Email },
        });
        const existingStudentId = await this.prisma.voter.findUnique({
            where: { Voter_StudentId: Voter_StudentId },
        });
        if (existingEmail && existingStudentId) {
            throw new common_1.ConflictException(`Account creation failed: Both email address "${Voter_Email}" and student ID "${Voter_StudentId}" are already registered. Please use different credentials or contact support if you believe this is an error.`);
        }
        if (existingEmail) {
            throw new common_1.ConflictException(`Account creation failed: Email address "${Voter_Email}" is already registered. Please use a different email address or contact support if you believe this is an error.`);
        }
        if (existingStudentId) {
            throw new common_1.ConflictException(`Account creation failed: Student ID "${Voter_StudentId}" is already registered. Please use a different student ID or contact support if you believe this is an error.`);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const voterId = await this.idGenerator.generateVoterId();
        const voterData = {
            id: voterId,
            Voter_StudentId: Voter_StudentId,
            ...rest,
            Voter_Email: Voter_Email,
            password: hashedPassword,
        };
        try {
            const voter = await this.prisma.voter.create({
                data: voterData,
                include: {
                    department: {
                        select: {
                            id: true,
                            Department_Name: true,
                        },
                    },
                    course: {
                        select: {
                            id: true,
                            Course_Name: true,
                            Course_Code: true,
                        },
                    },
                },
            });
            console.log('🔌 Emitting voter-registered WebSocket event...');
            console.log('📊 Voter data to emit:', {
                id: voter.id,
                studentId: voter.Voter_StudentId,
                name: voter.Voter_Name,
                email: voter.Voter_Email
            });
            try {
                this.votingGateway.emitVoterRegistered({
                    id: voter.id,
                    studentId: voter.Voter_StudentId,
                    name: voter.Voter_Name,
                    email: voter.Voter_Email,
                    hasVoted: voter.hasVoted,
                    department: voter.department,
                    course: voter.course,
                    createdAt: voter.createdAt,
                });
                console.log('✅ voter-registered event emitted successfully');
            }
            catch (error) {
                console.error('❌ Error emitting voter-registered event:', error);
            }
            console.log('🔌 Emitting admin-action WebSocket event...');
            try {
                this.votingGateway.emitAdminAction('voter-management', {
                    action: 'voter-created',
                    voterId: voter.id,
                    voterName: voter.Voter_Name,
                });
                console.log('✅ admin-action event emitted successfully');
            }
            catch (error) {
                console.error('❌ Error emitting admin-action event:', error);
            }
            return {
                message: 'Voter created successfully!',
                voter: {
                    id: voter.id,
                    studentId: voter.Voter_StudentId,
                    name: voter.Voter_Name,
                    email: voter.Voter_Email,
                    hasVoted: voter.hasVoted,
                    department: voter.department,
                    course: voter.course,
                    createdAt: voter.createdAt,
                    updatedAt: voter.updatedAt,
                },
            };
        }
        catch (error) {
            console.error('❌ Error creating voter:', error);
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0];
                if (field === 'Voter_Email') {
                    throw new common_1.ConflictException(`Account creation failed: Email address "${Voter_Email}" is already registered. Please use a different email address or contact support if you believe this is an error.`);
                }
                else if (field === 'Voter_StudentId') {
                    throw new common_1.ConflictException(`Account creation failed: Student ID "${Voter_StudentId}" is already registered. Please use a different student ID or contact support if you believe this is an error.`);
                }
                else {
                    throw new common_1.ConflictException(`Account creation failed: The provided information conflicts with an existing account. Please check your details and try again.`);
                }
            }
            if (error.code === 'P2003') {
                const field = error.meta?.field_name;
                if (field === 'departmentId') {
                    throw new common_1.ConflictException(`Account creation failed: Invalid department selected. Please select a valid department.`);
                }
                else if (field === 'courseId') {
                    throw new common_1.ConflictException(`Account creation failed: Invalid course selected. Please select a valid course.`);
                }
                else {
                    throw new common_1.ConflictException(`Account creation failed: Invalid reference data. Please check your department and course selections.`);
                }
            }
            throw new common_1.ConflictException(`Account creation failed: ${error.message || 'An unexpected error occurred. Please try again or contact support.'}`);
        }
    }
    async updateVoter(id, updateVoterDto) {
        const voter = await this.prisma.voter.findUnique({
            where: { id },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const updateData = { ...updateVoterDto };
        if (updateVoterDto.password) {
            updateData.password = await bcrypt.hash(updateVoterDto.password, 10);
        }
        const updatedVoter = await this.prisma.voter.update({
            where: { id },
            data: updateData,
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
            },
        });
        this.votingGateway.emitVoterUpdated({
            id: updatedVoter.id,
            studentId: updatedVoter.Voter_StudentId,
            name: updatedVoter.Voter_Name,
            email: updatedVoter.Voter_Email,
            hasVoted: updatedVoter.hasVoted,
            department: updatedVoter.department,
            course: updatedVoter.course,
            updatedAt: updatedVoter.updatedAt,
        });
        this.votingGateway.emitAdminAction('voter-management', {
            action: 'voter-updated',
            voterId: updatedVoter.id,
            voterName: updatedVoter.Voter_Name,
        });
        return {
            message: 'Voter updated successfully!',
            voter: updatedVoter,
        };
    }
    async deleteVoter(id) {
        const voter = await this.prisma.voter.findUnique({
            where: { id },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        await this.prisma.voter.delete({
            where: { id },
        });
        this.votingGateway.emitVoterDeleted(id);
        this.votingGateway.emitAdminAction('voter-management', {
            action: 'voter-deleted',
            voterId: id,
        });
        return {
            message: 'Voter deleted successfully!',
        };
    }
    async markVoterAsVoted(id) {
        const voter = await this.prisma.voter.findUnique({
            where: { id },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const updatedVoter = await this.prisma.voter.update({
            where: { id },
            data: { hasVoted: true },
        });
        this.votingGateway.emitVoterUpdated({
            id: updatedVoter.id,
            studentId: updatedVoter.Voter_StudentId,
            name: updatedVoter.Voter_Name,
            email: updatedVoter.Voter_Email,
            hasVoted: updatedVoter.hasVoted,
            updatedAt: updatedVoter.updatedAt,
        });
        return {
            message: 'Voter marked as voted!',
            voter: updatedVoter,
        };
    }
    async resetVoterVoteStatus(id) {
        const voter = await this.prisma.voter.findUnique({
            where: { id },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const updatedVoter = await this.prisma.voter.update({
            where: { id },
            data: { hasVoted: false },
        });
        this.votingGateway.emitVoterUpdated({
            id: updatedVoter.id,
            studentId: updatedVoter.Voter_StudentId,
            name: updatedVoter.Voter_Name,
            email: updatedVoter.Voter_Email,
            hasVoted: updatedVoter.hasVoted,
            updatedAt: updatedVoter.updatedAt,
        });
        return {
            message: 'Voter vote status reset!',
            voter: updatedVoter,
        };
    }
    async getVoterPassword(id) {
        const voter = await this.prisma.voter.findUnique({
            where: { id },
            select: {
                id: true,
                Voter_StudentId: true,
                Voter_Name: true,
                Voter_Email: true,
                password: true,
            },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const isDefaultPassword = await bcrypt.compare(voter.Voter_StudentId, voter.password);
        return {
            message: 'Password retrieved successfully',
            voter: {
                id: voter.id,
                studentId: voter.Voter_StudentId,
                name: voter.Voter_Name,
                email: voter.Voter_Email,
            },
            currentPassword: isDefaultPassword ? voter.Voter_StudentId : 'Custom Password Set',
            isDefaultPassword: isDefaultPassword,
            defaultPassword: voter.Voter_StudentId,
        };
    }
    async resetVoterPassword(id) {
        const voter = await this.prisma.voter.findUnique({
            where: { id },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const hashedPassword = await bcrypt.hash(voter.Voter_StudentId, 10);
        const updatedVoter = await this.prisma.voter.update({
            where: { id },
            data: { password: hashedPassword },
        });
        this.votingGateway.emitVoterUpdated({
            id: updatedVoter.id,
            studentId: updatedVoter.Voter_StudentId,
            name: updatedVoter.Voter_Name,
            email: updatedVoter.Voter_Email,
            hasVoted: updatedVoter.hasVoted,
            updatedAt: updatedVoter.updatedAt,
        });
        this.votingGateway.emitAdminAction('voter-management', {
            action: 'voter-password-reset',
            voterId: updatedVoter.id,
            voterName: updatedVoter.Voter_Name,
        });
        return {
            message: 'Password reset to Student ID successfully!',
            newPassword: voter.Voter_StudentId,
            voter: {
                id: updatedVoter.id,
                studentId: updatedVoter.Voter_StudentId,
                name: updatedVoter.Voter_Name,
                email: updatedVoter.Voter_Email,
            },
        };
    }
    async getVoterHistory(voterId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
                ballotHistory: {
                    include: {
                        ballot: {
                            select: {
                                id: true,
                                Ballot_Title: true,
                                Ballot_Description: true,
                                Ballot_Status: true,
                                Ballot_IsActive: true,
                                Ballot_StartDate: true,
                                Ballot_EndDate: true,
                                Ballot_CreatedAt: true,
                            },
                        },
                    },
                    orderBy: {
                        UserBallotHistory_VotedAt: 'desc',
                    },
                },
                votes: {
                    include: {
                        candidate: {
                            select: {
                                id: true,
                                Candidate_Name: true,
                                Candidate_StudentId: true,
                            },
                        },
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        election: {
                            select: {
                                id: true,
                                Election_Title: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        return {
            voter: {
                id: voter.id,
                name: voter.Voter_Name,
                email: voter.Voter_Email,
                studentId: voter.Voter_StudentId,
                hasVoted: voter.hasVoted,
                department: voter.department,
                course: voter.course,
                createdAt: voter.createdAt,
                updatedAt: voter.updatedAt,
            },
            ballotHistory: voter.ballotHistory,
            voteHistory: voter.votes,
            statistics: {
                totalBallotsParticipated: voter.ballotHistory.filter(h => h.UserBallotHistory_IsCompleted).length,
                totalVotesCast: voter.votes.length,
                lastVotedAt: voter.ballotHistory.length > 0 ? voter.ballotHistory[0].UserBallotHistory_VotedAt : null,
                participationRate: voter.ballotHistory.length > 0 ?
                    (voter.ballotHistory.filter(h => h.UserBallotHistory_IsCompleted).length / voter.ballotHistory.length) * 100 : 0,
            },
        };
    }
    async getVoterBallotHistory(voterId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
            select: {
                id: true,
                Voter_Name: true,
                Voter_StudentId: true,
                ballotHistory: {
                    include: {
                        ballot: {
                            include: {
                                ballotPositions: {
                                    include: {
                                        position: {
                                            select: {
                                                id: true,
                                                Position_Title: true,
                                            },
                                        },
                                    },
                                },
                                ballotCandidates: {
                                    include: {
                                        candidate: {
                                            select: {
                                                id: true,
                                                Candidate_Name: true,
                                                Candidate_StudentId: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        UserBallotHistory_VotedAt: 'desc',
                    },
                },
            },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        return {
            voter: {
                id: voter.id,
                name: voter.Voter_Name,
                studentId: voter.Voter_StudentId,
            },
            ballotHistory: voter.ballotHistory.map(history => ({
                ballot: {
                    id: history.ballot.id,
                    title: history.ballot.Ballot_Title,
                    description: history.ballot.Ballot_Description,
                    status: history.ballot.Ballot_Status,
                    isActive: history.ballot.Ballot_IsActive,
                    startDate: history.ballot.Ballot_StartDate,
                    endDate: history.ballot.Ballot_EndDate,
                    positions: history.ballot.ballotPositions.map(bp => ({
                        id: bp.position.id,
                        title: bp.position.Position_Title,
                        isRequired: bp.BallotPosition_IsRequired,
                    })),
                    candidates: history.ballot.ballotCandidates.map(bc => ({
                        id: bc.candidate.id,
                        name: bc.candidate.Candidate_Name,
                        studentId: bc.candidate.Candidate_StudentId,
                        positionId: bc.BallotCandidate_PositionId,
                    })),
                },
                participation: {
                    votedAt: history.UserBallotHistory_VotedAt,
                    voteCount: history.UserBallotHistory_VoteCount,
                    isCompleted: history.UserBallotHistory_IsCompleted,
                    lastAccessed: history.UserBallotHistory_LastAccessed,
                },
            })),
        };
    }
    async getVoterVotingDetails(voterId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
            include: {
                ballotHistory: {
                    include: {
                        ballot: {
                            select: {
                                id: true,
                                Ballot_Title: true,
                                Ballot_Status: true,
                                Ballot_IsActive: true,
                                Ballot_StartDate: true,
                                Ballot_EndDate: true,
                            },
                        },
                    },
                },
                votes: {
                    include: {
                        candidate: {
                            select: {
                                id: true,
                                Candidate_Name: true,
                                Candidate_StudentId: true,
                            },
                        },
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                            },
                        },
                        election: {
                            select: {
                                id: true,
                                Election_Title: true,
                            },
                        },
                    },
                },
            },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const votingDetails = voter.ballotHistory.map(history => {
            const ballotVotes = voter.votes.filter(vote => vote.electionId === 'ELEC-12');
            return {
                ballot: {
                    id: history.ballot.id,
                    title: history.ballot.Ballot_Title,
                    status: history.ballot.Ballot_Status,
                    isActive: history.ballot.Ballot_IsActive,
                    startDate: history.ballot.Ballot_StartDate,
                    endDate: history.ballot.Ballot_EndDate,
                },
                participation: {
                    votedAt: history.UserBallotHistory_VotedAt,
                    voteCount: history.UserBallotHistory_VoteCount,
                    isCompleted: history.UserBallotHistory_IsCompleted,
                    lastAccessed: history.UserBallotHistory_LastAccessed,
                },
                votes: ballotVotes.map(vote => ({
                    id: vote.id,
                    candidate: {
                        id: vote.candidate.id,
                        name: vote.candidate.Candidate_Name,
                        studentId: vote.candidate.Candidate_StudentId,
                    },
                    position: {
                        id: vote.position.id,
                        title: vote.position.Position_Title,
                    },
                    votedAt: vote.createdAt,
                })),
            };
        });
        return {
            voter: {
                id: voter.id,
                name: voter.Voter_Name,
                studentId: voter.Voter_StudentId,
                email: voter.Voter_Email,
            },
            votingDetails,
            summary: {
                totalBallotsParticipated: voter.ballotHistory.filter(h => h.UserBallotHistory_IsCompleted).length,
                totalVotesCast: voter.votes.length,
                lastVotedAt: voter.ballotHistory.length > 0 ? voter.ballotHistory[0].UserBallotHistory_VotedAt : null,
                participationRate: voter.ballotHistory.length > 0 ?
                    (voter.ballotHistory.filter(h => h.UserBallotHistory_IsCompleted).length / voter.ballotHistory.length) * 100 : 0,
            },
        };
    }
};
exports.VoterService = VoterService;
exports.VoterService = VoterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService,
        voting_gateway_1.VotingGateway])
], VoterService);
//# sourceMappingURL=voter.service.js.map