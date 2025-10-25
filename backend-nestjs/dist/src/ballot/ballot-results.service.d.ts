import { PrismaService } from '../prisma/prisma.service';
export declare class BallotResultsService {
    private prisma;
    constructor(prisma: PrismaService);
    getBallotsWithResults(userId?: string): Promise<({
        ballotPositions: ({
            position: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                Position_Title: string;
                Position_Description: string | null;
                displayOrder: number;
                voteLimit: number;
            };
        } & {
            id: string;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_DisplayOrder: number;
            BallotPosition_IsRequired: boolean;
        })[];
        _count: {
            votes: number;
            userHistory: number;
        };
        results: {
            resultDetails: ({
                position: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Position_Title: string;
                    Position_Description: string | null;
                    displayOrder: number;
                    voteLimit: number;
                };
                candidate: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string | null;
                    Candidate_Name: string;
                    Candidate_Email: string;
                    Candidate_StudentId: string;
                    photo: string | null;
                    manifesto: string | null;
                    positionId: string;
                    courseId: string | null;
                    partyListId: string | null;
                    party_list_name: string | null;
                };
            } & {
                id: string;
                BallotResultDetails_Rank: number;
                BallotResultDetails_PositionId: string;
                BallotResultDetails_BallotId: string;
                BallotResultDetails_CandidateId: string;
                BallotResultDetails_VoteCount: number;
                BallotResultDetails_Percentage: number;
                BallotResultDetails_LastUpdated: Date;
            })[];
        } & {
            id: string;
            BallotResults_BallotId: string;
            BallotResults_TotalVotes: number;
            BallotResults_TotalVoters: number;
            BallotResults_VoterTurnout: number;
            BallotResults_LastUpdated: Date;
            BallotResults_IsFinal: boolean;
        };
    } & {
        id: string;
        Ballot_Title: string;
        Ballot_Description: string | null;
        Ballot_StartDate: Date;
        Ballot_EndDate: Date;
        Ballot_Status: import(".prisma/client").$Enums.BallotStatus;
        Ballot_IsActive: boolean;
        Ballot_MaxVotesPerUser: number;
        Ballot_AllowMultipleVotes: boolean;
        Ballot_RequireAllPositions: boolean;
        Ballot_ShowResults: boolean;
        Ballot_ShowResultsAfter: Date | null;
        Ballot_ShowLiveResults: boolean;
        Ballot_AllowAbstain: boolean;
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
    })[]>;
    getBallotResults(ballotId: string): Promise<{
        ballotPositions: ({
            position: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                Position_Title: string;
                Position_Description: string | null;
                displayOrder: number;
                voteLimit: number;
            };
        } & {
            id: string;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_DisplayOrder: number;
            BallotPosition_IsRequired: boolean;
        })[];
        _count: {
            votes: number;
            userHistory: number;
        };
        ballotCandidates: ({
            candidate: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                positionId: string;
                courseId: string | null;
                partyListId: string | null;
                party_list_name: string | null;
            };
        } & {
            id: string;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
            BallotCandidate_IsActive: boolean;
        })[];
        results: {
            resultDetails: ({
                position: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Position_Title: string;
                    Position_Description: string | null;
                    displayOrder: number;
                    voteLimit: number;
                };
                candidate: {
                    department: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        Department_Name: string;
                        Department_Description: string | null;
                        deletedAt: Date | null;
                        isDeleted: boolean;
                        createdBy: string;
                    };
                    course: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        deletedAt: Date | null;
                        isDeleted: boolean;
                        createdBy: string;
                        Course_Name: string;
                        Course_Code: string;
                        Course_Description: string | null;
                        departmentId: string;
                    };
                    position: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        deletedAt: Date | null;
                        isDeleted: boolean;
                        Position_Title: string;
                        Position_Description: string | null;
                        displayOrder: number;
                        voteLimit: number;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string | null;
                    Candidate_Name: string;
                    Candidate_Email: string;
                    Candidate_StudentId: string;
                    photo: string | null;
                    manifesto: string | null;
                    positionId: string;
                    courseId: string | null;
                    partyListId: string | null;
                    party_list_name: string | null;
                };
            } & {
                id: string;
                BallotResultDetails_Rank: number;
                BallotResultDetails_PositionId: string;
                BallotResultDetails_BallotId: string;
                BallotResultDetails_CandidateId: string;
                BallotResultDetails_VoteCount: number;
                BallotResultDetails_Percentage: number;
                BallotResultDetails_LastUpdated: Date;
            })[];
        } & {
            id: string;
            BallotResults_BallotId: string;
            BallotResults_TotalVotes: number;
            BallotResults_TotalVoters: number;
            BallotResults_VoterTurnout: number;
            BallotResults_LastUpdated: Date;
            BallotResults_IsFinal: boolean;
        };
    } & {
        id: string;
        Ballot_Title: string;
        Ballot_Description: string | null;
        Ballot_StartDate: Date;
        Ballot_EndDate: Date;
        Ballot_Status: import(".prisma/client").$Enums.BallotStatus;
        Ballot_IsActive: boolean;
        Ballot_MaxVotesPerUser: number;
        Ballot_AllowMultipleVotes: boolean;
        Ballot_RequireAllPositions: boolean;
        Ballot_ShowResults: boolean;
        Ballot_ShowResultsAfter: Date | null;
        Ballot_ShowLiveResults: boolean;
        Ballot_AllowAbstain: boolean;
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
    }>;
    getLiveBallotResults(ballotId: string): Promise<{
        ballotPositions: ({
            position: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                Position_Title: string;
                Position_Description: string | null;
                displayOrder: number;
                voteLimit: number;
            };
        } & {
            id: string;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_DisplayOrder: number;
            BallotPosition_IsRequired: boolean;
        })[];
        _count: {
            votes: number;
            userHistory: number;
        };
        ballotCandidates: ({
            candidate: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                positionId: string;
                courseId: string | null;
                partyListId: string | null;
                party_list_name: string | null;
            };
        } & {
            id: string;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
            BallotCandidate_IsActive: boolean;
        })[];
        results: {
            resultDetails: ({
                position: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Position_Title: string;
                    Position_Description: string | null;
                    displayOrder: number;
                    voteLimit: number;
                };
                candidate: {
                    department: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        Department_Name: string;
                        Department_Description: string | null;
                        deletedAt: Date | null;
                        isDeleted: boolean;
                        createdBy: string;
                    };
                    course: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        deletedAt: Date | null;
                        isDeleted: boolean;
                        createdBy: string;
                        Course_Name: string;
                        Course_Code: string;
                        Course_Description: string | null;
                        departmentId: string;
                    };
                    position: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        deletedAt: Date | null;
                        isDeleted: boolean;
                        Position_Title: string;
                        Position_Description: string | null;
                        displayOrder: number;
                        voteLimit: number;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string | null;
                    Candidate_Name: string;
                    Candidate_Email: string;
                    Candidate_StudentId: string;
                    photo: string | null;
                    manifesto: string | null;
                    positionId: string;
                    courseId: string | null;
                    partyListId: string | null;
                    party_list_name: string | null;
                };
            } & {
                id: string;
                BallotResultDetails_Rank: number;
                BallotResultDetails_PositionId: string;
                BallotResultDetails_BallotId: string;
                BallotResultDetails_CandidateId: string;
                BallotResultDetails_VoteCount: number;
                BallotResultDetails_Percentage: number;
                BallotResultDetails_LastUpdated: Date;
            })[];
        } & {
            id: string;
            BallotResults_BallotId: string;
            BallotResults_TotalVotes: number;
            BallotResults_TotalVoters: number;
            BallotResults_VoterTurnout: number;
            BallotResults_LastUpdated: Date;
            BallotResults_IsFinal: boolean;
        };
    } & {
        id: string;
        Ballot_Title: string;
        Ballot_Description: string | null;
        Ballot_StartDate: Date;
        Ballot_EndDate: Date;
        Ballot_Status: import(".prisma/client").$Enums.BallotStatus;
        Ballot_IsActive: boolean;
        Ballot_MaxVotesPerUser: number;
        Ballot_AllowMultipleVotes: boolean;
        Ballot_RequireAllPositions: boolean;
        Ballot_ShowResults: boolean;
        Ballot_ShowResultsAfter: Date | null;
        Ballot_ShowLiveResults: boolean;
        Ballot_AllowAbstain: boolean;
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
    }>;
    refreshBallotResults(ballotId: string): Promise<{
        id: string;
        BallotResults_BallotId: string;
        BallotResults_TotalVotes: number;
        BallotResults_TotalVoters: number;
        BallotResults_VoterTurnout: number;
        BallotResults_LastUpdated: Date;
        BallotResults_IsFinal: boolean;
    }>;
    calculateBallotResults(ballotId: string): Promise<{
        id: string;
        BallotResults_BallotId: string;
        BallotResults_TotalVotes: number;
        BallotResults_TotalVoters: number;
        BallotResults_VoterTurnout: number;
        BallotResults_LastUpdated: Date;
        BallotResults_IsFinal: boolean;
    }>;
    calculatePartylistResults(ballotId: string, votes: any[]): Promise<any[]>;
    getPartylistResults(ballotId: string): Promise<any[]>;
    getBallotAnalytics(ballotId: string): Promise<{
        basicStats: {
            totalVotes: number;
            totalVoters: number;
            voterTurnout: number;
            averageVotesPerVoter: number;
            ballotDuration: number;
        };
        positionAnalytics: {};
        departmentAnalytics: {
            departmentName: any;
            totalVotes: any;
            uniqueCandidates: any;
            positionsContested: any;
            voteShare: number;
            registeredStudents: any;
            votedStudents: any;
            participationRate: number;
            averageVotesPerVoter: number;
        }[];
        courseAnalytics: {
            courseName: any;
            totalVotes: any;
            uniqueCandidates: any;
            voteShare: number;
        }[];
        partylistAnalytics: {
            partylistName: any;
            partylistColor: any;
            totalVotes: any;
            uniqueCandidates: any;
            positionsContested: any;
            voteShare: number;
            averageVotesPerCandidate: number;
        }[];
        votingPatterns: {
            abstentionRate: number;
            completeVotingRate: number;
            partialVotingRate: number;
        };
        timeAnalytics: {
            startDate: string;
            endDate: string;
            duration: number;
            isActive: boolean;
            isEnded: boolean;
            timeRemaining: number;
            votingProgress: number;
        };
        candidateAnalytics: {
            candidateName: any;
            totalVotes: any;
            positionsContested: any;
            departments: unknown[];
            courses: unknown[];
            voteShare: number;
        }[];
    }>;
    private calculatePositionAnalytics;
    private calculateDepartmentAnalytics;
    private calculateCourseAnalytics;
    private calculatePartylistAnalytics;
    private calculateVotingPatterns;
    private calculateTimeAnalytics;
    private calculateCandidateAnalytics;
    private calculateCompetitiveness;
    private generateId;
}
