import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getAnalytics(req: any, ballotId?: string, timeRange?: string): Promise<{
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
    getPositionAnalytics(ballotId?: string, timeRange?: string): Promise<{
        positionTitle: string;
        totalVotes: number;
        candidateCount: number;
        topCandidates: {
            candidateName: string;
            votes: number;
            percentage: number;
        }[];
        status: string;
    }[]>;
    getDepartmentAnalytics(ballotId?: string, timeRange?: string): Promise<{
        departmentName: any;
        registeredVoters: number;
        votesCast: any;
        participationRate: number;
        avgVotesPerVoter: number;
        topPosition: unknown;
    }[]>;
    getPartylistAnalytics(ballotId?: string, timeRange?: string): Promise<{
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
    }[]>;
    getVotingPatterns(ballotId?: string, timeRange?: string): Promise<{
        peakHours: {
            hour: number;
            votes: number;
        }[];
        earlyVoters: number;
        lastMinuteVoters: number;
        mobileUsers: number;
        desktopUsers: number;
    }>;
    getTimeAnalytics(ballotId?: string, timeRange?: string): Promise<{
        firstVote: string;
        lastVote: string;
        peakHour: string;
        dailyAverage: number;
        hourlyAverage: number;
        weekendRatio: number;
        votingDuration: number;
        fastestHour: string;
        slowestHour: string;
    }>;
    getSummaryAnalytics(ballotId?: string, timeRange?: string): Promise<{
        totalVotes: number;
        totalVoters: number;
        participationRate: number;
        mostCompetitivePosition: string;
        avgVotingTime: number;
        systemUptime: number;
        errorRate: number;
        dataIntegrity: number;
    }>;
}
