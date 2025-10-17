import { VoterService } from './voter.service';
import { CreateVoterDto, UpdateVoterDto } from './dto';
export declare class VoterController {
    private readonly voterService;
    constructor(voterService: VoterService);
    getAllVoters(): Promise<({
        department: {
            id: string;
            Department_Name: string;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
        };
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string;
        courseId: string;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    })[]>;
    createVoter(createVoterDto: CreateVoterDto): Promise<{
        message: string;
        voter: {
            id: string;
            studentId: string;
            name: string;
            email: string;
            hasVoted: boolean;
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
                Course_Code: string;
            };
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getVoterById(id: string): Promise<{
        department: {
            id: string;
            Department_Name: string;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
        };
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string;
        courseId: string;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    }>;
    getVoterByStudentId(studentId: string): Promise<{
        department: {
            id: string;
            Department_Name: string;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
        };
    } & {
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string;
        courseId: string;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    }>;
    updateVoter(id: string, updateVoterDto: UpdateVoterDto): Promise<{
        message: string;
        voter: {
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
                Course_Code: string;
            };
        } & {
            id: string;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string;
            courseId: string;
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
            hasVoted: boolean;
        };
    }>;
    deleteVoter(id: string): Promise<{
        message: string;
    }>;
    markVoterAsVoted(id: string): Promise<{
        message: string;
        voter: {
            id: string;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string;
            courseId: string;
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
            hasVoted: boolean;
        };
    }>;
    resetVoterVoteStatus(id: string): Promise<{
        message: string;
        voter: {
            id: string;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string;
            courseId: string;
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
            hasVoted: boolean;
        };
    }>;
    getVoterPassword(id: string): Promise<{
        message: string;
        voter: {
            id: string;
            studentId: string;
            name: string;
            email: string;
        };
        currentPassword: string;
        isDefaultPassword: boolean;
        defaultPassword: string;
    }>;
    resetVoterPassword(id: string): Promise<{
        message: string;
        newPassword: string;
        voter: {
            id: string;
            studentId: string;
            name: string;
            email: string;
        };
    }>;
    getVoterHistory(id: string): Promise<{
        voter: {
            id: string;
            name: string;
            email: string;
            studentId: string;
            hasVoted: boolean;
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
                Course_Code: string;
            };
            createdAt: Date;
            updatedAt: Date;
        };
        ballotHistory: ({
            ballot: {
                id: string;
                Ballot_Title: string;
                Ballot_Description: string;
                Ballot_StartDate: Date;
                Ballot_EndDate: Date;
                Ballot_Status: import(".prisma/client").$Enums.BallotStatus;
                Ballot_IsActive: boolean;
                Ballot_CreatedAt: Date;
            };
        } & {
            id: string;
            UserBallotHistory_VotedAt: Date | null;
            UserBallotHistory_UserId: string;
            UserBallotHistory_BallotId: string;
            UserBallotHistory_VoteCount: number;
            UserBallotHistory_IsCompleted: boolean;
            UserBallotHistory_LastAccessed: Date;
        })[];
        voteHistory: ({
            position: {
                id: string;
                Position_Title: string;
            };
            candidate: {
                id: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            positionId: string;
            ipAddress: string | null;
            userAgent: string | null;
            sessionId: string | null;
            auditHash: string | null;
            candidateId: string;
            electionId: string | null;
            verificationCode: string | null;
            voterId: string;
            ballotId: string | null;
        })[];
        statistics: {
            totalBallotsParticipated: number;
            totalVotesCast: number;
            lastVotedAt: Date;
            participationRate: number;
        };
    }>;
    getVoterBallotHistory(id: string): Promise<{
        voter: {
            id: string;
            name: string;
            studentId: string;
        };
        ballotHistory: {
            ballot: {
                id: string;
                title: string;
                description: string;
                status: import(".prisma/client").$Enums.BallotStatus;
                isActive: boolean;
                startDate: Date;
                endDate: Date;
                positions: {
                    id: string;
                    title: string;
                    isRequired: boolean;
                }[];
                candidates: {
                    id: string;
                    name: string;
                    studentId: string;
                    positionId: string;
                }[];
            };
            participation: {
                votedAt: Date;
                voteCount: number;
                isCompleted: boolean;
                lastAccessed: Date;
            };
        }[];
    }>;
    getVoterVotingDetails(id: string): Promise<{
        voter: {
            id: string;
            name: string;
            studentId: string;
            email: string;
        };
        votingDetails: {
            ballot: {
                id: string;
                title: string;
                status: import(".prisma/client").$Enums.BallotStatus;
                isActive: boolean;
                startDate: Date;
                endDate: Date;
            };
            participation: {
                votedAt: Date;
                voteCount: number;
                isCompleted: boolean;
                lastAccessed: Date;
            };
            votes: {
                id: string;
                candidate: {
                    id: string;
                    name: string;
                    studentId: string;
                };
                position: {
                    id: string;
                    title: string;
                };
                votedAt: Date;
            }[];
        }[];
        summary: {
            totalBallotsParticipated: number;
            totalVotesCast: number;
            lastVotedAt: Date;
            participationRate: number;
        };
    }>;
}
