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
exports.BallotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const timezone_util_1 = require("../utils/timezone.util");
let BallotService = class BallotService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBallot(createBallotDto, createdBy) {
        try {
            console.log('🆕 Creating ballot with data:', createBallotDto);
            console.log('👤 Created by user ID:', createdBy);
            const { Ballot_Title, Ballot_Description, Ballot_StartDate, Ballot_EndDate, Ballot_RequireAllPositions, Ballot_ShowResults, Ballot_ShowResultsAfter, Ballot_ShowLiveResults, Ballot_AllowAbstain, positionIds, candidateIds } = createBallotDto;
            console.log('🕐 Date validation input:');
            console.log('Raw Start Date:', Ballot_StartDate);
            console.log('Raw End Date:', Ballot_EndDate);
            const startDate = new Date(Ballot_StartDate);
            const endDate = new Date(Ballot_EndDate);
            const now = new Date();
            if (isNaN(startDate.getTime())) {
                throw new common_1.BadRequestException(`Invalid start date format: ${Ballot_StartDate}`);
            }
            if (isNaN(endDate.getTime())) {
                throw new common_1.BadRequestException(`Invalid end date format: ${Ballot_EndDate}`);
            }
            console.log('🕐 Date validation (Parsed):');
            console.log('Start date:', startDate.toISOString());
            console.log('End date:', endDate.toISOString());
            console.log('Current time:', now.toISOString());
            if (startDate >= endDate) {
                throw new common_1.BadRequestException(`Start date (${startDate.toISOString()}) must be before end date (${endDate.toISOString()})`);
            }
            const bufferTime = new Date(now.getTime() - (60 * 60 * 1000));
            if (startDate < bufferTime) {
                throw new common_1.BadRequestException(`Start date cannot be more than 1 hour in the past. Current time: ${now.toISOString()}, Start time: ${startDate.toISOString()}`);
            }
            console.log('🔍 Validating positions:', positionIds);
            if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
                throw new common_1.BadRequestException('At least one position must be selected');
            }
            console.log('🔍 Validating candidates:', candidateIds);
            if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
                throw new common_1.BadRequestException('At least one candidate must be selected');
            }
            const candidates = await this.prisma.candidate.findMany({
                where: {
                    id: { in: candidateIds },
                    isDeleted: false,
                },
                select: { id: true, positionId: true }
            });
            console.log('🔍 Found candidates in DB:', candidates);
            console.log('🔍 Selected position IDs:', positionIds);
            const selectedPositionIds = new Set(positionIds);
            const candidatePositionIds = candidates.map(c => c.positionId);
            const validCandidates = candidatePositionIds.filter(posId => selectedPositionIds.has(posId));
            console.log('🔍 Candidate position IDs:', candidatePositionIds);
            console.log('🔍 Valid candidates:', validCandidates);
            if (validCandidates.length === 0) {
                throw new common_1.BadRequestException('Selected candidates must belong to the selected positions');
            }
            const positionsWithCandidates = new Set(candidatePositionIds);
            const positionsWithoutCandidates = positionIds.filter(posId => !positionsWithCandidates.has(posId));
            console.log('🔍 Positions with candidates:', Array.from(positionsWithCandidates));
            console.log('🔍 Positions without candidates:', positionsWithoutCandidates);
            if (positionsWithoutCandidates.length > 0) {
                throw new common_1.BadRequestException('Each selected position must have at least one candidate');
            }
            const id = this.generateId();
            return this.prisma.$transaction(async (tx) => {
                const ballot = await tx.ballot.create({
                    data: {
                        id,
                        Ballot_Title,
                        Ballot_Description,
                        Ballot_StartDate: startDate,
                        Ballot_EndDate: endDate,
                        Ballot_Status: client_1.BallotStatus.DRAFT,
                        Ballot_IsActive: false,
                        Ballot_MaxVotesPerUser: 1,
                        Ballot_AllowMultipleVotes: false,
                        Ballot_RequireAllPositions: Ballot_RequireAllPositions || true,
                        Ballot_ShowResults: Ballot_ShowResults !== undefined ? Ballot_ShowResults : true,
                        Ballot_ShowResultsAfter: Ballot_ShowResultsAfter ? new Date(Ballot_ShowResultsAfter) : null,
                        Ballot_ShowLiveResults: Ballot_ShowLiveResults !== undefined ? Ballot_ShowLiveResults : true,
                        Ballot_AllowAbstain: Ballot_AllowAbstain !== undefined ? Ballot_AllowAbstain : false,
                        Ballot_CreatedBy: createdBy,
                    },
                });
                if (positionIds && positionIds.length > 0) {
                    await Promise.all(positionIds.map((positionId, index) => tx.ballotPosition.create({
                        data: {
                            id: this.generateId(),
                            BallotPosition_BallotId: ballot.id,
                            BallotPosition_PositionId: positionId,
                            BallotPosition_DisplayOrder: index,
                            BallotPosition_IsRequired: true,
                        },
                    })));
                }
                if (candidateIds && candidateIds.length > 0) {
                    for (const candidateId of candidateIds) {
                        const candidate = await tx.candidate.findUnique({
                            where: { id: candidateId },
                            select: { positionId: true }
                        });
                        if (candidate) {
                            await tx.ballotCandidate.create({
                                data: {
                                    id: this.generateId(),
                                    BallotCandidate_BallotId: ballot.id,
                                    BallotCandidate_CandidateId: candidateId,
                                    BallotCandidate_PositionId: candidate.positionId,
                                    BallotCandidate_IsActive: true,
                                },
                            });
                        }
                    }
                }
                return ballot;
            });
        }
        catch (error) {
            console.error('❌ Error creating ballot:', error);
            console.error('❌ Error details:', error.message);
            console.error('❌ Stack trace:', error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create ballot: ' + (error.message || 'Unknown error'));
        }
    }
    async getBallots(filters) {
        const where = {};
        if (filters?.status) {
            where.Ballot_Status = filters.status;
        }
        if (filters?.isActive !== undefined) {
            where.Ballot_IsActive = filters.isActive;
        }
        if (filters?.createdBy) {
            where.Ballot_CreatedBy = filters.createdBy;
        }
        return this.prisma.ballot.findMany({
            where: {
                ...where,
                Ballot_IsDeleted: false,
            },
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
                ballotPositions: {
                    include: {
                        position: true,
                    },
                    orderBy: {
                        BallotPosition_DisplayOrder: 'asc',
                    },
                },
                ballotCandidates: {
                    include: {
                        candidate: {
                            include: {
                                position: true,
                                department: true,
                                course: true,
                                partyList: true,
                            },
                        },
                    },
                },
                results: true,
                _count: {
                    select: {
                        votes: true,
                        userHistory: true,
                    },
                },
            },
            orderBy: {
                Ballot_CreatedAt: 'desc',
            },
        });
    }
    async getBallotById(id) {
        const ballot = await this.prisma.ballot.findUnique({
            where: {
                id,
                Ballot_IsDeleted: false,
            },
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
                ballotPositions: {
                    include: {
                        position: true,
                    },
                    orderBy: {
                        BallotPosition_DisplayOrder: 'asc',
                    },
                },
                ballotCandidates: {
                    include: {
                        candidate: {
                            include: {
                                position: true,
                                department: true,
                                course: true,
                                partyList: true,
                            },
                        },
                    },
                },
                results: {
                    include: {
                        resultDetails: {
                            include: {
                                candidate: true,
                                position: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        votes: true,
                        userHistory: true,
                    },
                },
            },
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        return ballot;
    }
    async updateBallot(id, updateBallotDto, updatedBy) {
        const ballot = await this.getBallotById(id);
        if (ballot.Ballot_Status === client_1.BallotStatus.ACTIVE) {
            throw new common_1.ForbiddenException('Cannot update active ballot');
        }
        if (ballot.Ballot_Status === client_1.BallotStatus.ENDED) {
            throw new common_1.ForbiddenException('Cannot update ended ballot');
        }
        const updateData = {};
        if (updateBallotDto.Ballot_Title) {
            updateData.Ballot_Title = updateBallotDto.Ballot_Title;
        }
        if (updateBallotDto.Ballot_Description !== undefined) {
            updateData.Ballot_Description = updateBallotDto.Ballot_Description;
        }
        if (updateBallotDto.Ballot_StartDate) {
            updateData.Ballot_StartDate = new Date(updateBallotDto.Ballot_StartDate);
        }
        if (updateBallotDto.Ballot_EndDate) {
            updateData.Ballot_EndDate = new Date(updateBallotDto.Ballot_EndDate);
        }
        if (updateBallotDto.Ballot_RequireAllPositions !== undefined) {
            updateData.Ballot_RequireAllPositions = updateBallotDto.Ballot_RequireAllPositions;
        }
        if (updateBallotDto.Ballot_ShowResults !== undefined) {
            updateData.Ballot_ShowResults = updateBallotDto.Ballot_ShowResults;
        }
        if (updateBallotDto.Ballot_ShowResultsAfter !== undefined) {
            updateData.Ballot_ShowResultsAfter = updateBallotDto.Ballot_ShowResultsAfter ? new Date(updateBallotDto.Ballot_ShowResultsAfter) : null;
        }
        if (updateBallotDto.Ballot_ShowLiveResults !== undefined) {
            updateData.Ballot_ShowLiveResults = updateBallotDto.Ballot_ShowLiveResults;
        }
        if (updateBallotDto.Ballot_AllowAbstain !== undefined) {
            updateData.Ballot_AllowAbstain = updateBallotDto.Ballot_AllowAbstain;
        }
        return this.prisma.ballot.update({
            where: { id },
            data: updateData,
            include: {
                createdByAdmin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
                ballotPositions: {
                    include: {
                        position: true,
                    },
                    orderBy: {
                        BallotPosition_DisplayOrder: 'asc',
                    },
                },
                ballotCandidates: {
                    include: {
                        candidate: {
                            include: {
                                position: true,
                                department: true,
                                course: true,
                                partyList: true,
                            },
                        },
                    },
                },
                results: true,
                _count: {
                    select: {
                        votes: true,
                        userHistory: true,
                    },
                },
            },
        });
    }
    async deleteBallot(id, deletedBy) {
        console.log('🗑️ Delete ballot request:', { id, deletedBy });
        const ballot = await this.getBallotById(id);
        console.log('🗑️ Found ballot:', {
            id: ballot.id,
            status: ballot.Ballot_Status,
            title: ballot.Ballot_Title
        });
        if (ballot.Ballot_Status === client_1.BallotStatus.ACTIVE) {
            throw new common_1.ForbiddenException('Cannot delete active ballot');
        }
        return this.prisma.ballot.update({
            where: { id },
            data: {
                Ballot_IsDeleted: true,
                Ballot_DeletedAt: new Date(),
            },
        });
    }
    async activateBallot(id, activatedBy) {
        const ballot = await this.getBallotById(id);
        if (ballot.Ballot_Status !== client_1.BallotStatus.DRAFT && ballot.Ballot_Status !== client_1.BallotStatus.SCHEDULED && ballot.Ballot_Status !== client_1.BallotStatus.PAUSED) {
            throw new common_1.BadRequestException('Only draft, scheduled, or paused ballots can be activated');
        }
        const now = new Date();
        if (new Date(ballot.Ballot_EndDate) <= now) {
            throw new common_1.BadRequestException('Cannot activate ballot with end date in the past');
        }
        const updateData = {
            Ballot_Status: client_1.BallotStatus.ACTIVE,
            Ballot_IsActive: true,
        };
        if (ballot.Ballot_Status === client_1.BallotStatus.PAUSED) {
        }
        else {
            updateData.Ballot_StartDate = now;
        }
        return this.prisma.ballot.update({
            where: { id },
            data: updateData,
        });
    }
    async pauseBallot(id, pausedBy) {
        const ballot = await this.getBallotById(id);
        console.log('🔍 Pause ballot debug:', {
            ballotId: id,
            currentStatus: ballot.Ballot_Status,
            isActive: ballot.Ballot_IsActive,
            pausedBy: pausedBy
        });
        if (ballot.Ballot_Status !== client_1.BallotStatus.ACTIVE) {
            throw new common_1.BadRequestException(`Only active ballots can be paused. Current status: ${ballot.Ballot_Status}`);
        }
        return this.prisma.ballot.update({
            where: { id },
            data: {
                Ballot_Status: client_1.BallotStatus.PAUSED,
                Ballot_IsActive: false,
            },
        });
    }
    async endBallot(id, endedBy) {
        const ballot = await this.getBallotById(id);
        if (ballot.Ballot_Status !== client_1.BallotStatus.ACTIVE && ballot.Ballot_Status !== client_1.BallotStatus.PAUSED) {
            throw new common_1.BadRequestException('Only active or paused ballots can be ended');
        }
        return this.prisma.ballot.update({
            where: { id },
            data: {
                Ballot_Status: client_1.BallotStatus.ENDED,
                Ballot_IsActive: false,
                Ballot_EndDate: new Date(),
            },
        });
    }
    async cancelBallot(id, cancelledBy) {
        const ballot = await this.getBallotById(id);
        if (ballot.Ballot_Status === client_1.BallotStatus.ENDED) {
            throw new common_1.BadRequestException('Cannot cancel an already ended ballot');
        }
        return this.prisma.ballot.update({
            where: { id },
            data: {
                Ballot_Status: client_1.BallotStatus.CANCELLED,
                Ballot_IsActive: false,
            },
        });
    }
    async getAvailableBallotsForUser(userId) {
        const now = new Date();
        return this.prisma.ballot.findMany({
            where: {
                Ballot_IsDeleted: false,
                Ballot_IsActive: true,
                Ballot_Status: client_1.BallotStatus.ACTIVE,
                Ballot_StartDate: { lte: now },
                Ballot_EndDate: { gte: now },
            },
            include: {
                ballotPositions: {
                    include: {
                        position: true,
                    },
                    orderBy: {
                        BallotPosition_DisplayOrder: 'asc',
                    },
                },
                ballotCandidates: {
                    include: {
                        candidate: {
                            include: {
                                position: true,
                                department: true,
                                course: true,
                                partyList: true,
                            },
                        },
                    },
                },
                userHistory: {
                    where: {
                        UserBallotHistory_UserId: userId,
                    },
                },
                _count: {
                    select: {
                        votes: true,
                        userHistory: true,
                    },
                },
            },
            orderBy: {
                Ballot_StartDate: 'asc',
            },
        });
    }
    async getUpcomingBallotsForUser(userId) {
        const now = new Date();
        return this.prisma.ballot.findMany({
            where: {
                Ballot_IsDeleted: false,
                Ballot_IsActive: false,
                Ballot_Status: { in: [client_1.BallotStatus.DRAFT, client_1.BallotStatus.SCHEDULED] },
                Ballot_StartDate: { gt: now },
            },
            include: {
                ballotPositions: {
                    include: {
                        position: true,
                    },
                    orderBy: {
                        BallotPosition_DisplayOrder: 'asc',
                    },
                },
                ballotCandidates: {
                    include: {
                        candidate: {
                            include: {
                                position: true,
                                department: true,
                                course: true,
                                partyList: true,
                            },
                        },
                    },
                },
                userHistory: {
                    where: {
                        UserBallotHistory_UserId: userId,
                    },
                },
                _count: {
                    select: {
                        votes: true,
                        userHistory: true,
                    },
                },
            },
            orderBy: {
                Ballot_StartDate: 'asc',
            },
        });
    }
    async getUserBallotHistory(userId) {
        return this.prisma.userBallotHistory.findMany({
            where: {
                UserBallotHistory_UserId: userId,
                ballot: {
                    Ballot_IsDeleted: false,
                },
            },
            include: {
                ballot: {
                    include: {
                        ballotPositions: {
                            include: {
                                position: true,
                            },
                        },
                        results: true,
                    },
                },
            },
            orderBy: {
                UserBallotHistory_LastAccessed: 'desc',
            },
        });
    }
    async castBallotVote(voteData, userId) {
        try {
            console.log('🗳️ Casting ballot vote:', voteData);
            console.log('👤 User ID:', userId);
            const { ballotId, votes } = voteData;
            const ballot = await this.prisma.ballot.findUnique({
                where: {
                    id: ballotId,
                    Ballot_IsDeleted: false
                },
                include: {
                    ballotPositions: {
                        include: {
                            position: true
                        }
                    },
                    ballotCandidates: {
                        include: {
                            candidate: {
                                include: {
                                    partyList: true
                                }
                            }
                        }
                    }
                }
            });
            if (!ballot) {
                throw new common_1.BadRequestException('Ballot not found');
            }
            if (!ballot.Ballot_IsActive || ballot.Ballot_Status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Ballot is not active');
            }
            const now = new Date();
            if (now < ballot.Ballot_StartDate || now > ballot.Ballot_EndDate) {
                throw new common_1.BadRequestException('Ballot is not within voting period');
            }
            const existingHistory = await this.prisma.userBallotHistory.findUnique({
                where: {
                    UserBallotHistory_UserId_UserBallotHistory_BallotId: {
                        UserBallotHistory_UserId: userId,
                        UserBallotHistory_BallotId: ballotId
                    }
                }
            });
            if (existingHistory && existingHistory.UserBallotHistory_IsCompleted) {
                throw new common_1.ConflictException('User has already completed voting for this ballot');
            }
            if (!votes || !Array.isArray(votes) || votes.length === 0) {
                throw new common_1.BadRequestException('No votes provided');
            }
            for (const vote of votes) {
                const { positionId, candidateId } = vote;
                const ballotPosition = ballot.ballotPositions.find(bp => bp.BallotPosition_PositionId === positionId);
                if (!ballotPosition) {
                    throw new common_1.BadRequestException(`Position ${positionId} is not in this ballot`);
                }
                const ballotCandidate = ballot.ballotCandidates.find(bc => bc.BallotCandidate_CandidateId === candidateId &&
                    bc.BallotCandidate_PositionId === positionId);
                if (!ballotCandidate) {
                    throw new common_1.BadRequestException(`Candidate ${candidateId} is not valid for position ${positionId} in this ballot`);
                }
            }
            const electionIdValue = ballot.electionId;
            return await this.prisma.$transaction(async (tx) => {
                const createdVotes = [];
                for (const vote of votes) {
                    const { positionId, candidateId } = vote;
                    const voteData_create = {
                        id: this.generateId(),
                        voter: { connect: { id: userId } },
                        candidate: { connect: { id: candidateId } },
                        position: { connect: { id: positionId } },
                        ballot: { connect: { id: ballotId } },
                        ipAddress: voteData.ipAddress || null,
                        userAgent: voteData.userAgent || null,
                        sessionId: voteData.sessionId || null,
                    };
                    if (electionIdValue) {
                        voteData_create.election = { connect: { id: electionIdValue } };
                    }
                    const voteRecord = await tx.vote.create({
                        data: voteData_create,
                        include: {
                            voter: {
                                select: {
                                    id: true,
                                    Voter_Name: true,
                                    Voter_StudentId: true,
                                }
                            },
                            candidate: {
                                select: {
                                    id: true,
                                    Candidate_Name: true,
                                    Candidate_StudentId: true,
                                }
                            },
                            position: {
                                select: {
                                    id: true,
                                    Position_Title: true,
                                }
                            }
                        }
                    });
                    createdVotes.push(voteRecord);
                }
                const totalVotes = createdVotes.length;
                await tx.userBallotHistory.upsert({
                    where: {
                        UserBallotHistory_UserId_UserBallotHistory_BallotId: {
                            UserBallotHistory_UserId: userId,
                            UserBallotHistory_BallotId: ballotId
                        }
                    },
                    update: {
                        UserBallotHistory_VotedAt: new Date(),
                        UserBallotHistory_VoteCount: totalVotes,
                        UserBallotHistory_IsCompleted: true,
                        UserBallotHistory_LastAccessed: new Date(),
                    },
                    create: {
                        id: this.generateId(),
                        UserBallotHistory_UserId: userId,
                        UserBallotHistory_BallotId: ballotId,
                        UserBallotHistory_VotedAt: new Date(),
                        UserBallotHistory_VoteCount: totalVotes,
                        UserBallotHistory_IsCompleted: true,
                        UserBallotHistory_LastAccessed: new Date(),
                    }
                });
                return {
                    message: 'Vote cast successfully!',
                    votes: createdVotes,
                    totalVotes: totalVotes,
                    ballot: {
                        id: ballot.id,
                        title: ballot.Ballot_Title,
                        status: ballot.Ballot_Status
                    }
                };
            });
        }
        catch (error) {
            console.error('❌ Error casting ballot vote:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to cast vote: ' + (error.message || 'Unknown error'));
        }
    }
    async getBallotResults(ballotId) {
        try {
            console.log('📊 Fetching results for ballot:', ballotId);
            const ballot = await this.prisma.ballot.findUnique({
                where: { id: ballotId },
                include: {
                    ballotPositions: {
                        include: {
                            position: true
                        }
                    },
                    ballotCandidates: {
                        include: {
                            candidate: {
                                include: {
                                    partyList: true
                                }
                            }
                        }
                    }
                }
            });
            if (!ballot) {
                throw new common_1.NotFoundException('Ballot not found');
            }
            const results = [];
            for (const ballotPosition of ballot.ballotPositions) {
                const positionId = ballotPosition.BallotPosition_PositionId;
                const candidates = ballot.ballotCandidates.filter(bc => bc.BallotCandidate_PositionId === positionId);
                const candidateResults = [];
                let totalVotes = 0;
                for (const candidate of candidates) {
                    const voteCount = await this.prisma.vote.count({
                        where: {
                            ballotId: ballotId,
                            positionId: positionId,
                            candidateId: candidate.BallotCandidate_CandidateId
                        }
                    });
                    candidateResults.push({
                        candidateId: candidate.BallotCandidate_CandidateId,
                        candidateName: candidate.candidate.Candidate_Name,
                        candidateStudentId: candidate.candidate.Candidate_StudentId,
                        voteCount: voteCount
                    });
                    totalVotes += voteCount;
                }
                results.push({
                    positionId: positionId,
                    positionTitle: ballotPosition.position.Position_Title,
                    totalVotes: totalVotes,
                    candidates: candidateResults.sort((a, b) => b.voteCount - a.voteCount)
                });
            }
            const totalParticipants = await this.prisma.userBallotHistory.count({
                where: {
                    UserBallotHistory_BallotId: ballotId,
                    UserBallotHistory_IsCompleted: true
                }
            });
            return {
                ballot: {
                    id: ballot.id,
                    title: ballot.Ballot_Title,
                    description: ballot.Ballot_Description,
                    status: ballot.Ballot_Status,
                    isActive: ballot.Ballot_IsActive,
                    startDate: ballot.Ballot_StartDate,
                    endDate: ballot.Ballot_EndDate
                },
                results: results,
                totalParticipants: totalParticipants,
                generatedAt: new Date()
            };
        }
        catch (error) {
            console.error('❌ Error fetching ballot results:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch ballot results: ' + (error.message || 'Unknown error'));
        }
    }
    generateId() {
        const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `${firstPart}-${secondPart}`;
    }
    async bulkActivateBallots(ballotIds, activatedBy) {
        const results = [];
        for (const ballotId of ballotIds) {
            try {
                const result = await this.activateBallot(ballotId, activatedBy);
                results.push({ ballotId, success: true, ballot: result });
            }
            catch (error) {
                results.push({
                    ballotId,
                    success: false,
                    error: error.message
                });
            }
        }
        return {
            totalProcessed: ballotIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
    async bulkPauseBallots(ballotIds, pausedBy) {
        const results = [];
        for (const ballotId of ballotIds) {
            try {
                const result = await this.pauseBallot(ballotId, pausedBy);
                results.push({ ballotId, success: true, ballot: result });
            }
            catch (error) {
                results.push({
                    ballotId,
                    success: false,
                    error: error.message
                });
            }
        }
        return {
            totalProcessed: ballotIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
    async bulkEndBallots(ballotIds, endedBy) {
        const results = [];
        for (const ballotId of ballotIds) {
            try {
                const result = await this.endBallot(ballotId, endedBy);
                results.push({ ballotId, success: true, ballot: result });
            }
            catch (error) {
                results.push({
                    ballotId,
                    success: false,
                    error: error.message
                });
            }
        }
        return {
            totalProcessed: ballotIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
    async bulkDeleteBallots(ballotIds, deletedBy) {
        const results = [];
        for (const ballotId of ballotIds) {
            try {
                const result = await this.deleteBallot(ballotId, deletedBy);
                results.push({ ballotId, success: true, ballot: result });
            }
            catch (error) {
                results.push({
                    ballotId,
                    success: false,
                    error: error.message
                });
            }
        }
        return {
            totalProcessed: ballotIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
    async bulkUpdateBallotStatus(ballotIds, status, updatedBy) {
        const results = [];
        for (const ballotId of ballotIds) {
            try {
                let result;
                switch (status) {
                    case client_1.BallotStatus.ACTIVE:
                        result = await this.activateBallot(ballotId, updatedBy);
                        break;
                    case client_1.BallotStatus.PAUSED:
                        result = await this.pauseBallot(ballotId, updatedBy);
                        break;
                    case client_1.BallotStatus.ENDED:
                        result = await this.endBallot(ballotId, updatedBy);
                        break;
                    case client_1.BallotStatus.CANCELLED:
                        result = await this.cancelBallot(ballotId, updatedBy);
                        break;
                    default:
                        throw new common_1.BadRequestException(`Invalid status for bulk update: ${status}`);
                }
                results.push({ ballotId, success: true, ballot: result });
            }
            catch (error) {
                results.push({
                    ballotId,
                    success: false,
                    error: error.message
                });
            }
        }
        return {
            totalProcessed: ballotIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
    async createBallotFromTemplate(ballotData, createdBy) {
        console.log('🔍 Ballot Service - createBallotFromTemplate called');
        console.log('📊 Ballot Data:', ballotData);
        console.log('👤 Created By:', createdBy);
        console.log('📋 Ballot Data Debug:', {
            title: ballotData.Ballot_Title,
            description: ballotData.Ballot_Description,
            startDate: ballotData.Ballot_StartDate,
            endDate: ballotData.Ballot_EndDate,
            templateId: ballotData.templateId,
            requireAllPositions: ballotData.Ballot_RequireAllPositions,
            showResults: ballotData.Ballot_ShowResults,
            showLiveResults: ballotData.Ballot_ShowLiveResults
        });
        const { Ballot_Title, Ballot_Description, Ballot_StartDate, Ballot_EndDate, Ballot_RequireAllPositions, Ballot_ShowResults, Ballot_ShowResultsAfter, Ballot_ShowLiveResults, templateId } = ballotData;
        if (!Ballot_Title || !Ballot_StartDate || !Ballot_EndDate) {
            throw new common_1.BadRequestException('Title, start date, and end date are required');
        }
        const startDate = new Date(Ballot_StartDate);
        const endDate = new Date(Ballot_EndDate);
        console.log('🕐 Date Validation Debug:', {
            originalStartDate: Ballot_StartDate,
            originalEndDate: Ballot_EndDate,
            parsedStartDate: startDate.toISOString(),
            parsedEndDate: endDate.toISOString(),
            startDatePhilippine: (0, timezone_util_1.toPhilippineTime)(startDate).toISOString(),
            currentPhilippineTime: (0, timezone_util_1.getPhilippineTime)().toISOString(),
            isStartDateValid: (0, timezone_util_1.isFuturePhilippineTime)((0, timezone_util_1.toPhilippineTime)(startDate), 1)
        });
        if (startDate >= endDate) {
            console.log('❌ Date validation failed: Start date >= End date');
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        const startDatePhilippine = (0, timezone_util_1.toPhilippineTime)(startDate);
        if (!(0, timezone_util_1.isFuturePhilippineTime)(startDatePhilippine, 1)) {
            const philippineTime = (0, timezone_util_1.getPhilippineTime)();
            console.log('❌ Date validation failed: Start date not in future');
            throw new common_1.BadRequestException(`Start date must be at least 1 minute in the future. Current Philippine time: ${philippineTime.toISOString()}, Start time: ${startDatePhilippine.toISOString()}`);
        }
        console.log('✅ Date validation passed');
        let templateData = null;
        if (templateId) {
            const template = await this.prisma.ballotTemplate.findUnique({
                where: { id: templateId }
            });
            if (!template) {
                throw new common_1.BadRequestException('Template not found');
            }
            templateData = template.BallotTemplate_Data;
            console.log('📋 Template Data:', templateData);
        }
        console.log('🏗️ Creating ballot with data:', {
            title: Ballot_Title,
            description: Ballot_Description,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            showResultsAfter: Ballot_ShowResultsAfter ? new Date(Ballot_ShowResultsAfter).toISOString() : null,
            requireAllPositions: Ballot_RequireAllPositions,
            showResults: Ballot_ShowResults,
            showLiveResults: Ballot_ShowLiveResults,
            createdBy: createdBy,
            hasTemplate: !!templateData
        });
        return this.prisma.$transaction(async (tx) => {
            const ballot = await tx.ballot.create({
                data: {
                    id: this.generateId(),
                    Ballot_Title,
                    Ballot_Description: Ballot_Description || '',
                    Ballot_StartDate: startDate,
                    Ballot_EndDate: endDate,
                    Ballot_RequireAllPositions: Ballot_RequireAllPositions !== false,
                    Ballot_ShowResults: Ballot_ShowResults !== false,
                    Ballot_ShowResultsAfter: Ballot_ShowResultsAfter ? new Date(Ballot_ShowResultsAfter) : null,
                    Ballot_ShowLiveResults: Ballot_ShowLiveResults !== false,
                    Ballot_AllowAbstain: ballotData.Ballot_AllowAbstain !== undefined ? ballotData.Ballot_AllowAbstain : false,
                    Ballot_Status: client_1.BallotStatus.DRAFT,
                    Ballot_IsActive: false,
                    Ballot_CreatedBy: createdBy,
                },
            });
            if (templateData && templateData.positions && Array.isArray(templateData.positions)) {
                console.log('📋 Processing positions from template:', templateData.positions.length);
                const processedPositions = await Promise.all(templateData.positions.map(async (positionData) => {
                    let position = await tx.position.findFirst({
                        where: {
                            Position_Title: positionData.positionTitle,
                            voteLimit: positionData.voteLimit || 1
                        }
                    });
                    if (!position) {
                        console.log(`🆕 Creating new position: ${positionData.positionTitle}`);
                        position = await tx.position.create({
                            data: {
                                id: this.generateId(),
                                Position_Title: positionData.positionTitle,
                                Position_Description: `Position for ${positionData.positionTitle}`,
                                voteLimit: positionData.voteLimit || 1,
                                displayOrder: positionData.displayOrder || 1,
                            },
                        });
                    }
                    else {
                        console.log(`♻️ Reusing existing position: ${positionData.positionTitle}`);
                    }
                    await tx.ballotPosition.create({
                        data: {
                            id: this.generateId(),
                            BallotPosition_BallotId: ballot.id,
                            BallotPosition_PositionId: position.id,
                            BallotPosition_DisplayOrder: positionData.displayOrder || 1,
                            BallotPosition_IsRequired: positionData.isRequired !== false,
                        },
                    });
                    return position;
                }));
                console.log(`✅ Processed ${processedPositions.length} positions from template`);
            }
            console.log('✅ Ballot created successfully:', ballot.id);
            return ballot;
        });
    }
    async checkAndAutoStartBallots() {
        try {
            console.log('🔍 Checking for ballots that should start...');
            const now = new Date();
            const ballotsToStart = await this.prisma.ballot.findMany({
                where: {
                    Ballot_Status: { in: ['DRAFT', 'SCHEDULED'] },
                    Ballot_IsActive: false,
                    Ballot_StartDate: { lte: now },
                    Ballot_EndDate: { gt: now },
                    Ballot_IsDeleted: false,
                },
            });
            console.log(`📊 Found ${ballotsToStart.length} ballots ready to start`);
            const autoStartedBallots = [];
            for (const ballot of ballotsToStart) {
                try {
                    console.log(`🔄 Auto-starting ballot: ${ballot.Ballot_Title} (${ballot.id})`);
                    const updatedBallot = await this.prisma.ballot.update({
                        where: { id: ballot.id },
                        data: {
                            Ballot_Status: client_1.BallotStatus.ACTIVE,
                            Ballot_IsActive: true,
                            Ballot_StartDate: now,
                        }
                    });
                    autoStartedBallots.push(updatedBallot);
                    console.log(`✅ Auto-started ballot: ${ballot.Ballot_Title}`);
                }
                catch (error) {
                    console.error(`❌ Error auto-starting ballot ${ballot.id}:`, error);
                }
            }
            return {
                autoStartedBallots,
                totalChecked: ballotsToStart.length
            };
        }
        catch (error) {
            console.error('❌ Error in checkAndAutoStartBallots:', error);
            return {
                autoStartedBallots: [],
                totalChecked: 0
            };
        }
    }
    async checkAndAutoEndBallots() {
        try {
            console.log('🔍 Checking for expired ballots...');
            const now = new Date();
            const expiredBallots = await this.prisma.ballot.findMany({
                where: {
                    Ballot_Status: 'ACTIVE',
                    Ballot_EndDate: {
                        lt: now
                    },
                    Ballot_IsDeleted: false
                },
                include: {
                    _count: {
                        select: {
                            votes: true,
                            userHistory: true
                        }
                    }
                }
            });
            console.log(`📊 Found ${expiredBallots.length} expired ballots`);
            const autoEndedBallots = [];
            for (const ballot of expiredBallots) {
                try {
                    console.log(`🔄 Auto-ending ballot: ${ballot.Ballot_Title} (${ballot.id})`);
                    const updatedBallot = await this.prisma.ballot.update({
                        where: { id: ballot.id },
                        data: {
                            Ballot_Status: client_1.BallotStatus.ENDED,
                            Ballot_IsActive: false
                        }
                    });
                    autoEndedBallots.push(updatedBallot);
                    console.log(`✅ Auto-ended ballot: ${ballot.Ballot_Title}`);
                }
                catch (error) {
                    console.error(`❌ Error auto-ending ballot ${ballot.id}:`, error);
                }
            }
            return {
                autoEndedBallots,
                totalChecked: expiredBallots.length
            };
        }
        catch (error) {
            console.error('❌ Error checking for expired ballots:', error);
            throw error;
        }
    }
};
exports.BallotService = BallotService;
exports.BallotService = BallotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BallotService);
//# sourceMappingURL=ballot.service.js.map