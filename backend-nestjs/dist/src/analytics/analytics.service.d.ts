import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAnalyticsData(ballotId?: string, timeRange?: string, userId?: string): Promise<{
        positionAnalytics: {
            positionTitle: string;
            totalVotes: number;
            candidateCount: number;
            topCandidates: {
                candidateName: string;
                votes: number;
                percentage: number;
            }[];
            status: string;
        }[];
        departmentAnalytics: {
            departmentName: any;
            registeredVoters: number;
            votesCast: any;
            participationRate: number;
            avgVotesPerVoter: number;
            topPosition: unknown;
        }[];
        partylistAnalytics: {
            partylistName: any;
            color: any;
            totalCandidates: any;
            winningCandidates: number;
            totalVotes: any;
            voteShare: number;
            positionPerformance: {
                positionName: any;
                performance: number;
            }[];
        }[];
        votingPatterns: {
            peakHours: {
                hour: number;
                votes: number;
            }[];
            earlyVoters: number;
            lastMinuteVoters: number;
            mobileUsers: number;
            desktopUsers: number;
        };
        timeAnalytics: {
            firstVote: string;
            lastVote: string;
            peakHour: string;
            dailyAverage: number;
            hourlyAverage: number;
            weekendRatio: number;
            votingDuration: number;
            fastestHour: string;
            slowestHour: string;
        };
        summary: {
            totalVotes: number;
            totalVoters: number;
            participationRate: number;
            mostCompetitivePosition: string;
            avgVotingTime: number;
            systemUptime: number;
            errorRate: number;
            dataIntegrity: number;
        };
        userDepartmentVoting: any;
    }>;
    private buildWhereClause;
    private getPositionAnalytics;
    private getDepartmentAnalytics;
    private getPartylistAnalytics;
    private getVotingPatterns;
    private getTimeAnalytics;
    private getSummaryAnalytics;
    private calculateCompetitiveness;
    private getUserDepartmentVoting;
}
