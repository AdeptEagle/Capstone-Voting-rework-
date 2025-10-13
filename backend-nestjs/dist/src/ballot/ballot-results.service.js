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
exports.BallotResultsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BallotResultsService = class BallotResultsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBallotsWithResults(userId) {
        const ballots = await this.prisma.ballot.findMany({
            where: {
                Ballot_IsDeleted: false,
                Ballot_ShowResults: true,
                OR: [
                    { Ballot_Status: 'ACTIVE' },
                    { Ballot_Status: 'ENDED' },
                    { Ballot_Status: 'PAUSED' },
                ],
            },
            include: {
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
                ballotPositions: {
                    include: {
                        position: true,
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
                Ballot_StartDate: 'desc',
            },
        });
        if (userId) {
            const userHistory = await this.prisma.userBallotHistory.findMany({
                where: {
                    UserBallotHistory_UserId: userId,
                },
                include: {
                    ballot: true,
                },
            });
            const userHistoryMap = new Map(userHistory.map(history => [history.UserBallotHistory_BallotId, history]));
            return ballots.map(ballot => ({
                ...ballot,
                userVoted: userHistoryMap.has(ballot.id),
                userVoteCount: userHistoryMap.get(ballot.id)?.UserBallotHistory_VoteCount || 0,
                userLastAccessed: userHistoryMap.get(ballot.id)?.UserBallotHistory_LastAccessed,
            }));
        }
        return ballots;
    }
    async getBallotResults(ballotId) {
        const ballot = await this.prisma.ballot.findUnique({
            where: {
                id: ballotId,
                Ballot_IsDeleted: false,
            },
            include: {
                results: {
                    include: {
                        resultDetails: {
                            include: {
                                candidate: {
                                    include: {
                                        position: true,
                                        department: true,
                                        course: true,
                                    },
                                },
                                position: true,
                            },
                            orderBy: [
                                { BallotResultDetails_PositionId: 'asc' },
                                { BallotResultDetails_Rank: 'asc' },
                            ],
                        },
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
        if (!ballot.Ballot_ShowResults) {
            throw new common_1.NotFoundException('Results are not available for this ballot');
        }
        if (ballot.Ballot_ShowResultsAfter && new Date() < ballot.Ballot_ShowResultsAfter) {
            throw new common_1.NotFoundException('Results will be available after the specified date');
        }
        const actualVoteCount = ballot._count.votes;
        const storedVoteCount = ballot.results?.BallotResults_TotalVotes || 0;
        if (!ballot.results || ballot.results.BallotResults_TotalVotes === 0 || actualVoteCount !== storedVoteCount) {
            console.log(`Recalculating results for ballot ${ballotId}:`);
            console.log(`  Actual votes: ${actualVoteCount}`);
            console.log(`  Stored votes: ${storedVoteCount}`);
            console.log(`  Results exist: ${!!ballot.results}`);
            try {
                await this.calculateBallotResults(ballotId);
                console.log('Results calculation completed for ballot:', ballotId);
            }
            catch (error) {
                console.error('Error calculating results for ballot:', ballotId, error);
                throw error;
            }
            return this.prisma.ballot.findUnique({
                where: { id: ballotId },
                include: {
                    results: {
                        include: {
                            resultDetails: {
                                include: {
                                    candidate: {
                                        include: {
                                            position: true,
                                            department: true,
                                            course: true,
                                        },
                                    },
                                    position: true,
                                },
                                orderBy: [
                                    { BallotResultDetails_PositionId: 'asc' },
                                    { BallotResultDetails_Rank: 'asc' },
                                ],
                            },
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
                            candidate: true,
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
        }
        return ballot;
    }
    async getLiveBallotResults(ballotId) {
        const ballot = await this.prisma.ballot.findUnique({
            where: {
                id: ballotId,
                Ballot_IsDeleted: false,
                Ballot_Status: 'ACTIVE',
                Ballot_ShowLiveResults: true,
            },
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Live results not available for this ballot');
        }
        return this.getBallotResults(ballotId);
    }
    async refreshBallotResults(ballotId) {
        const ballot = await this.prisma.ballot.findUnique({
            where: {
                id: ballotId,
                Ballot_IsDeleted: false,
            },
            include: {
                votes: {
                    include: {
                        candidate: true,
                        position: true,
                    },
                },
                ballotPositions: {
                    include: {
                        position: true,
                    },
                },
                ballotCandidates: {
                    include: {
                        candidate: true,
                    },
                },
            },
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        return this.calculateBallotResults(ballotId);
    }
    async calculateBallotResults(ballotId) {
        console.log('🔍 Starting ballot results calculation for:', ballotId);
        const ballot = await this.prisma.ballot.findUnique({
            where: { id: ballotId },
            include: {
                votes: {
                    include: {
                        candidate: {
                            include: {
                                partyList: true,
                            },
                        },
                        position: true,
                    },
                },
                ballotPositions: {
                    include: {
                        position: true,
                    },
                },
                ballotCandidates: {
                    include: {
                        candidate: {
                            include: {
                                partyList: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        userHistory: true,
                    },
                },
            },
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        console.log(`📊 Found ${ballot.votes.length} votes for ballot ${ballotId}`);
        console.log(`📊 Found ${ballot.ballotPositions.length} positions for ballot ${ballotId}`);
        console.log(`📊 Found ${ballot.ballotCandidates.length} candidates for ballot ${ballotId}`);
        const totalVotes = ballot.votes.length;
        const uniqueVoters = new Set(ballot.votes.map(vote => vote.voterId)).size;
        const voterTurnout = ballot._count?.userHistory ? (uniqueVoters / ballot._count.userHistory) * 100 : 0;
        const positionResults = new Map();
        for (const vote of ballot.votes) {
            const positionId = vote.positionId;
            const candidateId = vote.candidateId;
            if (!positionResults.has(positionId)) {
                positionResults.set(positionId, new Map());
            }
            const candidateResults = positionResults.get(positionId);
            candidateResults.set(candidateId, (candidateResults.get(candidateId) || 0) + 1);
        }
        const resultDetails = [];
        for (const [positionId, candidateVotes] of positionResults) {
            const positionVotes = Array.from(candidateVotes.values());
            const totalPositionVotes = positionVotes.reduce((sum, votes) => sum + votes, 0);
            const sortedCandidates = Array.from(candidateVotes.entries())
                .map(([candidateId, voteCount]) => ({
                candidateId,
                voteCount,
                percentage: totalPositionVotes > 0 ? (voteCount / totalPositionVotes) * 100 : 0,
            }))
                .sort((a, b) => b.voteCount - a.voteCount);
            sortedCandidates.forEach((candidate, index) => {
                resultDetails.push({
                    BallotResultDetails_BallotId: ballotId,
                    BallotResultDetails_PositionId: positionId,
                    BallotResultDetails_CandidateId: candidate.candidateId,
                    BallotResultDetails_VoteCount: candidate.voteCount,
                    BallotResultDetails_Percentage: candidate.percentage,
                    BallotResultDetails_Rank: index + 1,
                    BallotResultDetails_LastUpdated: new Date(),
                });
            });
        }
        const partylistResults = await this.calculatePartylistResults(ballotId, ballot.votes);
        const resultsId = this.generateId();
        return this.prisma.$transaction(async (tx) => {
            await tx.ballotResultDetails.deleteMany({
                where: { BallotResultDetails_BallotId: ballotId },
            });
            await tx.ballotResults.deleteMany({
                where: { BallotResults_BallotId: ballotId },
            });
            const ballotResults = await tx.ballotResults.create({
                data: {
                    id: resultsId,
                    BallotResults_BallotId: ballotId,
                    BallotResults_TotalVotes: totalVotes,
                    BallotResults_TotalVoters: uniqueVoters,
                    BallotResults_VoterTurnout: voterTurnout,
                    BallotResults_LastUpdated: new Date(),
                    BallotResults_IsFinal: ballot.Ballot_Status === 'ENDED',
                },
            });
            if (resultDetails.length > 0) {
                await tx.ballotResultDetails.createMany({
                    data: resultDetails.map(detail => ({
                        id: this.generateId(),
                        ...detail,
                    })),
                });
            }
            console.log('✅ Ballot results calculation completed successfully for:', ballotId);
            console.log('📊 Partylist results:', partylistResults);
            return ballotResults;
        });
    }
    async calculatePartylistResults(ballotId, votes) {
        console.log('🏛️ Calculating partylist results for ballot:', ballotId);
        const partylistVotes = new Map();
        const partylistCandidates = new Map();
        for (const vote of votes) {
            const partylistId = vote.candidate.partyList?.id;
            const partylistName = vote.candidate.partyList?.name || 'Independent';
            if (partylistId) {
                partylistVotes.set(partylistId, (partylistVotes.get(partylistId) || 0) + 1);
                if (!partylistCandidates.has(partylistId)) {
                    partylistCandidates.set(partylistId, new Set());
                }
                partylistCandidates.get(partylistId).add(vote.candidateId);
            }
        }
        const totalVotes = votes.length;
        const partylistResults = [];
        for (const [partylistId, voteCount] of partylistVotes) {
            const partylist = await this.prisma.partyList.findUnique({
                where: { id: partylistId },
                select: {
                    id: true,
                    name: true,
                    color: true,
                    logo: true,
                },
            });
            if (partylist) {
                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                const candidateCount = partylistCandidates.get(partylistId)?.size || 0;
                partylistResults.push({
                    partylistId: partylist.id,
                    partylistName: partylist.name,
                    partylistColor: partylist.color,
                    partylistLogo: partylist.logo,
                    totalVotes: voteCount,
                    percentage: percentage,
                    candidateCount: candidateCount,
                    averageVotesPerCandidate: candidateCount > 0 ? voteCount / candidateCount : 0,
                });
            }
        }
        partylistResults.sort((a, b) => b.totalVotes - a.totalVotes);
        console.log(`📊 Partylist results calculated: ${partylistResults.length} partylists`);
        return partylistResults;
    }
    async getPartylistResults(ballotId) {
        console.log('🏛️ Fetching partylist results for ballot:', ballotId);
        const ballot = await this.prisma.ballot.findUnique({
            where: { id: ballotId },
            include: {
                votes: {
                    include: {
                        candidate: {
                            include: {
                                partyList: true,
                            },
                        },
                    },
                },
            },
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        if (!ballot.Ballot_ShowResults) {
            throw new common_1.NotFoundException('Results are not available for this ballot');
        }
        if (ballot.Ballot_ShowResultsAfter && new Date() < ballot.Ballot_ShowResultsAfter) {
            throw new common_1.NotFoundException('Results will be available after the specified date');
        }
        return this.calculatePartylistResults(ballotId, ballot.votes);
    }
    async getBallotAnalytics(ballotId) {
        console.log('📊 Fetching analytics for ballot:', ballotId);
        const ballot = await this.prisma.ballot.findUnique({
            where: { id: ballotId },
            include: {
                votes: {
                    include: {
                        candidate: {
                            include: {
                                position: true,
                                department: true,
                                course: true,
                                partyList: true,
                            },
                        },
                        position: true,
                    },
                },
                ballotPositions: {
                    include: {
                        position: true,
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
                    include: {
                        user: {
                            include: {
                                department: true,
                                course: true,
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
        if (!ballot.Ballot_ShowResults) {
            throw new common_1.NotFoundException('Results are not available for this ballot');
        }
        if (ballot.Ballot_ShowResultsAfter && new Date() < ballot.Ballot_ShowResultsAfter) {
            throw new common_1.NotFoundException('Results will be available after the specified date');
        }
        const analytics = {
            basicStats: {
                totalVotes: ballot._count.votes,
                totalVoters: ballot._count.userHistory,
                voterTurnout: ballot._count.userHistory > 0 ? (ballot._count.votes / ballot._count.userHistory) * 100 : 0,
                averageVotesPerVoter: ballot._count.userHistory > 0 ? ballot._count.votes / ballot._count.userHistory : 0,
                ballotDuration: Math.ceil((new Date(ballot.Ballot_EndDate).getTime() - new Date(ballot.Ballot_StartDate).getTime()) / (1000 * 60 * 60 * 24)),
            },
            positionAnalytics: this.calculatePositionAnalytics(ballot),
            departmentAnalytics: this.calculateDepartmentAnalytics(ballot),
            courseAnalytics: this.calculateCourseAnalytics(ballot),
            partylistAnalytics: this.calculatePartylistAnalytics(ballot),
            votingPatterns: this.calculateVotingPatterns(ballot),
            timeAnalytics: this.calculateTimeAnalytics(ballot),
            candidateAnalytics: this.calculateCandidateAnalytics(ballot),
        };
        console.log('📊 Analytics calculated successfully');
        return analytics;
    }
    calculatePositionAnalytics(ballot) {
        const positionStats = {};
        ballot.ballotPositions.forEach(bp => {
            const positionId = bp.BallotPosition_PositionId;
            const positionVotes = ballot.votes.filter(v => v.positionId === positionId);
            const positionCandidates = ballot.ballotCandidates.filter(bc => bc.BallotCandidate_PositionId === positionId);
            const candidateVoteCounts = positionCandidates.map(candidate => {
                const votes = positionVotes.filter(v => v.candidateId === candidate.BallotCandidate_CandidateId).length;
                return {
                    candidateId: candidate.BallotCandidate_CandidateId,
                    candidateName: candidate.candidate.Candidate_Name,
                    votes: votes,
                    percentage: positionVotes.length > 0 ? (votes / positionVotes.length) * 100 : 0,
                };
            });
            positionStats[positionId] = {
                positionTitle: bp.position.Position_Title,
                totalVotes: positionVotes.length,
                candidateCount: positionCandidates.length,
                candidates: candidateVoteCounts.sort((a, b) => b.votes - a.votes),
                competitiveness: this.calculateCompetitiveness(candidateVoteCounts),
            };
        });
        return positionStats;
    }
    calculateDepartmentAnalytics(ballot) {
        const departmentStats = {};
        ballot.votes.forEach(vote => {
            const departmentId = vote.candidate.department?.id;
            const departmentName = vote.candidate.department?.Department_Name || 'Unknown';
            if (!departmentStats[departmentId]) {
                departmentStats[departmentId] = {
                    departmentName,
                    totalVotes: 0,
                    candidates: new Set(),
                    positions: new Set(),
                };
            }
            departmentStats[departmentId].totalVotes++;
            departmentStats[departmentId].candidates.add(vote.candidateId);
            departmentStats[departmentId].positions.add(vote.positionId);
        });
        const departmentRegistration = {};
        ballot.userHistory.forEach(history => {
            const deptId = history.user.department?.id;
            const deptName = history.user.department?.Department_Name || 'Unknown';
            if (!departmentRegistration[deptId]) {
                departmentRegistration[deptId] = {
                    departmentName: deptName,
                    registeredStudents: 0,
                    votedStudents: 0,
                };
            }
            departmentRegistration[deptId].registeredStudents++;
            if (history.UserBallotHistory_IsCompleted) {
                departmentRegistration[deptId].votedStudents++;
            }
        });
        const enhancedDepartmentStats = Object.values(departmentStats).map((dept) => {
            const registrationData = Object.values(departmentRegistration).find((reg) => reg.departmentName === dept.departmentName);
            const registeredStudents = registrationData?.registeredStudents || 0;
            const votedStudents = registrationData?.votedStudents || 0;
            const participationRate = registeredStudents > 0 ? (votedStudents / registeredStudents) * 100 : 0;
            return {
                departmentName: dept.departmentName,
                totalVotes: dept.totalVotes,
                uniqueCandidates: dept.candidates.size,
                positionsContested: dept.positions.size,
                voteShare: ballot._count.votes > 0 ? (dept.totalVotes / ballot._count.votes) * 100 : 0,
                registeredStudents,
                votedStudents,
                participationRate,
                averageVotesPerVoter: votedStudents > 0 ? dept.totalVotes / votedStudents : 0,
            };
        });
        return enhancedDepartmentStats.sort((a, b) => b.totalVotes - a.totalVotes);
    }
    calculateCourseAnalytics(ballot) {
        const courseStats = {};
        ballot.votes.forEach(vote => {
            const courseId = vote.candidate.course?.id;
            const courseName = vote.candidate.course?.Course_Name || 'Unknown';
            if (!courseStats[courseId]) {
                courseStats[courseId] = {
                    courseName,
                    totalVotes: 0,
                    candidates: new Set(),
                };
            }
            courseStats[courseId].totalVotes++;
            courseStats[courseId].candidates.add(vote.candidateId);
        });
        return Object.values(courseStats).map((course) => ({
            courseName: course.courseName,
            totalVotes: course.totalVotes,
            uniqueCandidates: course.candidates.size,
            voteShare: ballot._count.votes > 0 ? (course.totalVotes / ballot._count.votes) * 100 : 0,
        })).sort((a, b) => b.totalVotes - a.totalVotes);
    }
    calculatePartylistAnalytics(ballot) {
        const partylistStats = {};
        ballot.votes.forEach(vote => {
            const partylistId = vote.candidate.partyList?.id;
            const partylistName = vote.candidate.partyList?.name || 'Independent';
            if (!partylistStats[partylistId]) {
                partylistStats[partylistId] = {
                    partylistName,
                    partylistColor: vote.candidate.partyList?.color,
                    totalVotes: 0,
                    candidates: new Set(),
                    positions: new Set(),
                };
            }
            partylistStats[partylistId].totalVotes++;
            partylistStats[partylistId].candidates.add(vote.candidateId);
            partylistStats[partylistId].positions.add(vote.positionId);
        });
        return Object.values(partylistStats).map((partylist) => ({
            partylistName: partylist.partylistName,
            partylistColor: partylist.partylistColor,
            totalVotes: partylist.totalVotes,
            uniqueCandidates: partylist.candidates.size,
            positionsContested: partylist.positions.size,
            voteShare: ballot._count.votes > 0 ? (partylist.totalVotes / ballot._count.votes) * 100 : 0,
            averageVotesPerCandidate: partylist.candidates.size > 0 ? partylist.totalVotes / partylist.candidates.size : 0,
        })).sort((a, b) => b.totalVotes - a.totalVotes);
    }
    calculateVotingPatterns(ballot) {
        const patterns = {
            abstentionRate: 0,
            completeVotingRate: 0,
            partialVotingRate: 0,
        };
        const totalVoters = ballot._count.userHistory;
        const totalVotes = ballot._count.votes;
        const totalPossibleVotes = ballot.ballotPositions.length * totalVoters;
        if (totalPossibleVotes > 0) {
            patterns.abstentionRate = ((totalPossibleVotes - totalVotes) / totalPossibleVotes) * 100;
        }
        const userVotingData = ballot.userHistory.map(history => ({
            userId: history.UserBallotHistory_UserId,
            voteCount: history.UserBallotHistory_VoteCount,
            isCompleted: history.UserBallotHistory_IsCompleted,
            department: history.user.department?.Department_Name,
            course: history.user.course?.Course_Name,
        }));
        const completedVoters = userVotingData.filter(u => u.isCompleted).length;
        const partialVoters = userVotingData.filter(u => u.voteCount > 0 && !u.isCompleted).length;
        patterns.completeVotingRate = totalVoters > 0 ? (completedVoters / totalVoters) * 100 : 0;
        patterns.partialVotingRate = totalVoters > 0 ? (partialVoters / totalVoters) * 100 : 0;
        return patterns;
    }
    calculateTimeAnalytics(ballot) {
        const startDate = new Date(ballot.Ballot_StartDate);
        const endDate = new Date(ballot.Ballot_EndDate);
        const now = new Date();
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            duration: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
            isActive: ballot.Ballot_Status === 'ACTIVE',
            isEnded: ballot.Ballot_Status === 'ENDED',
            timeRemaining: ballot.Ballot_Status === 'ACTIVE' ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
            votingProgress: ballot.Ballot_Status === 'ACTIVE' ?
                Math.min(100, Math.max(0, ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)) : 100,
        };
    }
    calculateCandidateAnalytics(ballot) {
        const candidateStats = {};
        ballot.votes.forEach(vote => {
            const candidateId = vote.candidateId;
            const candidateName = vote.candidate.Candidate_Name;
            if (!candidateStats[candidateId]) {
                candidateStats[candidateId] = {
                    candidateName,
                    totalVotes: 0,
                    positions: new Set(),
                    departments: new Set(),
                    courses: new Set(),
                };
            }
            candidateStats[candidateId].totalVotes++;
            candidateStats[candidateId].positions.add(vote.positionId);
            candidateStats[candidateId].departments.add(vote.candidate.department?.Department_Name);
            candidateStats[candidateId].courses.add(vote.candidate.course?.Course_Name);
        });
        return Object.values(candidateStats).map((candidate) => ({
            candidateName: candidate.candidateName,
            totalVotes: candidate.totalVotes,
            positionsContested: candidate.positions.size,
            departments: Array.from(candidate.departments),
            courses: Array.from(candidate.courses),
            voteShare: ballot._count.votes > 0 ? (candidate.totalVotes / ballot._count.votes) * 100 : 0,
        })).sort((a, b) => b.totalVotes - a.totalVotes);
    }
    calculateCompetitiveness(candidateVoteCounts) {
        if (candidateVoteCounts.length <= 1)
            return 0;
        const totalVotes = candidateVoteCounts.reduce((sum, c) => sum + c.votes, 0);
        if (totalVotes === 0)
            return 0;
        const hhi = candidateVoteCounts.reduce((sum, c) => {
            const share = c.votes / totalVotes;
            return sum + (share * share);
        }, 0);
        return Math.round((1 - hhi) * 100);
    }
    generateId() {
        const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `${firstPart}-${secondPart}`;
    }
};
exports.BallotResultsService = BallotResultsService;
exports.BallotResultsService = BallotResultsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BallotResultsService);
//# sourceMappingURL=ballot-results.service.js.map