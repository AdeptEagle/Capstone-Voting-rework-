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
exports.VoteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../services/audit.service");
const id_generator_service_1 = require("../utils/id-generator.service");
const voting_gateway_1 = require("../websocket/voting.gateway");
let VoteService = class VoteService {
    constructor(prisma, auditService, idGenerator, votingGateway) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.idGenerator = idGenerator;
        this.votingGateway = votingGateway;
    }
    async getVoteById(id) {
        const vote = await this.prisma.vote.findUnique({
            where: { id },
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_Email: true,
                        Voter_StudentId: true,
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
                            },
                        },
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                        Candidate_Email: true,
                        photo: true,
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                                displayOrder: true,
                            },
                        },
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
                            },
                        },
                        partyList: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        displayOrder: true,
                        voteLimit: true,
                    },
                },
                ballot: {
                    select: {
                        id: true,
                        Ballot_Title: true,
                        Ballot_Description: true,
                        Ballot_Status: true,
                    },
                },
            },
        });
        if (!vote) {
            throw new common_1.NotFoundException('Vote not found');
        }
        return vote;
    }
    async createVote(createVoteDto) {
        const { voterId, candidateId, ballotId, positionId } = createVoteDto;
        const ballot = await this.prisma.ballot.findUnique({
            where: { id: ballotId },
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        if (ballot.Ballot_Status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Ballot is not active');
        }
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        if (voter.hasVoted) {
            throw new common_1.BadRequestException('Voter has already voted');
        }
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                ballotCandidates: {
                    where: { BallotCandidate_BallotId: ballotId },
                },
            },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (candidate.ballotCandidates.length === 0) {
            throw new common_1.BadRequestException('Candidate is not in this ballot');
        }
        const position = await this.prisma.position.findUnique({
            where: { id: positionId },
            include: {
                ballotPositions: {
                    where: { BallotPosition_BallotId: ballotId },
                },
            },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        if (position.ballotPositions.length === 0) {
            throw new common_1.BadRequestException('Position is not in this ballot');
        }
        const existingVote = await this.prisma.vote.findFirst({
            where: {
                voterId,
                ballotId,
                positionId,
            },
        });
        if (existingVote) {
            throw new common_1.BadRequestException('Voter has already voted for this position');
        }
        const currentVoteCount = await this.prisma.vote.count({
            where: {
                ballotId,
                positionId,
            },
        });
        if (position.voteLimit && currentVoteCount >= position.voteLimit) {
            throw new common_1.BadRequestException('Vote limit reached for this position');
        }
        const customId = await this.idGenerator.generateVoteId();
        const verificationCode = this.auditService.generateVerificationCode();
        const auditHash = this.auditService.generateAuditHash({
            voterId,
            ballotId,
            candidateId,
            timestamp: new Date(),
        });
        return await this.prisma.$transaction(async (prisma) => {
            const vote = await prisma.vote.create({
                data: {
                    id: customId,
                    voterId,
                    candidateId,
                    ballotId,
                    positionId,
                    ipAddress: createVoteDto.ipAddress,
                    userAgent: createVoteDto.userAgent,
                    sessionId: createVoteDto.sessionId,
                    verificationCode,
                    auditHash,
                },
                include: {
                    voter: true,
                    candidate: true,
                    position: true,
                    ballot: true,
                },
            });
            await prisma.voter.update({
                where: { id: voterId },
                data: { hasVoted: true },
            });
            return vote;
        });
    }
    async getVotesByBallot(ballotId) {
        return await this.prisma.vote.findMany({
            where: { ballotId },
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_Email: true,
                        Voter_StudentId: true,
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
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                        photo: true,
                        position: {
                            select: {
                                Position_Title: true,
                                displayOrder: true,
                            },
                        },
                        partyList: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        displayOrder: true,
                    },
                },
            },
            orderBy: [
                { position: { displayOrder: 'asc' } },
                { createdAt: 'desc' },
            ],
        });
    }
    async getVotesByVoter(voterId) {
        return await this.prisma.vote.findMany({
            where: { voterId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        photo: true,
                        position: {
                            select: {
                                Position_Title: true,
                                displayOrder: true,
                            },
                        },
                        partyList: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        displayOrder: true,
                    },
                },
                ballot: {
                    select: {
                        id: true,
                        Ballot_Title: true,
                        Ballot_Status: true,
                    },
                },
            },
            orderBy: [
                { position: { displayOrder: 'asc' } },
                { createdAt: 'desc' },
            ],
        });
    }
    async getVoteResults(ballotId) {
        const votes = await this.prisma.vote.findMany({
            where: { ballotId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        photo: true,
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                                displayOrder: true,
                            },
                        },
                        partyList: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        displayOrder: true,
                    },
                },
            },
        });
        const results = {};
        votes.forEach(vote => {
            const positionId = vote.position.id;
            const candidateId = vote.candidate.id;
            if (!results[positionId]) {
                results[positionId] = {
                    position: vote.position,
                    candidates: {},
                };
            }
            if (!results[positionId].candidates[candidateId]) {
                results[positionId].candidates[candidateId] = {
                    candidate: vote.candidate,
                    voteCount: 0,
                };
            }
            results[positionId].candidates[candidateId].voteCount++;
        });
        const formattedResults = Object.values(results).map(positionResult => ({
            position: 'Position Title',
            candidates: [],
        }));
        return formattedResults;
    }
    async getComprehensiveVoteAnalytics(ballotId) {
        const votes = await this.prisma.vote.findMany({
            where: { ballotId },
            include: {
                voter: {
                    select: {
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
                candidate: {
                    select: {
                        position: {
                            select: {
                                Position_Title: true,
                                displayOrder: true,
                            },
                        },
                        partyList: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        const totalVotes = votes.length;
        const uniqueVoters = new Set(votes.map(v => v.voterId)).size;
        const departmentVotes = {};
        votes.forEach(vote => {
            const deptName = vote.voter.department?.Department_Name || 'Unknown';
            if (!departmentVotes[deptName]) {
                departmentVotes[deptName] = 0;
            }
            departmentVotes[deptName]++;
        });
        const positionVotes = {};
        votes.forEach(vote => {
            const positionTitle = vote.candidate.position.Position_Title;
            if (!positionVotes[positionTitle]) {
                positionVotes[positionTitle] = 0;
            }
            positionVotes[positionTitle]++;
        });
        const partyVotes = {};
        votes.forEach(vote => {
            const partyName = vote.candidate.partyList?.name || 'Independent';
            if (!partyVotes[partyName]) {
                partyVotes[partyName] = 0;
            }
            partyVotes[partyName]++;
        });
        return {
            totalVotes,
            uniqueVoters,
            departmentBreakdown: departmentVotes,
            positionBreakdown: positionVotes,
            partyBreakdown: partyVotes,
            timestamp: new Date(),
        };
    }
    async getDepartmentVotingResults(ballotId) {
        const votes = await this.prisma.vote.findMany({
            where: { ballotId },
            include: {
                voter: {
                    select: {
                        department: {
                            select: {
                                Department_Name: true,
                            },
                        },
                    },
                },
                candidate: {
                    select: {
                        Candidate_Name: true,
                        position: {
                            select: {
                                Position_Title: true,
                                displayOrder: true,
                            },
                        },
                    },
                },
            },
        });
        const departmentResults = {};
        votes.forEach(vote => {
            const deptName = vote.voter.department?.Department_Name || 'Unknown';
            if (!departmentResults[deptName]) {
                departmentResults[deptName] = {
                    department: deptName,
                    votes: [],
                    totalVotes: 0,
                };
            }
            departmentResults[deptName].votes.push({
                candidate: vote.candidate.Candidate_Name,
                position: vote.candidate.position.Position_Title,
                positionOrder: vote.candidate.position.displayOrder,
            });
            departmentResults[deptName].totalVotes++;
        });
        return Object.values(departmentResults);
    }
    async deleteVote(id) {
        const vote = await this.prisma.vote.findUnique({
            where: { id },
        });
        if (!vote) {
            throw new common_1.NotFoundException('Vote not found');
        }
        return await this.prisma.vote.delete({
            where: { id },
        });
    }
    async resetVoterStatus(voterId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId }
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        return await this.prisma.voter.update({
            where: { id: voterId },
            data: {
                hasVoted: false,
            },
        });
    }
    async getVoterVotingStatus(voterId, ballotId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const ballot = await this.prisma.ballot.findUnique({
            where: { id: ballotId },
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        const votes = await this.prisma.vote.findMany({
            where: {
                voterId,
                ballotId,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        displayOrder: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        photo: true,
                        partyList: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        const ballotPositions = await this.prisma.ballotPosition.findMany({
            where: { BallotPosition_BallotId: ballotId },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        displayOrder: true,
                    },
                },
            },
        });
        const votedPositions = votes.map(v => v.position.id);
        const availablePositions = ballotPositions
            .filter(bp => !votedPositions.includes(bp.position.id))
            .map(bp => bp.position);
        return {
            voter: {
                id: voter.id,
                name: voter.Voter_Name,
                email: voter.Voter_Email,
                studentId: voter.Voter_StudentId,
                hasVoted: voter.hasVoted,
            },
            ballot: {
                id: ballot.id,
                title: ballot.Ballot_Title,
                status: ballot.Ballot_Status,
            },
            votes,
            availablePositions,
            canVote: ballot.Ballot_Status === 'ACTIVE' && !voter.hasVoted,
        };
    }
    async getRealTimeStats() {
        try {
            const activeVotes = await this.prisma.vote.findMany({
                select: {
                    id: true,
                    voterId: true,
                    candidateId: true,
                }
            });
            const totalVoters = await this.prisma.voter.count();
            const totalVotes = activeVotes.length;
            const uniqueVoters = new Set(activeVotes.map(vote => vote.voterId)).size;
            const candidatesWithVotes = new Set(activeVotes.map(vote => vote.candidateId)).size;
            const totalPositions = await this.prisma.position.count();
            const votersWhoVoted = uniqueVoters;
            const voterTurnout = totalVoters > 0 ? Math.round((votersWhoVoted / totalVoters) * 100) : 0;
            return {
                totalVotes,
                totalVoters,
                votersWhoVoted,
                voterTurnout,
                candidatesWithVotes,
                totalPositions,
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to get real-time stats: ${error.message}`);
        }
    }
    async getVoteTimeline() {
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const votes = await this.prisma.vote.findMany({
                where: {
                    createdAt: {
                        gte: twentyFourHoursAgo
                    }
                },
                select: {
                    createdAt: true
                }
            });
            const timelineData = [];
            const hourMap = new Map();
            votes.forEach(vote => {
                const hour = vote.createdAt.getHours();
                const hourKey = `${hour.toString().padStart(2, '0')}:00`;
                if (hourMap.has(hourKey)) {
                    hourMap.set(hourKey, hourMap.get(hourKey) + 1);
                }
                else {
                    hourMap.set(hourKey, 1);
                }
            });
            for (const [hour, voteCount] of hourMap) {
                timelineData.push({
                    hour,
                    voteCount,
                });
            }
            return timelineData.sort((a, b) => a.hour.localeCompare(b.hour));
        }
        catch (error) {
            throw new Error('Failed to get vote timeline');
        }
    }
    async getActiveBallotResults() {
        try {
            const activeBallotResults = await this.prisma.vote.groupBy({
                by: ['positionId', 'candidateId'],
                _count: {
                    id: true
                }
            });
            const results = [];
            for (const result of activeBallotResults) {
                const position = await this.prisma.position.findUnique({
                    where: { id: result.positionId },
                    select: { Position_Title: true, voteLimit: true }
                });
                const candidate = await this.prisma.candidate.findUnique({
                    where: { id: result.candidateId },
                    select: { Candidate_Name: true, photo: true }
                });
                if (position && candidate) {
                    results.push({
                        positionId: result.positionId,
                        positionName: position.Position_Title,
                        voteLimit: position.voteLimit,
                        candidateId: result.candidateId,
                        candidateName: candidate.Candidate_Name,
                        photoUrl: candidate.photo,
                        voteCount: result._count.id
                    });
                }
            }
            if (results.length > 0) {
                this.votingGateway.emitResultsUpdate('ballot', results);
            }
            return results;
        }
        catch (error) {
            console.error('Error getting active ballot results:', error);
            throw new Error('Failed to get active ballot results');
        }
    }
};
exports.VoteService = VoteService;
exports.VoteService = VoteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        id_generator_service_1.IdGeneratorService,
        voting_gateway_1.VotingGateway])
], VoteService);
//# sourceMappingURL=vote.service.js.map