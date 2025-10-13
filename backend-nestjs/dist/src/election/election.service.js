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
exports.ElectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
const timezone_service_1 = require("../services/timezone.service");
const voting_gateway_1 = require("../websocket/voting.gateway");
let ElectionService = class ElectionService {
    constructor(prisma, idGenerator, timezoneService, votingGateway) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.timezoneService = timezoneService;
        this.votingGateway = votingGateway;
    }
    async getAllElections() {
        return this.prisma.election.findMany({
            where: { isDeleted: false },
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
                            },
                        },
                    },
                },
                votes: {
                    select: {
                        id: true,
                        createdAt: true,
                    },
                },
            },
        });
    }
    async getElectionById(id, includeDeleted = false) {
        const election = await this.prisma.election.findUnique({
            where: {
                id,
                ...(includeDeleted ? {} : { isDeleted: false })
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
                            },
                        },
                    },
                },
                votes: {
                    select: {
                        id: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        return election;
    }
    async createElection(createElectionDto, adminId) {
        const { Election_Title, Election_Description, startDate, endDate, isActive } = createElectionDto;
        const existingElection = await this.prisma.election.findFirst({
            where: { Election_Title: Election_Title },
        });
        if (existingElection) {
            throw new common_1.ConflictException('Election with this title already exists');
        }
        const customId = await this.idGenerator.generateElectionId();
        const election = await this.prisma.election.create({
            data: {
                id: customId,
                Election_Title: Election_Title,
                Election_Description: Election_Description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive || false,
                status: 'draft',
                createdBy: adminId,
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
        this.votingGateway.emitElectionCreated({
            id: election.id,
            title: election.Election_Title,
            description: election.Election_Description,
            startDate: election.startDate,
            endDate: election.endDate,
            isActive: election.isActive,
            createdBy: election.createdBy,
            admin: election.admin,
            createdAt: election.createdAt,
        });
        return {
            message: 'Election created successfully!',
            election: {
                id: election.id,
                title: election.Election_Title,
                description: election.Election_Description,
                startDate: election.startDate,
                endDate: election.endDate,
                isActive: election.isActive,
                status: election.status,
                createdBy: election.createdBy,
                admin: election.admin,
                createdAt: election.createdAt,
                updatedAt: election.updatedAt,
            },
        };
    }
    async updateElection(id, updateElectionDto) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const updateData = { ...updateElectionDto };
        if (updateElectionDto.startDate) {
            updateData.startDate = new Date(updateElectionDto.startDate);
        }
        if (updateElectionDto.endDate) {
            updateData.endDate = new Date(updateElectionDto.endDate);
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: updateData,
            include: {
                admin: {
                    select: {
                        id: true,
                        Admin_Username: true,
                        Admin_Email: true,
                    },
                },
            },
        });
        this.votingGateway.emitElectionUpdated({
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            description: updatedElection.Election_Description,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            isActive: updatedElection.isActive,
            updatedAt: updatedElection.updatedAt,
            admin: updatedElection.admin,
        });
        return {
            message: 'Election updated successfully!',
            election: updatedElection,
        };
    }
    async deleteElection(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.isDeleted) {
            throw new common_1.NotFoundException('Election has already been deleted');
        }
        await this.prisma.election.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'deleted', {
            id: id,
            message: 'Election moved to trash',
            timestamp: new Date().toISOString(),
        });
        return {
            message: 'Election moved to trash successfully!',
        };
    }
    async getDeletedElections() {
        return this.prisma.election.findMany({
            where: { isDeleted: true },
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
                            },
                        },
                    },
                },
                votes: {
                    select: {
                        id: true,
                        createdAt: true,
                    },
                },
            },
        });
    }
    async restoreElection(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (!election.isDeleted) {
            throw new common_1.NotFoundException('Election is not deleted');
        }
        const restoredElection = await this.prisma.election.update({
            where: { id },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
        return {
            message: 'Election restored successfully!',
            election: restoredElection,
        };
    }
    async permanentlyDeleteElection(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        votes: true,
                        electionPositions: true,
                        electionCandidates: true,
                        auditLogs: true,
                    },
                },
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (!election.isDeleted) {
            throw new common_1.NotFoundException('Election must be soft-deleted before permanent deletion');
        }
        if (election._count.votes > 0) {
            throw new common_1.ConflictException('Cannot permanently delete election with voting history. Votes must be preserved for audit purposes.');
        }
        await this.prisma.$transaction(async (tx) => {
            if (election._count.auditLogs > 0) {
                await tx.auditLog.deleteMany({
                    where: { electionId: id }
                });
            }
            if (election._count.electionCandidates > 0) {
                await tx.electionCandidate.deleteMany({
                    where: { electionId: id }
                });
            }
            if (election._count.electionPositions > 0) {
                await tx.electionPosition.deleteMany({
                    where: { electionId: id }
                });
            }
            await tx.election.delete({
                where: { id }
            });
        });
        return {
            message: 'Election permanently deleted!',
        };
    }
    async activateElection(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: {
                isActive: true,
                status: 'active'
            },
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'active', {
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            updatedAt: updatedElection.updatedAt,
        });
        return {
            message: 'Election activated successfully!',
            election: updatedElection,
        };
    }
    async deactivateElection(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: {
                isActive: false,
                status: 'draft'
            },
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'draft', {
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            updatedAt: updatedElection.updatedAt,
        });
        return {
            message: 'Election deactivated successfully!',
            election: updatedElection,
        };
    }
    async startBallot(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
            include: {
                electionPositions: true,
                electionCandidates: true,
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.electionPositions.length === 0) {
            throw new common_1.ConflictException('Cannot start ballot: No positions assigned to election');
        }
        if (election.electionCandidates.length === 0) {
            throw new common_1.ConflictException('Cannot start ballot: No candidates assigned to election');
        }
        if (election.status === 'active') {
            throw new common_1.ConflictException('Ballot is already active');
        }
        if (election.status === 'ended') {
            throw new common_1.ConflictException('Cannot start ballot: Election has already ended');
        }
        const otherActiveElections = await this.prisma.election.findMany({
            where: {
                id: { not: id },
                status: 'active',
                isDeleted: false
            }
        });
        if (otherActiveElections.length > 0) {
            await Promise.all(otherActiveElections.map(async (otherElection) => {
                await this.prisma.election.update({
                    where: { id: otherElection.id },
                    data: {
                        isActive: false,
                        status: 'paused'
                    }
                });
                this.votingGateway.emitElectionStatusUpdate(otherElection.id, 'paused', {
                    id: otherElection.id,
                    title: otherElection.Election_Title,
                    status: 'paused',
                    startDate: otherElection.startDate,
                    endDate: otherElection.endDate,
                    updatedAt: new Date(),
                });
            }));
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: {
                isActive: true,
                status: 'active'
            },
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'active', {
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            updatedAt: updatedElection.updatedAt,
        });
        const pausedCount = otherActiveElections.length;
        const message = pausedCount > 0
            ? `Ballot started successfully! ${pausedCount} other active ballot(s) have been automatically paused.`
            : 'Ballot started successfully! Voting is now open.';
        return {
            message,
            election: updatedElection,
            ballotInfo: {
                positions: election.electionPositions.length,
                candidates: election.electionCandidates.length,
                status: 'active',
                otherElectionsPaused: pausedCount
            }
        };
    }
    async pauseBallot(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.status !== 'active') {
            throw new common_1.ConflictException('Cannot pause ballot: Ballot is not active');
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: {
                isActive: false,
                status: 'paused'
            },
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'paused', {
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            updatedAt: updatedElection.updatedAt,
        });
        return {
            message: 'Ballot paused successfully! Voting is temporarily suspended.',
            election: updatedElection,
        };
    }
    async resumeBallot(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.status !== 'paused') {
            throw new common_1.ConflictException('Cannot resume ballot: Ballot is not paused');
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: {
                isActive: true,
                status: 'active'
            },
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'active', {
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            updatedAt: updatedElection.updatedAt,
        });
        return {
            message: 'Ballot resumed successfully! Voting is now open again.',
            election: updatedElection,
        };
    }
    async stopBallot(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.status !== 'active' && election.status !== 'paused') {
            throw new common_1.ConflictException('Cannot stop ballot: Ballot is not active or paused');
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: {
                isActive: false,
                status: 'stopped'
            },
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'stopped', {
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            updatedAt: updatedElection.updatedAt,
        });
        return {
            message: 'Ballot stopped successfully! Voting is now closed.',
            election: updatedElection,
        };
    }
    async endBallot(id) {
        const election = await this.prisma.election.findUnique({
            where: { id },
            include: {
                votes: {
                    select: {
                        id: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.status === 'ended') {
            throw new common_1.ConflictException('Ballot has already ended');
        }
        if (election.status === 'draft') {
            throw new common_1.ConflictException('Cannot end ballot: Ballot has not been started');
        }
        const updatedElection = await this.prisma.election.update({
            where: { id },
            data: {
                isActive: false,
                status: 'ended'
            },
        });
        const totalVotes = election.votes.length;
        const uniqueVoters = await this.prisma.vote.groupBy({
            by: ['voterId'],
            where: { electionId: id },
            _count: { voterId: true },
        });
        this.votingGateway.emitElectionStatusUpdate(id, 'ended', {
            id: updatedElection.id,
            title: updatedElection.Election_Title,
            status: updatedElection.status,
            startDate: updatedElection.startDate,
            endDate: updatedElection.endDate,
            updatedAt: updatedElection.updatedAt,
            finalResults: {
                totalVotes,
                uniqueVoters: uniqueVoters.length,
                status: 'ended',
                endedAt: new Date(),
            },
        });
        return {
            message: 'Ballot ended successfully! Results are now final.',
            election: updatedElection,
            finalResults: {
                totalVotes,
                uniqueVoters: uniqueVoters.length,
                status: 'ended',
                endedAt: new Date(),
            }
        };
    }
    async getBallotStatus(id) {
        const election = await this.prisma.election.findUnique({
            where: {
                id,
                isDeleted: false
            },
            include: {
                electionPositions: {
                    include: {
                        position: true,
                    },
                },
                electionCandidates: {
                    include: {
                        candidate: true,
                    },
                },
                votes: {
                    select: {
                        id: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const totalVotes = election.votes.length;
        const uniqueVoters = await this.prisma.vote.groupBy({
            by: ['voterId'],
            where: { electionId: id },
            _count: { voterId: true },
        });
        const ballotInfo = {
            election: {
                id: election.id,
                title: election.Election_Title,
                status: election.status,
                isActive: election.isActive,
                startDate: election.startDate,
                endDate: election.endDate,
            },
            ballot: {
                positions: election.electionPositions.length,
                candidates: election.electionCandidates.length,
                totalVotes,
                uniqueVoters: uniqueVoters.length,
                canVote: election.status === 'active',
                canPause: election.status === 'active',
                canResume: election.status === 'paused',
                canEnd: election.status === 'active' || election.status === 'paused',
            },
            lifecycle: {
                draft: election.status === 'draft',
                active: election.status === 'active',
                paused: election.status === 'paused',
                ended: election.status === 'ended',
            }
        };
        return ballotInfo;
    }
    async getActiveElections() {
        return this.prisma.election.findMany({
            where: {
                status: 'active',
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
                            },
                        },
                    },
                },
            },
        });
    }
    async getActiveElection() {
        const activeElections = await this.prisma.election.findMany({
            where: {
                status: 'active',
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
                            },
                        },
                    },
                },
            },
            take: 1,
        });
        return activeElections.length > 0 ? activeElections[0] : null;
    }
    async hasActiveElections() {
        const activeCount = await this.prisma.election.count({
            where: {
                status: 'active',
                isDeleted: false
            }
        });
        return {
            hasActive: activeCount > 0,
            activeCount
        };
    }
    async getActiveElectionInfo() {
        const activeElections = await this.prisma.election.findMany({
            where: {
                status: 'active',
                isDeleted: false
            },
            select: {
                id: true,
                Election_Title: true,
                status: true,
                startDate: true,
                endDate: true
            }
        });
        return {
            hasActive: activeElections.length > 0,
            activeCount: activeElections.length,
            activeElections
        };
    }
    async checkAndAutoEndElections() {
        const now = this.timezoneService.getCurrentPhilippineTime();
        const expiredElections = await this.prisma.election.findMany({
            where: {
                status: 'active',
                isDeleted: false,
                endDate: {
                    lte: now,
                },
            },
            include: {
                votes: {
                    select: {
                        id: true,
                        createdAt: true,
                    },
                },
            },
        });
        const autoEndedElections = [];
        for (const election of expiredElections) {
            try {
                const updatedElection = await this.prisma.election.update({
                    where: { id: election.id },
                    data: {
                        isActive: false,
                        status: 'ended'
                    },
                });
                const totalVotes = election.votes.length;
                const uniqueVoters = await this.prisma.vote.groupBy({
                    by: ['voterId'],
                    where: { electionId: election.id },
                    _count: { voterId: true },
                });
                autoEndedElections.push({
                    election: updatedElection,
                    finalResults: {
                        totalVotes,
                        uniqueVoters: uniqueVoters.length,
                        status: 'ended',
                        endedAt: now,
                        endedAtPhilippine: this.timezoneService.formatPhilippineTimeForDisplay(now),
                        autoEnded: true,
                    }
                });
                console.log(`🕐 Auto-ended election: ${election.Election_Title} (ID: ${election.id})`);
                console.log(`   Total votes: ${totalVotes}, Unique voters: ${uniqueVoters.length}`);
            }
            catch (error) {
                console.error(`❌ Error auto-ending election ${election.id}:`, error);
            }
        }
        return {
            message: `Auto-ended ${autoEndedElections.length} expired election(s)`,
            autoEndedElections,
        };
    }
    async getElectionTimeStatus(id) {
        const election = await this.prisma.election.findUnique({
            where: {
                id,
                isDeleted: false
            },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const now = this.timezoneService.getCurrentPhilippineTime();
        const startDate = this.timezoneService.convertToPhilippineTime(election.startDate);
        const endDate = this.timezoneService.convertToPhilippineTime(election.endDate);
        const timeStatus = {
            election: {
                id: election.id,
                title: election.Election_Title,
                status: election.status,
            },
            timezone: this.timezoneService.getPhilippineTimezoneInfo(),
            timeInfo: {
                now: now.toISOString(),
                nowPhilippine: this.timezoneService.formatPhilippineTimeForDisplay(now),
                startDate: startDate.toISOString(),
                startDatePhilippine: this.timezoneService.formatPhilippineTimeForDisplay(startDate),
                endDate: endDate.toISOString(),
                endDatePhilippine: this.timezoneService.formatPhilippineTimeForDisplay(endDate),
                isStarted: now >= startDate,
                isEnded: now >= endDate,
                timeUntilStart: Math.max(0, startDate.getTime() - now.getTime()),
                timeUntilEnd: Math.max(0, endDate.getTime() - now.getTime()),
                timeRemaining: Math.max(0, endDate.getTime() - now.getTime()),
                timeDifference: this.timezoneService.getTimeDifferenceInPhilippineTime(endDate),
            },
            votingStatus: {
                canVote: election.status === 'active' && now >= startDate && now < endDate,
                shouldAutoEnd: election.status === 'active' && now >= endDate,
                isExpired: now >= endDate,
                isInFuture: now < startDate,
                isInProgress: now >= startDate && now < endDate,
            }
        };
        return timeStatus;
    }
    async scheduleAutoEndCheck() {
        return this.checkAndAutoEndElections();
    }
    async addPositionToElection(electionId, addPositionDto) {
        const { positionId } = addPositionDto;
        const election = await this.prisma.election.findUnique({
            where: {
                id: electionId,
                isDeleted: false
            },
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
        const existingElectionPosition = await this.prisma.electionPosition.findUnique({
            where: {
                electionId_positionId: {
                    electionId,
                    positionId,
                },
            },
        });
        if (existingElectionPosition) {
            throw new common_1.ConflictException('Position is already added to this election');
        }
        const electionPositionId = await this.idGenerator.generateElectionPositionId();
        const electionPosition = await this.prisma.electionPosition.create({
            data: {
                id: electionPositionId,
                electionId,
                positionId,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
            },
        });
        return {
            message: 'Position added to election successfully!',
            electionPosition,
        };
    }
    async addCandidateToElection(electionId, addCandidateDto) {
        const { candidateId } = addCandidateDto;
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
        const existingElectionCandidate = await this.prisma.electionCandidate.findUnique({
            where: {
                electionId_candidateId: {
                    electionId,
                    candidateId,
                },
            },
        });
        if (existingElectionCandidate) {
            throw new common_1.ConflictException('Candidate is already added to this election');
        }
        const electionCandidateId = await this.idGenerator.generateElectionCandidateId();
        const electionCandidate = await this.prisma.electionCandidate.create({
            data: {
                id: electionCandidateId,
                electionId,
                candidateId,
            },
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
        });
        return {
            message: 'Candidate added to election successfully!',
            electionCandidate,
        };
    }
    async removePositionFromElection(electionId, positionId) {
        const electionPosition = await this.prisma.electionPosition.findUnique({
            where: {
                electionId_positionId: {
                    electionId,
                    positionId,
                },
            },
        });
        if (!electionPosition) {
            throw new common_1.NotFoundException('Position is not added to this election');
        }
        await this.prisma.electionPosition.delete({
            where: {
                electionId_positionId: {
                    electionId,
                    positionId,
                },
            },
        });
        return {
            message: 'Position removed from election successfully!',
        };
    }
    async removeCandidateFromElection(electionId, candidateId) {
        const electionCandidate = await this.prisma.electionCandidate.findUnique({
            where: {
                electionId_candidateId: {
                    electionId,
                    candidateId,
                },
            },
        });
        if (!electionCandidate) {
            throw new common_1.NotFoundException('Candidate is not added to this election');
        }
        await this.prisma.electionCandidate.delete({
            where: {
                electionId_candidateId: {
                    electionId,
                    candidateId,
                },
            },
        });
        return {
            message: 'Candidate removed from election successfully!',
        };
    }
    async getElectionHistory() {
        try {
            const endedElections = await this.prisma.election.findMany({
                where: {
                    status: 'ended',
                    isDeleted: false
                },
                include: {
                    admin: {
                        select: {
                            id: true,
                            Admin_Username: true,
                            role: true
                        }
                    },
                    electionPositions: {
                        include: {
                            position: {
                                select: {
                                    id: true,
                                    Position_Title: true,
                                    Position_Description: true,
                                    voteLimit: true
                                }
                            }
                        }
                    },
                    electionCandidates: {
                        include: {
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
                                            Position_Title: true
                                        }
                                    },
                                    department: {
                                        select: {
                                            id: true,
                                            Department_Name: true
                                        }
                                    },
                                    course: {
                                        select: {
                                            id: true,
                                            Course_Name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    endDate: 'desc'
                }
            });
            const electionHistory = await Promise.all(endedElections.map(async (election) => {
                const voteResults = await this.prisma.vote.groupBy({
                    by: ['positionId', 'candidateId'],
                    where: {
                        electionId: election.id
                    },
                    _count: {
                        id: true
                    }
                });
                const totalVoters = await this.prisma.voter.count();
                const uniqueVoters = await this.prisma.vote.groupBy({
                    by: ['voterId'],
                    where: {
                        electionId: election.id
                    },
                    _count: {
                        id: true
                    }
                });
                const votersWhoVoted = uniqueVoters.length;
                const voterTurnout = totalVoters > 0 ? Math.round((votersWhoVoted / totalVoters) * 100) : 0;
                const totalVotes = voteResults.reduce((sum, result) => sum + result._count.id, 0);
                const resultsByPosition = {};
                for (const result of voteResults) {
                    const position = election.electionPositions.find(ep => ep.positionId === result.positionId);
                    const candidate = election.electionCandidates.find(ec => ec.candidateId === result.candidateId);
                    if (position && candidate) {
                        const positionTitle = position.position.Position_Title;
                        if (!resultsByPosition[positionTitle]) {
                            resultsByPosition[positionTitle] = {
                                positionId: result.positionId,
                                positionTitle: positionTitle,
                                voteLimit: position.position.voteLimit,
                                candidates: []
                            };
                        }
                        resultsByPosition[positionTitle].candidates.push({
                            candidateId: result.candidateId,
                            candidateName: candidate.candidate.Candidate_Name,
                            candidateEmail: candidate.candidate.Candidate_Email,
                            candidateStudentId: candidate.candidate.Candidate_StudentId,
                            candidatePhoto: candidate.candidate.photo,
                            candidateManifesto: candidate.candidate.manifesto,
                            candidateDepartment: candidate.candidate.department?.Department_Name || 'N/A',
                            candidateCourse: candidate.candidate.course?.Course_Name || 'N/A',
                            voteCount: result._count.id
                        });
                    }
                }
                Object.values(resultsByPosition).forEach((position) => {
                    position.candidates.sort((a, b) => b.voteCount - a.voteCount);
                });
                const startDate = new Date(election.startDate);
                const endDate = new Date(election.endDate);
                const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
                const formatDate = (date) => {
                    return new Date(date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short'
                    });
                };
                return {
                    electionId: election.id,
                    Election_Title: election.Election_Title,
                    Election_Description: election.Election_Description,
                    status: election.status,
                    startDate: election.startDate,
                    endDate: election.endDate,
                    startDateFormatted: formatDate(election.startDate),
                    endDateFormatted: formatDate(election.endDate),
                    durationInMinutes,
                    createdBy: election.admin.Admin_Username,
                    admin: {
                        Admin_Username: election.admin.Admin_Username,
                        role: election.admin.role
                    },
                    adminRole: election.admin.role,
                    createdAt: election.createdAt,
                    updatedAt: election.updatedAt,
                    totalVotes,
                    totalVoters,
                    votersWhoVoted,
                    voterTurnout,
                    uniqueVoters: votersWhoVoted,
                    totalPositions: election.electionPositions.length,
                    totalCandidates: election.electionCandidates.length,
                    positions: election.electionPositions.map(ep => ({
                        positionId: ep.position.id,
                        title: ep.position.Position_Title,
                        description: ep.position.Position_Description,
                        voteLimit: ep.position.voteLimit
                    })),
                    candidates: election.electionCandidates.map(ec => ({
                        candidateId: ec.candidate.id,
                        Candidate_Name: ec.candidate.Candidate_Name,
                        Candidate_Email: ec.candidate.Candidate_Email,
                        Candidate_StudentId: ec.candidate.Candidate_StudentId,
                        photo: ec.candidate.photo,
                        manifesto: ec.candidate.manifesto,
                        position: ec.candidate.position.Position_Title,
                        department: ec.candidate.department?.Department_Name || 'N/A',
                        course: ec.candidate.course?.Course_Name || 'N/A'
                    })),
                    resultsByPosition,
                    summary: {
                        totalPositions: election.electionPositions.length,
                        totalCandidates: election.electionCandidates.length,
                        totalVotes,
                        totalVoters,
                        votersWhoVoted,
                        voterTurnout: `${voterTurnout}%`,
                        duration: `${durationInMinutes} minutes`,
                        status: election.status
                    }
                };
            }));
            return {
                message: 'Election history retrieved successfully',
                totalElections: electionHistory.length,
                elections: electionHistory
            };
        }
        catch (error) {
            console.error('Error getting election history:', error);
            throw new Error('Failed to get election history');
        }
    }
};
exports.ElectionService = ElectionService;
exports.ElectionService = ElectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService,
        timezone_service_1.TimezoneService,
        voting_gateway_1.VotingGateway])
], ElectionService);
//# sourceMappingURL=election.service.js.map