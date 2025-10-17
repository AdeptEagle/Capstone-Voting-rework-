import { PrismaService } from '../prisma/prisma.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { UpdateBallotDto } from './dto/update-ballot.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
    }>;
    getBallots(filters?: {
        status?: BallotStatus;
        isActive?: boolean;
        createdBy?: string;
    }): Promise<({
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
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            votes: number;
            userHistory: number;
        };
        ballotCandidates: ({
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
                partyList: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
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
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                courseId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_IsActive: boolean;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
    })[]>;
    getBallotById(id: string): Promise<{
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
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            votes: number;
            userHistory: number;
        };
        ballotCandidates: ({
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
                partyList: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
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
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                courseId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_IsActive: boolean;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
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
                    deletedAt: Date | null;
                    isDeleted: boolean;
                    departmentId: string | null;
                    Candidate_Name: string;
                    Candidate_Email: string;
                    Candidate_StudentId: string;
                    photo: string | null;
                    manifesto: string | null;
                    party_list_name: string | null;
                    courseId: string | null;
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
    updateBallot(id: string, updateBallotDto: UpdateBallotDto, updatedBy: string): Promise<{
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
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            votes: number;
            userHistory: number;
        };
        ballotCandidates: ({
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
                partyList: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
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
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                courseId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_IsActive: boolean;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
    }>;
    getAvailableBallotsForUser(userId: string): Promise<({
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
                partyList: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
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
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                courseId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_IsActive: boolean;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
        })[];
        userHistory: {
            id: string;
            UserBallotHistory_VotedAt: Date | null;
            UserBallotHistory_UserId: string;
            UserBallotHistory_BallotId: string;
            UserBallotHistory_VoteCount: number;
            UserBallotHistory_IsCompleted: boolean;
            UserBallotHistory_LastAccessed: Date;
        }[];
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
    getUpcomingBallotsForUser(userId: string): Promise<({
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
                partyList: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
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
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                courseId: string | null;
                positionId: string;
                partyListId: string | null;
            };
        } & {
            id: string;
            BallotCandidate_IsActive: boolean;
            BallotCandidate_BallotId: string;
            BallotCandidate_CandidateId: string;
            BallotCandidate_PositionId: string;
        })[];
        userHistory: {
            id: string;
            UserBallotHistory_VotedAt: Date | null;
            UserBallotHistory_UserId: string;
            UserBallotHistory_BallotId: string;
            UserBallotHistory_VoteCount: number;
            UserBallotHistory_IsCompleted: boolean;
            UserBallotHistory_LastAccessed: Date;
        }[];
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
                BallotPosition_BallotId: string;
                BallotPosition_PositionId: string;
                BallotPosition_DisplayOrder: number;
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
            Ballot_CreatedBy: string;
            Ballot_CreatedAt: Date;
            Ballot_UpdatedAt: Date;
            Ballot_DeletedAt: Date | null;
            Ballot_IsDeleted: boolean;
        };
    } & {
        id: string;
        UserBallotHistory_VotedAt: Date | null;
        UserBallotHistory_UserId: string;
        UserBallotHistory_BallotId: string;
        UserBallotHistory_VoteCount: number;
        UserBallotHistory_IsCompleted: boolean;
        UserBallotHistory_LastAccessed: Date;
    })[]>;
    castBallotVote(castVoteDto: CastVoteDto, userId: string): Promise<{
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
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
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
