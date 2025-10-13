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
const id_generator_service_1 = require("../utils/id-generator.service");
const timezone_service_1 = require("../services/timezone.service");
const voting_gateway_1 = require("../websocket/voting.gateway");
const audit_service_1 = require("../services/audit.service");
let VoteService = class VoteService {
    constructor(prisma, idGenerator, timezoneService, votingGateway, auditService) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.timezoneService = timezoneService;
        this.votingGateway = votingGateway;
        this.auditService = auditService;
    }
    async getAllVotes() {
        return this.prisma.vote.findMany({
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_StudentId: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                    },
                },
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
            },
        });
    }
    async getVoteById(id) {
        const vote = await this.prisma.vote.findUnique({
            where: { id },
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_StudentId: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                    },
                },
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
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
        const { voterId, candidateId, electionId, positionId } = createVoteDto;
        const election = await this.prisma.election.findUnique({
            where: {
                id: electionId,
                isDeleted: false
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (!election.isActive) {
            throw new common_1.BadRequestException('Election is not active');
        }
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        if (voter.hasVoted) {
            throw new common_1.ConflictException('Voter has already completed voting and cannot vote again');
        }
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        const position = await this.prisma.position.findUnique({
            where: { id: positionId },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        const voteLimit = position.voteLimit || 1;
        const currentVoteCount = await this.prisma.vote.count({
            where: {
                voterId,
                electionId,
                positionId,
            },
        });
        if (currentVoteCount >= voteLimit) {
            throw new common_1.ConflictException(`Voter has already cast ${voteLimit} vote(s) for this position`);
        }
        if (voteLimit === 1) {
            const existingVoteForCandidate = await this.prisma.vote.findFirst({
                where: {
                    voterId,
                    electionId,
                    positionId,
                    candidateId,
                },
            });
            if (existingVoteForCandidate) {
                throw new common_1.ConflictException('Voter has already voted for this candidate in this position');
            }
        }
        else {
            const existingVoteForCandidate = await this.prisma.vote.findFirst({
                where: {
                    voterId,
                    electionId,
                    positionId,
                    candidateId,
                },
            });
            if (existingVoteForCandidate) {
                throw new common_1.ConflictException('Voter has already voted for this candidate in this position');
            }
        }
        const customId = await this.idGenerator.generateVoteId();
        return await this.prisma.$transaction(async (prisma) => {
            const verificationCode = this.auditService.generateVerificationCode();
            const auditHash = this.auditService.generateAuditHash({
                voterId,
                electionId,
                candidateId,
                timestamp: new Date(),
            });
            const vote = await prisma.vote.create({
                data: {
                    id: customId,
                    voterId,
                    candidateId,
                    electionId,
                    positionId,
                    verificationCode,
                    auditHash,
                    ipAddress: createVoteDto.ipAddress,
                    userAgent: createVoteDto.userAgent,
                    sessionId: createVoteDto.sessionId,
                },
                include: {
                    voter: {
                        select: {
                            id: true,
                            Voter_Name: true,
                            Voter_StudentId: true,
                        },
                    },
                    candidate: {
                        select: {
                            id: true,
                            Candidate_Name: true,
                            Candidate_StudentId: true,
                        },
                    },
                    election: {
                        select: {
                            id: true,
                            Election_Title: true,
                        },
                    },
                    position: {
                        select: {
                            id: true,
                            Position_Title: true,
                            voteLimit: true,
                        },
                    },
                },
            });
            const updatedVoteCount = await prisma.vote.count({
                where: {
                    voterId,
                    electionId,
                    positionId,
                },
            });
            const isFinalVoteForPosition = updatedVoteCount >= voteLimit;
            const electionPositions = await prisma.electionPosition.findMany({
                where: { electionId },
            });
            let allPositionsCompleted = true;
            for (const electionPosition of electionPositions) {
                const positionVoteCount = await prisma.vote.count({
                    where: {
                        voterId,
                        electionId,
                        positionId: electionPosition.positionId,
                    },
                });
                const position = await prisma.position.findUnique({
                    where: { id: electionPosition.positionId },
                });
                const positionVoteLimit = position?.voteLimit || 1;
                if (positionVoteCount < positionVoteLimit) {
                    allPositionsCompleted = false;
                    break;
                }
            }
            if (allPositionsCompleted) {
                await prisma.voter.update({
                    where: { id: voterId },
                    data: { hasVoted: true },
                });
            }
            return {
                message: `Vote cast successfully! (${updatedVoteCount}/${voteLimit} votes for this position)`,
                vote: {
                    id: vote.id,
                    voter: vote.voter,
                    candidate: vote.candidate,
                    election: vote.election,
                    position: vote.position,
                    createdAt: vote.createdAt,
                },
                voteCount: updatedVoteCount,
                voteLimit: voteLimit,
                isFinalVoteForPosition,
                isLockedOut: allPositionsCompleted,
                confirmation: {
                    voterName: vote.voter.Voter_Name,
                    candidateName: vote.candidate.Candidate_Name,
                    positionTitle: vote.position.Position_Title,
                    electionTitle: vote.election.Election_Title,
                    votedAt: vote.createdAt,
                    voteId: vote.id,
                    remainingVotes: voteLimit - updatedVoteCount,
                    lockoutMessage: allPositionsCompleted ? 'Voter has completed all voting and is now locked out' : null,
                },
            };
            await this.auditService.createVoteAudit({
                voteId: vote.id,
                voterId,
                electionId,
                candidateId,
                timestamp: vote.createdAt,
                ipAddress: createVoteDto.ipAddress,
                userAgent: createVoteDto.userAgent,
                sessionId: createVoteDto.sessionId,
            });
            const confirmation = {
                voterName: vote.voter.Voter_Name,
                candidateName: vote.candidate.Candidate_Name,
                positionTitle: vote.position.Position_Title,
                electionTitle: vote.election.Election_Title,
                votedAt: vote.createdAt,
                voteId: vote.id,
                verificationCode: vote.verificationCode,
                remainingVotes: voteLimit - updatedVoteCount,
                lockoutMessage: allPositionsCompleted ? 'Voter has completed all voting and is now locked out' : null,
            };
            this.votingGateway.emitVoteUpdate(electionId, {
                voteId: vote.id,
                voterId,
                candidateId,
                positionId,
                electionId,
                voteCount: updatedVoteCount,
                voteLimit,
                isFinalVoteForPosition,
                isLockedOut: allPositionsCompleted,
                confirmation
            });
            const updatedResults = await this.getVoteResults(electionId);
            this.votingGateway.emitResultsUpdate(electionId, updatedResults);
            return {
                message: `Vote cast successfully! (${updatedVoteCount}/${voteLimit} votes for this position)`,
                vote: {
                    id: vote.id,
                    voter: vote.voter,
                    candidate: vote.candidate,
                    election: vote.election,
                    position: vote.position,
                    createdAt: vote.createdAt,
                },
                voteCount: updatedVoteCount,
                voteLimit: voteLimit,
                isFinalVoteForPosition,
                isLockedOut: allPositionsCompleted,
                confirmation: {
                    voterName: vote.voter.Voter_Name,
                    candidateName: vote.candidate.Candidate_Name,
                    positionTitle: vote.position.Position_Title,
                    electionTitle: vote.election.Election_Title,
                    votedAt: vote.createdAt,
                    voteId: vote.id,
                    remainingVotes: voteLimit - updatedVoteCount,
                    lockoutMessage: allPositionsCompleted ? 'Voter has completed all voting and is now locked out' : null,
                },
            };
        }, {
            maxWait: 5000,
            timeout: 10000,
            isolationLevel: 'Serializable',
        });
    }
    async confirmVote(createVoteDto) {
        const { voterId, candidateId, electionId, positionId } = createVoteDto;
        const election = await this.prisma.election.findUnique({
            where: {
                id: electionId,
                isDeleted: false
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (!election.isActive) {
            throw new common_1.BadRequestException('Election is not active');
        }
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        if (voter.hasVoted) {
            throw new common_1.ConflictException('Voter has already completed voting and cannot vote again');
        }
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        const position = await this.prisma.position.findUnique({
            where: { id: positionId },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        const voteLimit = position.voteLimit || 1;
        const currentVoteCount = await this.prisma.vote.count({
            where: {
                voterId,
                electionId,
                positionId,
            },
        });
        if (currentVoteCount >= voteLimit) {
            throw new common_1.ConflictException(`Voter has already cast ${voteLimit} vote(s) for this position`);
        }
        const existingVoteForCandidate = await this.prisma.vote.findFirst({
            where: {
                voterId,
                electionId,
                positionId,
                candidateId,
            },
        });
        if (existingVoteForCandidate) {
            throw new common_1.ConflictException('Voter has already voted for this candidate in this position');
        }
        const electionPositions = await this.prisma.electionPosition.findMany({
            where: { electionId },
        });
        let totalPositions = 0;
        let completedPositions = 0;
        let totalVotesCast = 0;
        for (const electionPosition of electionPositions) {
            const positionVoteCount = await this.prisma.vote.count({
                where: {
                    voterId,
                    electionId,
                    positionId: electionPosition.positionId,
                },
            });
            const position = await this.prisma.position.findUnique({
                where: { id: electionPosition.positionId },
            });
            const positionVoteLimit = position?.voteLimit || 1;
            totalPositions++;
            totalVotesCast += positionVoteCount;
            if (positionVoteCount >= positionVoteLimit) {
                completedPositions++;
            }
        }
        const willBeFinalVoteForPosition = currentVoteCount + 1 >= voteLimit;
        const willCompleteAllVoting = completedPositions === totalPositions - 1 && willBeFinalVoteForPosition;
        return {
            canVote: true,
            confirmation: {
                voterName: voter.Voter_Name,
                candidateName: candidate.Candidate_Name,
                positionTitle: position.Position_Title,
                electionTitle: election.Election_Title,
                currentVoteCount,
                voteLimit,
                remainingVotes: voteLimit - currentVoteCount,
                willBeFinalVoteForPosition,
                willCompleteAllVoting,
                votingProgress: {
                    totalPositions,
                    completedPositions,
                    totalVotesCast,
                    remainingPositions: totalPositions - completedPositions,
                },
            },
            validation: {
                electionActive: election.isActive,
                voterExists: true,
                candidateExists: true,
                positionExists: true,
                withinVoteLimit: currentVoteCount < voteLimit,
                noDuplicateVote: !existingVoteForCandidate,
                notLockedOut: !voter.hasVoted,
            },
            lockoutWarning: willCompleteAllVoting ? 'This vote will complete your voting for all positions. You will be locked out after this vote.' : null,
        };
    }
    async deleteVote(id) {
        const vote = await this.prisma.vote.findUnique({
            where: { id },
        });
        if (!vote) {
            throw new common_1.NotFoundException('Vote not found');
        }
        return await this.prisma.$transaction(async (prisma) => {
            await prisma.vote.delete({
                where: { id },
            });
            await prisma.voter.update({
                where: { id: vote.voterId },
                data: { hasVoted: false },
            });
            return {
                message: 'Vote deleted successfully!',
            };
        }, {
            maxWait: 5000,
            timeout: 10000,
            isolationLevel: 'Serializable',
        });
    }
    async getVotesByElection(electionId) {
        return this.prisma.vote.findMany({
            where: { electionId },
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_StudentId: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                    },
                },
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
            },
        });
    }
    async getVotesByVoter(voterId) {
        return this.prisma.vote.findMany({
            where: { voterId },
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_StudentId: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                    },
                },
                election: {
                    select: {
                        id: true,
                        Election_Title: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
            },
        });
    }
    async getVoteResults(electionId) {
        const votes = await this.prisma.vote.findMany({
            where: { electionId },
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
                        voteLimit: true,
                    },
                },
            },
        });
        const electionPositions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        voteLimit: true,
                    },
                },
            },
        });
        const results = {};
        votes.forEach(vote => {
            const positionId = vote.positionId;
            const candidateId = vote.candidateId;
            if (!results[positionId]) {
                results[positionId] = {
                    position: {
                        ...vote.position,
                        voteLimit: vote.position.voteLimit || 1,
                    },
                    candidates: {},
                    totalVotes: 0,
                };
            }
            if (!results[positionId].candidates[candidateId]) {
                results[positionId].candidates[candidateId] = {
                    candidate: vote.candidate,
                    votes: 0,
                };
            }
            results[positionId].candidates[candidateId].votes++;
            results[positionId].totalVotes++;
        });
        electionPositions.forEach(electionPosition => {
            const positionId = electionPosition.positionId;
            if (!results[positionId]) {
                results[positionId] = {
                    position: {
                        ...electionPosition.position,
                        voteLimit: electionPosition.position.voteLimit || 1,
                    },
                    candidates: {},
                    totalVotes: 0,
                };
            }
        });
        const resultsArray = Object.values(results).map((positionResult) => {
            const candidatesArray = Object.values(positionResult.candidates).sort((a, b) => b.votes - a.votes);
            return {
                ...positionResult,
                candidates: candidatesArray,
            };
        });
        return {
            electionId,
            results: resultsArray,
            summary: {
                totalPositions: resultsArray.length,
                totalVotes: resultsArray.reduce((sum, pos) => sum + pos.totalVotes, 0),
            },
        };
    }
    async getComprehensiveVoteAnalytics(electionId) {
        const votes = await this.prisma.vote.findMany({
            where: { electionId },
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_StudentId: true,
                        Voter_Email: true,
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
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                        Candidate_Email: true,
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
                        course: {
                            select: {
                                id: true,
                                Course_Name: true,
                                Course_Code: true,
                            },
                        },
                    },
                },
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
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        Position_Description: true,
                        voteLimit: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const election = await this.prisma.election.findUnique({
            where: {
                id: electionId,
                isDeleted: false
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
                electionPositions: {
                    include: {
                        position: {
                            select: {
                                id: true,
                                Position_Title: true,
                                voteLimit: true,
                            },
                        },
                    },
                },
                electionCandidates: {
                    include: {
                        candidate: {
                            select: {
                                id: true,
                                Candidate_Name: true,
                                Candidate_StudentId: true,
                                positionId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const totalVotes = votes.length;
        const uniqueVoters = new Set(votes.map(vote => vote.voterId)).size;
        const uniqueCandidates = new Set(votes.map(vote => vote.candidateId)).size;
        const uniquePositions = new Set(votes.map(vote => vote.positionId)).size;
        const votesByPosition = {};
        votes.forEach(vote => {
            const positionId = vote.positionId;
            if (!votesByPosition[positionId]) {
                votesByPosition[positionId] = {
                    position: vote.position,
                    votes: [],
                    candidateVotes: {},
                    totalVotes: 0,
                };
            }
            votesByPosition[positionId].votes.push(vote);
            votesByPosition[positionId].totalVotes++;
            const candidateId = vote.candidateId;
            if (!votesByPosition[positionId].candidateVotes[candidateId]) {
                votesByPosition[positionId].candidateVotes[candidateId] = {
                    candidate: vote.candidate,
                    voteCount: 0,
                    voters: [],
                };
            }
            votesByPosition[positionId].candidateVotes[candidateId].voteCount++;
            votesByPosition[positionId].candidateVotes[candidateId].voters.push({
                id: vote.voter.id,
                name: vote.voter.Voter_Name,
                studentId: vote.voter.Voter_StudentId,
                votedAt: vote.createdAt,
            });
        });
        const votesByVoter = {};
        votes.forEach(vote => {
            const voterId = vote.voterId;
            if (!votesByVoter[voterId]) {
                votesByVoter[voterId] = {
                    voter: vote.voter,
                    votes: [],
                    positionsVoted: new Set(),
                };
            }
            votesByVoter[voterId].votes.push({
                id: vote.id,
                candidate: vote.candidate,
                position: vote.position,
                election: vote.election,
                votedAt: vote.createdAt,
            });
            votesByVoter[voterId].positionsVoted.add(vote.positionId);
        });
        const totalEligibleVoters = await this.prisma.voter.count();
        const participationRate = totalEligibleVoters > 0 ? (uniqueVoters / totalEligibleVoters) * 100 : 0;
        const voteTimeline = votes.map(vote => ({
            voteId: vote.id,
            voterName: vote.voter.Voter_Name,
            candidateName: vote.candidate.Candidate_Name,
            positionTitle: vote.position.Position_Title,
            votedAt: vote.createdAt,
        })).sort((a, b) => new Date(a.votedAt).getTime() - new Date(b.votedAt).getTime());
        return {
            election: {
                id: election.id,
                title: election.Election_Title,
                description: election.Election_Description,
                startDate: election.startDate,
                endDate: election.endDate,
                isActive: election.isActive,
                createdBy: election.admin,
                positions: election.electionPositions.map(ep => ep.position),
                candidates: election.electionCandidates.map(ec => ec.candidate),
            },
            statistics: {
                totalVotes,
                uniqueVoters,
                uniqueCandidates,
                uniquePositions,
                totalEligibleVoters,
                participationRate: Math.round(participationRate * 100) / 100,
                averageVotesPerVoter: uniqueVoters > 0 ? Math.round((totalVotes / uniqueVoters) * 100) / 100 : 0,
            },
            detailedResults: {
                byPosition: Object.values(votesByPosition).map((positionData) => ({
                    position: positionData.position,
                    totalVotes: positionData.totalVotes,
                    candidates: Object.values(positionData.candidateVotes).map((candidateData) => ({
                        candidate: candidateData.candidate,
                        voteCount: candidateData.voteCount,
                        percentage: positionData.totalVotes > 0 ? Math.round((candidateData.voteCount / positionData.totalVotes) * 100 * 100) / 100 : 0,
                        voters: candidateData.voters,
                    })).sort((a, b) => b.voteCount - a.voteCount),
                })),
                byVoter: Object.values(votesByVoter).map((voterData) => ({
                    voter: voterData.voter,
                    totalVotes: voterData.votes.length,
                    positionsVoted: Array.from(voterData.positionsVoted),
                    votes: voterData.votes,
                })),
                byDepartment: await this.getDepartmentVotingResults(electionId),
            },
            timeline: {
                firstVote: voteTimeline.length > 0 ? voteTimeline[0] : null,
                lastVote: voteTimeline.length > 0 ? voteTimeline[voteTimeline.length - 1] : null,
                totalVoteSessions: uniqueVoters,
                voteTimeline,
            },
            audit: {
                voteRecords: votes.map(vote => ({
                    voteId: vote.id,
                    voter: {
                        id: vote.voter.id,
                        name: vote.voter.Voter_Name,
                        studentId: vote.voter.Voter_StudentId,
                        email: vote.voter.Voter_Email,
                        department: vote.voter.department,
                        course: vote.voter.course,
                    },
                    candidate: {
                        id: vote.candidate.id,
                        name: vote.candidate.Candidate_Name,
                        studentId: vote.candidate.Candidate_StudentId,
                        email: vote.candidate.Candidate_Email,
                        position: vote.candidate.position,
                        department: vote.candidate.department,
                        course: vote.candidate.course,
                    },
                    position: vote.position,
                    election: vote.election,
                    votedAt: vote.createdAt,
                })),
            },
        };
    }
    async getDepartmentVotingResults(electionId) {
        const votes = await this.prisma.vote.findMany({
            where: { electionId },
            include: {
                voter: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_StudentId: true,
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        Candidate_Name: true,
                        Candidate_StudentId: true,
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                    },
                },
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        voteLimit: true,
                    },
                },
            },
        });
        const departments = await this.prisma.department.findMany({
            include: {
                voters: {
                    select: {
                        id: true,
                        Voter_Name: true,
                        Voter_StudentId: true,
                    },
                },
            },
        });
        const departmentResults = {};
        departments.forEach(dept => {
            departmentResults[dept.id] = {
                department: {
                    id: dept.id,
                    name: dept.Department_Name,
                },
                totalVoters: dept.voters.length,
                totalVotes: 0,
                participationRate: 0,
                positions: {},
                candidates: {},
                voterDetails: [],
            };
        });
        votes.forEach(vote => {
            const departmentId = vote.voter.department?.id || 'unknown';
            const departmentName = vote.voter.department?.Department_Name || 'Unknown Department';
            if (!departmentResults[departmentId]) {
                departmentResults[departmentId] = {
                    department: {
                        id: departmentId,
                        name: departmentName,
                    },
                    totalVoters: 0,
                    totalVotes: 0,
                    participationRate: 0,
                    positions: {},
                    candidates: {},
                    voterDetails: [],
                };
            }
            const deptResult = departmentResults[departmentId];
            deptResult.totalVotes++;
            if (!deptResult.voterDetails.find(v => v.id === vote.voter.id)) {
                deptResult.voterDetails.push({
                    id: vote.voter.id,
                    name: vote.voter.Voter_Name,
                    studentId: vote.voter.Voter_StudentId,
                });
            }
            const positionId = vote.positionId;
            if (!deptResult.positions[positionId]) {
                deptResult.positions[positionId] = {
                    position: vote.position,
                    totalVotes: 0,
                    candidates: {},
                };
            }
            deptResult.positions[positionId].totalVotes++;
            const candidateId = vote.candidateId;
            if (!deptResult.candidates[candidateId]) {
                deptResult.candidates[candidateId] = {
                    candidate: vote.candidate,
                    totalVotes: 0,
                    voters: [],
                };
            }
            deptResult.candidates[candidateId].totalVotes++;
            deptResult.candidates[candidateId].voters.push({
                id: vote.voter.id,
                name: vote.voter.Voter_Name,
                studentId: vote.voter.Voter_StudentId,
            });
            if (!deptResult.positions[positionId].candidates[candidateId]) {
                deptResult.positions[positionId].candidates[candidateId] = {
                    candidate: vote.candidate,
                    votes: 0,
                };
            }
            deptResult.positions[positionId].candidates[candidateId].votes++;
        });
        const formattedResults = Object.values(departmentResults).map((deptResult) => {
            const uniqueVoters = deptResult.voterDetails.length;
            const participationRate = deptResult.totalVoters > 0 ? (uniqueVoters / deptResult.totalVoters) * 100 : 0;
            const formattedPositions = Object.values(deptResult.positions).map((positionData) => ({
                position: positionData.position,
                totalVotes: positionData.totalVotes,
                candidates: Object.values(positionData.candidates).map((candidateData) => ({
                    candidate: candidateData.candidate,
                    votes: candidateData.votes,
                    percentage: positionData.totalVotes > 0 ? Math.round((candidateData.votes / positionData.totalVotes) * 100 * 100) / 100 : 0,
                })).sort((a, b) => b.votes - a.votes),
            }));
            const formattedCandidates = Object.values(deptResult.candidates).map((candidateData) => ({
                candidate: candidateData.candidate,
                totalVotes: candidateData.totalVotes,
                voters: candidateData.voters,
            })).sort((a, b) => b.totalVotes - a.totalVotes);
            return {
                department: deptResult.department,
                statistics: {
                    totalVoters: deptResult.totalVoters,
                    uniqueVoters,
                    totalVotes: deptResult.totalVotes,
                    participationRate: Math.round(participationRate * 100) / 100,
                    averageVotesPerVoter: uniqueVoters > 0 ? Math.round((deptResult.totalVotes / uniqueVoters) * 100) / 100 : 0,
                },
                positions: formattedPositions,
                candidates: formattedCandidates,
                voterDetails: deptResult.voterDetails,
            };
        });
        return formattedResults.sort((a, b) => b.statistics.totalVotes - a.statistics.totalVotes);
    }
    async getVoterVotingStatus(voterId, electionId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        const election = await this.prisma.election.findUnique({
            where: {
                id: electionId,
                isDeleted: false
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const electionPositions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        voteLimit: true,
                        displayOrder: true,
                    },
                },
            },
            orderBy: {
                position: {
                    displayOrder: 'asc',
                },
            },
        });
        const votingStatus = [];
        let totalVotesCast = 0;
        let completedPositions = 0;
        for (const electionPosition of electionPositions) {
            const positionVoteCount = await this.prisma.vote.count({
                where: {
                    voterId,
                    electionId,
                    positionId: electionPosition.positionId,
                },
            });
            const position = electionPosition.position;
            const voteLimit = position.voteLimit || 1;
            const isCompleted = positionVoteCount >= voteLimit;
            const remainingVotes = Math.max(0, voteLimit - positionVoteCount);
            if (isCompleted) {
                completedPositions++;
            }
            totalVotesCast += positionVoteCount;
            votingStatus.push({
                positionId: position.id,
                positionTitle: position.Position_Title,
                voteLimit,
                votesCast: positionVoteCount,
                remainingVotes,
                isCompleted,
                progress: `${positionVoteCount}/${voteLimit}`,
            });
        }
        const totalPositions = electionPositions.length;
        const allPositionsCompleted = completedPositions === totalPositions;
        const isLockedOut = voter.hasVoted || allPositionsCompleted;
        return {
            voter: {
                id: voter.id,
                name: voter.Voter_Name,
                studentId: voter.Voter_StudentId,
                hasVoted: voter.hasVoted,
            },
            election: {
                id: election.id,
                title: election.Election_Title,
                isActive: election.isActive,
            },
            votingStatus: {
                totalPositions,
                completedPositions,
                remainingPositions: totalPositions - completedPositions,
                totalVotesCast,
                allPositionsCompleted,
                isLockedOut,
                lockoutReason: voter.hasVoted ? 'Voter manually marked as voted' : allPositionsCompleted ? 'All positions completed' : null,
            },
            positions: votingStatus,
            canVote: !isLockedOut && election.isActive,
            lockoutMessage: isLockedOut ? 'Voter has completed all voting and is locked out' : null,
        };
    }
    async getRealTimeStats() {
        try {
            const activeVotes = await this.prisma.vote.findMany({
                where: {
                    election: {
                        status: { in: ['active', 'paused'] }
                    }
                },
                select: {
                    id: true,
                    voterId: true,
                    candidateId: true,
                    electionId: true
                }
            });
            const totalVoters = await this.prisma.voter.count();
            const totalVotes = activeVotes.length;
            const uniqueVoters = new Set(activeVotes.map(vote => vote.voterId)).size;
            const candidatesWithVotes = new Set(activeVotes.map(vote => vote.candidateId)).size;
            const totalPositions = await this.prisma.electionPosition.count({
                where: {
                    election: {
                        status: { in: ['active', 'paused'] }
                    }
                }
            });
            const votersWhoVoted = uniqueVoters;
            const voterTurnout = totalVoters > 0 ? Math.round((votersWhoVoted / totalVoters) * 100) : 0;
            return {
                totalVotes,
                uniqueVoters: votersWhoVoted,
                candidatesWithVotes,
                totalPositions,
                votersWhoVoted,
                totalVoters,
                voterTurnout
            };
        }
        catch (error) {
            console.error('Error getting real-time stats:', error);
            throw new Error('Failed to get real-time statistics');
        }
    }
    async getVoteTimeline() {
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const votes = await this.prisma.vote.findMany({
                where: {
                    createdAt: {
                        gte: twentyFourHoursAgo
                    },
                    election: {
                        status: { in: ['active', 'paused'] }
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
                    voteCount
                });
            }
            timelineData.sort((a, b) => a.hour.localeCompare(b.hour));
            return timelineData;
        }
        catch (error) {
            console.error('Error getting vote timeline:', error);
            throw new Error('Failed to get vote timeline');
        }
    }
    async getActiveElectionResults() {
        try {
            const activeElectionResults = await this.prisma.vote.groupBy({
                by: ['electionId', 'positionId', 'candidateId'],
                where: {
                    election: {
                        status: { in: ['active', 'paused'] }
                    }
                },
                _count: {
                    id: true
                }
            });
            const results = [];
            for (const result of activeElectionResults) {
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
                const electionId = activeElectionResults[0]?.electionId;
                if (electionId) {
                    this.votingGateway.emitResultsUpdate(electionId, results);
                }
            }
            return results;
        }
        catch (error) {
            console.error('Error getting active election results:', error);
            throw new Error('Failed to get active election results');
        }
    }
    async resetVoterStatus(voterId) {
        try {
            const voter = await this.prisma.voter.findUnique({
                where: { id: voterId }
            });
            if (!voter) {
                throw new common_1.NotFoundException('Voter not found');
            }
            await this.prisma.voter.update({
                where: { id: voterId },
                data: { hasVoted: false }
            });
            return {
                message: 'Voter status reset successfully',
                voter: {
                    id: voter.id,
                    name: voter.Voter_Name,
                    studentId: voter.Voter_StudentId,
                    hasVoted: false
                }
            };
        }
        catch (error) {
            console.error('Error resetting voter status:', error);
            throw new Error('Failed to reset voter status');
        }
    }
};
exports.VoteService = VoteService;
exports.VoteService = VoteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService,
        timezone_service_1.TimezoneService,
        voting_gateway_1.VotingGateway,
        audit_service_1.AuditService])
], VoteService);
//# sourceMappingURL=vote.service.js.map