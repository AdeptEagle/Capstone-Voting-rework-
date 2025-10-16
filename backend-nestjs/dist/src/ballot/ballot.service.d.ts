import { PrismaService } from '../prisma/prisma.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { UpdateBallotDto } from './dto/update-ballot.dto';
import { BallotStatus } from '@prisma/client';
export declare class BallotService {
    private prisma;
    constructor(prisma: PrismaService);
    createBallot(createBallotDto: CreateBallotDto, createdBy: string): Promise<{
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    getBallots(filters?: {
        status?: BallotStatus;
        isActive?: boolean;
        createdBy?: string;
    }): Promise<({
        ballotCandidates: ({
            candidate: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Department_Name: string;
                    Department_Description: string | null;
                    createdBy: string;
                };
                course: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string;
                    createdBy: string;
                    Course_Name: string;
                    Course_Code: string;
                    Course_Description: string | null;
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
                partyList: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    description: string | null;
                    color: string | null;
                    logo: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                deletedAt: Date | null;
                isDeleted: boolean;
                courseId: string | null;
                departmentId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
            BallotCandidate_IsActive: boolean;
        })[];
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
            BallotPosition_DisplayOrder: number;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_IsRequired: boolean;
        })[];
        results: {
            id: string;
            BallotResults_BallotId: string;
            BallotResults_TotalVotes: number;
            BallotResults_TotalVoters: number;
            BallotResults_VoterTurnout: number;
            BallotResults_LastUpdated: Date;
            BallotResults_IsFinal: boolean;
        };
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            userHistory: number;
            votes: number;
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    })[]>;
    getBallotById(id: string): Promise<{
        ballotCandidates: ({
            candidate: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Department_Name: string;
                    Department_Description: string | null;
                    createdBy: string;
                };
                course: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string;
                    createdBy: string;
                    Course_Name: string;
                    Course_Code: string;
                    Course_Description: string | null;
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
                partyList: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    description: string | null;
                    color: string | null;
                    logo: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                deletedAt: Date | null;
                isDeleted: boolean;
                courseId: string | null;
                departmentId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
            BallotCandidate_IsActive: boolean;
        })[];
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
            BallotPosition_DisplayOrder: number;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_IsRequired: boolean;
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
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    Candidate_Name: string;
                    Candidate_Email: string;
                    Candidate_StudentId: string;
                    photo: string | null;
                    manifesto: string | null;
                    party_list_name: string | null;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    courseId: string | null;
                    departmentId: string | null;
                    positionId: string;
                    partyListId: string | null;
                };
            } & {
                id: string;
                BallotResultDetails_BallotId: string;
                BallotResultDetails_PositionId: string;
                BallotResultDetails_CandidateId: string;
                BallotResultDetails_VoteCount: number;
                BallotResultDetails_Percentage: number;
                BallotResultDetails_Rank: number;
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
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            userHistory: number;
            votes: number;
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    updateBallot(id: string, updateBallotDto: UpdateBallotDto, updatedBy: string): Promise<{
        ballotCandidates: ({
            candidate: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Department_Name: string;
                    Department_Description: string | null;
                    createdBy: string;
                };
                course: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string;
                    createdBy: string;
                    Course_Name: string;
                    Course_Code: string;
                    Course_Description: string | null;
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
                partyList: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    description: string | null;
                    color: string | null;
                    logo: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                deletedAt: Date | null;
                isDeleted: boolean;
                courseId: string | null;
                departmentId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
            BallotCandidate_IsActive: boolean;
        })[];
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
            BallotPosition_DisplayOrder: number;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_IsRequired: boolean;
        })[];
        results: {
            id: string;
            BallotResults_BallotId: string;
            BallotResults_TotalVotes: number;
            BallotResults_TotalVoters: number;
            BallotResults_VoterTurnout: number;
            BallotResults_LastUpdated: Date;
            BallotResults_IsFinal: boolean;
        };
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            userHistory: number;
            votes: number;
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    deleteBallot(id: string, deletedBy: string): Promise<{
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    activateBallot(id: string, activatedBy: string): Promise<{
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    pauseBallot(id: string, pausedBy: string): Promise<{
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    endBallot(id: string, endedBy: string): Promise<{
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    cancelBallot(id: string, cancelledBy: string): Promise<{
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    getAvailableBallotsForUser(userId: string): Promise<({
        ballotCandidates: ({
            candidate: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Department_Name: string;
                    Department_Description: string | null;
                    createdBy: string;
                };
                course: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string;
                    createdBy: string;
                    Course_Name: string;
                    Course_Code: string;
                    Course_Description: string | null;
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
                partyList: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    description: string | null;
                    color: string | null;
                    logo: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                deletedAt: Date | null;
                isDeleted: boolean;
                courseId: string | null;
                departmentId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
            BallotCandidate_IsActive: boolean;
        })[];
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
            BallotPosition_DisplayOrder: number;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_IsRequired: boolean;
        })[];
        userHistory: {
            id: string;
            UserBallotHistory_UserId: string;
            UserBallotHistory_BallotId: string;
            UserBallotHistory_VotedAt: Date | null;
            UserBallotHistory_VoteCount: number;
            UserBallotHistory_IsCompleted: boolean;
            UserBallotHistory_LastAccessed: Date;
        }[];
        _count: {
            userHistory: number;
            votes: number;
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    })[]>;
    getUpcomingBallotsForUser(userId: string): Promise<({
        ballotCandidates: ({
            candidate: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    Department_Name: string;
                    Department_Description: string | null;
                    createdBy: string;
                };
                course: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string;
                    createdBy: string;
                    Course_Name: string;
                    Course_Code: string;
                    Course_Description: string | null;
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
                partyList: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    description: string | null;
                    color: string | null;
                    logo: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                deletedAt: Date | null;
                isDeleted: boolean;
                courseId: string | null;
                departmentId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
            BallotCandidate_IsActive: boolean;
        })[];
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
            BallotPosition_DisplayOrder: number;
            BallotPosition_BallotId: string;
            BallotPosition_PositionId: string;
            BallotPosition_IsRequired: boolean;
        })[];
        userHistory: {
            id: string;
            UserBallotHistory_UserId: string;
            UserBallotHistory_BallotId: string;
            UserBallotHistory_VotedAt: Date | null;
            UserBallotHistory_VoteCount: number;
            UserBallotHistory_IsCompleted: boolean;
            UserBallotHistory_LastAccessed: Date;
        }[];
        _count: {
            userHistory: number;
            votes: number;
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    })[]>;
    getUserBallotHistory(userId: string): Promise<({
        ballot: {
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
                BallotPosition_DisplayOrder: number;
                BallotPosition_BallotId: string;
                BallotPosition_PositionId: string;
                BallotPosition_IsRequired: boolean;
            })[];
            results: {
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
            Ballot_CreatedAt: Date;
            Ballot_UpdatedAt: Date;
            Ballot_DeletedAt: Date | null;
            Ballot_IsDeleted: boolean;
            Ballot_CreatedBy: string;
        };
    } & {
        id: string;
        UserBallotHistory_UserId: string;
        UserBallotHistory_BallotId: string;
        UserBallotHistory_VotedAt: Date | null;
        UserBallotHistory_VoteCount: number;
        UserBallotHistory_IsCompleted: boolean;
        UserBallotHistory_LastAccessed: Date;
    })[]>;
    castBallotVote(castVoteDto: any, userId: string): Promise<{
        message: string;
        votes: any[];
        totalVotes: number;
        ballot: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.BallotStatus;
        };
    }>;
    getBallotResults(ballotId: string): Promise<{
        ballot: {
            id: string;
            title: string;
            description: string;
            status: import(".prisma/client").$Enums.BallotStatus;
            isActive: boolean;
            startDate: Date;
            endDate: Date;
        };
        results: any[];
        totalParticipants: number;
        generatedAt: Date;
    }>;
    private generateId;
    bulkActivateBallots(ballotIds: string[], activatedBy: string): Promise<{
        totalProcessed: number;
        successful: number;
        failed: number;
        results: any[];
    }>;
    bulkPauseBallots(ballotIds: string[], pausedBy: string): Promise<{
        totalProcessed: number;
        successful: number;
        failed: number;
        results: any[];
    }>;
    bulkEndBallots(ballotIds: string[], endedBy: string): Promise<{
        totalProcessed: number;
        successful: number;
        failed: number;
        results: any[];
    }>;
    bulkDeleteBallots(ballotIds: string[], deletedBy: string): Promise<{
        totalProcessed: number;
        successful: number;
        failed: number;
        results: any[];
    }>;
    bulkUpdateBallotStatus(ballotIds: string[], status: BallotStatus, updatedBy: string): Promise<{
        totalProcessed: number;
        successful: number;
        failed: number;
        results: any[];
    }>;
    createBallotFromTemplate(ballotData: any, createdBy: string): Promise<{
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
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
        Ballot_CreatedBy: string;
    }>;
    checkAndAutoStartBallots(): Promise<{
        autoStartedBallots: any[];
        totalChecked: number;
    }>;
    checkAndAutoEndBallots(): Promise<{
        autoEndedBallots: any[];
        totalChecked: number;
    }>;
}
