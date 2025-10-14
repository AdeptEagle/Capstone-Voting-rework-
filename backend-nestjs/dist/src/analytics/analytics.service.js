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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAnalyticsData(ballotId, timeRange, userId) {
        const whereClause = this.buildWhereClause(ballotId, timeRange);
        const [positionAnalytics, departmentAnalytics, partylistAnalytics, votingPatterns, timeAnalytics, summary] = await Promise.all([
            this.getPositionAnalytics(whereClause),
            this.getDepartmentAnalytics(whereClause),
            this.getPartylistAnalytics(whereClause),
            this.getVotingPatterns(whereClause),
            this.getTimeAnalytics(whereClause),
            this.getSummaryAnalytics(whereClause)
        ]);
        let userDepartmentVoting = null;
        if (userId) {
            userDepartmentVoting = await this.getUserDepartmentVoting(ballotId, userId);
        }
        return {
            positionAnalytics,
            departmentAnalytics,
            partylistAnalytics,
            votingPatterns,
            timeAnalytics,
            summary,
            userDepartmentVoting
        };
    }
    buildWhereClause(ballotId, timeRange) {
        const where = {};
        if (ballotId && ballotId !== 'all') {
            where.ballotId = ballotId;
        }
        if (timeRange && timeRange !== 'all') {
            const now = new Date();
            let startDate;
            switch (timeRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }
            where.createdAt = {
                gte: startDate
            };
        }
        return where;
    }
    async getPositionAnalytics(whereClause) {
        let positionFilter = {};
        if (whereClause.ballotId) {
            positionFilter = {
                ballotPositions: {
                    some: {
                        BallotPosition_BallotId: whereClause.ballotId
                    }
                }
            };
        }
        const positions = await this.prisma.position.findMany({
            where: positionFilter,
            include: {
                candidates: {
                    include: {
                        votes: {
                            where: whereClause
                        },
                        department: true
                    }
                },
                votes: {
                    where: whereClause
                }
            }
        });
        return positions
            .map(position => {
            const totalVotes = position.votes.length;
            const candidateCount = position.candidates.length;
            const candidateVotes = position.candidates.map(candidate => ({
                candidateName: candidate.Candidate_Name,
                votes: candidate.votes.length,
                percentage: totalVotes > 0 ? (candidate.votes.length / totalVotes) * 100 : 0
            })).sort((a, b) => b.votes - a.votes);
            const competitiveness = this.calculateCompetitiveness(candidateVotes);
            return {
                positionTitle: position.Position_Title,
                totalVotes,
                candidateCount,
                competitiveness: Math.round(competitiveness * 100) / 100,
                topCandidates: candidateVotes.slice(0, 3),
                status: totalVotes > 0 ? 'Active' : 'No Votes'
            };
        })
            .filter(position => position.totalVotes > 0);
    }
    async getDepartmentAnalytics(whereClause) {
        const votes = await this.prisma.vote.findMany({
            where: whereClause,
            include: {
                voter: {
                    include: {
                        department: true
                    }
                },
                candidate: {
                    include: {
                        position: true
                    }
                }
            }
        });
        const departmentVotes = votes.reduce((acc, vote) => {
            const voterDept = vote.voter.department;
            if (!voterDept) {
                return acc;
            }
            const deptName = voterDept.Department_Name;
            if (!acc[deptName]) {
                acc[deptName] = {
                    departmentName: deptName,
                    votes: 0,
                    uniqueVoters: new Set(),
                    positions: new Set()
                };
            }
            acc[deptName].votes += 1;
            acc[deptName].uniqueVoters.add(vote.voterId);
            acc[deptName].positions.add(vote.candidate.position.Position_Title);
            return acc;
        }, {});
        const departments = await this.prisma.department.findMany({
            include: {
                voters: true
            }
        });
        const result = Object.values(departmentVotes)
            .map((dept) => {
            const department = departments.find(d => d.Department_Name === dept.departmentName);
            const registeredVoters = department ? department.voters.length : 0;
            const actualVoters = dept.uniqueVoters.size;
            const participationRate = registeredVoters > 0 ?
                (actualVoters / registeredVoters) * 100 : 0;
            const avgVotesPerVoter = actualVoters > 0 ? dept.votes / actualVoters : 0;
            return {
                departmentName: dept.departmentName,
                registeredVoters,
                votesCast: dept.votes,
                participationRate: Math.round(participationRate * 100) / 100,
                avgVotesPerVoter: Math.round(avgVotesPerVoter * 100) / 100,
                topPosition: Array.from(dept.positions)[0] || 'N/A'
            };
        })
            .filter(dept => dept.votesCast > 0);
        return result;
    }
    async getPartylistAnalytics(whereClause) {
        let partylistFilter = {};
        if (whereClause.ballotId) {
            partylistFilter = {
                candidates: {
                    some: {
                        ballotCandidates: {
                            some: {
                                BallotCandidate_BallotId: whereClause.ballotId
                            }
                        }
                    }
                }
            };
        }
        const partylists = await this.prisma.partyList.findMany({
            where: partylistFilter,
            include: {
                candidates: {
                    include: {
                        votes: {
                            where: whereClause
                        },
                        position: true,
                        ballotCandidates: whereClause.ballotId ? {
                            where: {
                                BallotCandidate_BallotId: whereClause.ballotId
                            }
                        } : true
                    }
                }
            }
        });
        const partylistResults = await Promise.all(partylists.map(async (partylist) => {
            const ballotCandidates = whereClause.ballotId
                ? partylist.candidates.filter(candidate => candidate.ballotCandidates?.some(bc => bc.BallotCandidate_BallotId === whereClause.ballotId))
                : partylist.candidates;
            const totalCandidates = ballotCandidates.length;
            const totalVotes = ballotCandidates.reduce((total, candidate) => total + candidate.votes.length, 0);
            const positionWinners = ballotCandidates.reduce((winners, candidate) => {
                const positionId = candidate.positionId;
                if (!winners[positionId] || candidate.votes.length > winners[positionId].votes) {
                    winners[positionId] = {
                        candidateId: candidate.id,
                        votes: candidate.votes.length,
                        positionName: candidate.position.Position_Title
                    };
                }
                return winners;
            }, {});
            const winningCandidates = Object.keys(positionWinners).length;
            const successRate = totalCandidates > 0 ? (winningCandidates / totalCandidates) * 100 : 0;
            const allVotes = await this.prisma.vote.count({ where: whereClause });
            const voteShare = allVotes > 0 ? (totalVotes / allVotes) * 100 : 0;
            const positionPerformance = await Promise.all(Object.entries(positionWinners).map(async ([positionId, winner]) => {
                const totalVotesForPosition = await this.prisma.vote.count({
                    where: {
                        ...whereClause,
                        candidate: {
                            positionId: positionId
                        }
                    }
                });
                const partylistVotesForPosition = ballotCandidates
                    .filter(candidate => candidate.positionId === positionId)
                    .reduce((total, candidate) => total + candidate.votes.length, 0);
                return {
                    positionName: winner.positionName,
                    performance: totalVotesForPosition > 0 ? (partylistVotesForPosition / totalVotesForPosition) * 100 : 0
                };
            }));
            return {
                partylistName: partylist.name,
                color: partylist.color || '#3498db',
                totalCandidates,
                winningCandidates,
                totalVotes,
                voteShare: Math.round(voteShare * 100) / 100,
                successRate: Math.round(successRate * 100) / 100,
                positionPerformance
            };
        }));
        return partylistResults.filter(partylist => partylist.totalVotes > 0);
    }
    async getVotingPatterns(whereClause) {
        const votes = await this.prisma.vote.findMany({
            where: whereClause,
            select: {
                createdAt: true,
                userAgent: true
            }
        });
        const hourlyVotes = votes.reduce((acc, vote) => {
            const hour = vote.createdAt.getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        const peakHours = Object.entries(hourlyVotes)
            .map(([hour, count]) => ({ hour: parseInt(hour), votes: count }))
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 5);
        const totalVotes = votes.length;
        const earlyVoters = votes.filter(vote => {
            const hour = vote.createdAt.getHours();
            return hour >= 6 && hour <= 10;
        }).length;
        const lastMinuteVoters = votes.filter(vote => {
            const hour = vote.createdAt.getHours();
            return hour >= 18 && hour <= 23;
        }).length;
        const mobileUsers = votes.filter(vote => vote.userAgent && /mobile|android|iphone/i.test(vote.userAgent)).length;
        const desktopUsers = totalVotes - mobileUsers;
        return {
            peakHours,
            earlyVoters: totalVotes > 0 ? Math.round((earlyVoters / totalVotes) * 100) : 0,
            lastMinuteVoters: totalVotes > 0 ? Math.round((lastMinuteVoters / totalVotes) * 100) : 0,
            mobileUsers: totalVotes > 0 ? Math.round((mobileUsers / totalVotes) * 100) : 0,
            desktopUsers: totalVotes > 0 ? Math.round((desktopUsers / totalVotes) * 100) : 0
        };
    }
    async getTimeAnalytics(whereClause) {
        const votes = await this.prisma.vote.findMany({
            where: whereClause,
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        if (votes.length === 0) {
            return {
                firstVote: 'N/A',
                lastVote: 'N/A',
                peakHour: 'N/A',
                dailyAverage: 0,
                hourlyAverage: 0,
                weekendRatio: 0,
                votingDuration: 0,
                fastestHour: 'N/A',
                slowestHour: 'N/A'
            };
        }
        const firstVote = votes[0].createdAt;
        const lastVote = votes[votes.length - 1].createdAt;
        const votingDuration = Math.ceil((lastVote.getTime() - firstVote.getTime()) / (1000 * 60 * 60 * 24));
        const hourlyVotes = votes.reduce((acc, vote) => {
            const hour = vote.createdAt.getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        const peakHour = Object.entries(hourlyVotes)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
        const hourlyAverage = votes.length / 24;
        const dailyAverage = votes.length / Math.max(votingDuration, 1);
        const weekendVotes = votes.filter(vote => {
            const day = vote.createdAt.getDay();
            return day === 0 || day === 6;
        }).length;
        const weekendRatio = votes.length > 0 ? Math.round((weekendVotes / votes.length) * 100) : 0;
        const hourlyRates = Object.entries(hourlyVotes)
            .map(([hour, count]) => ({ hour: parseInt(hour), rate: count }))
            .sort((a, b) => b.rate - a.rate);
        const fastestHour = hourlyRates[0]?.hour || 'N/A';
        const slowestHour = hourlyRates[hourlyRates.length - 1]?.hour || 'N/A';
        return {
            firstVote: firstVote.toLocaleString(),
            lastVote: lastVote.toLocaleString(),
            peakHour: `${peakHour}:00`,
            dailyAverage: Math.round(dailyAverage * 100) / 100,
            hourlyAverage: Math.round(hourlyAverage * 100) / 100,
            weekendRatio,
            votingDuration,
            fastestHour: `${fastestHour}:00`,
            slowestHour: `${slowestHour}:00`
        };
    }
    async getSummaryAnalytics(whereClause) {
        const [totalVotes, totalVoters, positions] = await Promise.all([
            this.prisma.vote.count({ where: whereClause }),
            this.prisma.voter.count(),
            this.prisma.position.findMany({
                include: {
                    candidates: {
                        include: {
                            votes: {
                                where: whereClause
                            }
                        }
                    }
                }
            })
        ]);
        const participationRate = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;
        const positionCompetitiveness = positions.map(position => {
            const candidateVotes = position.candidates.map(candidate => candidate.votes.length);
            const competitiveness = this.calculateCompetitiveness(candidateVotes.map((votes, index) => ({
                candidateName: position.candidates[index].Candidate_Name,
                votes,
                percentage: 0
            })));
            return {
                positionTitle: position.Position_Title,
                competitiveness
            };
        });
        const mostCompetitivePosition = positionCompetitiveness
            .sort((a, b) => b.competitiveness - a.competitiveness)[0]?.positionTitle || 'N/A';
        return {
            totalVotes,
            totalVoters,
            participationRate: Math.round(participationRate * 100) / 100,
            mostCompetitivePosition,
            avgVotingTime: 5,
            systemUptime: 99.9,
            errorRate: 0.1,
            dataIntegrity: 100
        };
    }
    calculateCompetitiveness(candidateVotes) {
        if (candidateVotes.length === 0)
            return 0;
        const totalVotes = candidateVotes.reduce((sum, candidate) => sum + candidate.votes, 0);
        if (totalVotes === 0)
            return 0;
        const sortedVotes = candidateVotes
            .map(c => c.votes)
            .sort((a, b) => a - b);
        const n = sortedVotes.length;
        let gini = 0;
        for (let i = 0; i < n; i++) {
            gini += (2 * (i + 1) - n - 1) * sortedVotes[i];
        }
        gini = gini / (n * totalVotes);
        return Math.max(0, 1 - gini);
    }
    async getUserDepartmentVoting(ballotId, userId) {
        if (!userId)
            return null;
        const voter = await this.prisma.voter.findUnique({
            where: { id: userId },
            include: {
                department: true
            }
        });
        if (!voter || !voter.department)
            return null;
        const userVotes = await this.prisma.vote.findMany({
            where: {
                voterId: userId,
                ...(ballotId && ballotId !== 'all' ? { ballotId } : {})
            },
            include: {
                candidate: {
                    include: {
                        position: true
                    }
                }
            }
        });
        return [{
                departmentName: voter.department.Department_Name,
                votes: userVotes.length,
                positionsVoted: new Set(userVotes.map(vote => vote.candidate.position.Position_Title)).size,
                positionsList: Array.from(new Set(userVotes.map(vote => vote.candidate.position.Position_Title)))
            }];
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map