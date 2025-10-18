import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuditService } from '../services/audit.service';
import { IdGeneratorService } from '../utils/id-generator.service';
import { VotingGateway } from '../websocket/voting.gateway';
export declare class VoteService {
    private prisma;
    private auditService;
    private idGenerator;
    private votingGateway;
    constructor(prisma: PrismaService, auditService: AuditService, idGenerator: IdGeneratorService, votingGateway: VotingGateway);
    getVoteById(id: string): Promise<{
        position: {
            id: string;
            Position_Title: string;
            displayOrder: number;
            voteLimit: number;
        };
        ballot: {
            id: string;
            Ballot_Title: string;
            Ballot_Description: string;
            Ballot_Status: import(".prisma/client").$Enums.BallotStatus;
        };
        candidate: {
            id: string;
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
            };
            position: {
                id: string;
                Position_Title: string;
                displayOrder: number;
            };
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string;
            partyList: {
                id: string;
                name: string;
            };
        };
        voter: {
            id: string;
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
            };
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        positionId: string;
        ipAddress: string | null;
        userAgent: string | null;
        sessionId: string | null;
        voterId: string;
        candidateId: string;
        auditHash: string | null;
        verificationCode: string | null;
        electionId: string | null;
        ballotId: string | null;
    }>;
    createVote(createVoteDto: CreateVoteDto): Promise<{
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
        ballot: {
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
        voter: {
            id: string;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string | null;
            courseId: string | null;
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
            hasVoted: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        positionId: string;
        ipAddress: string | null;
        userAgent: string | null;
        sessionId: string | null;
        voterId: string;
        candidateId: string;
        auditHash: string | null;
        verificationCode: string | null;
        electionId: string | null;
        ballotId: string | null;
    }>;
    getVotesByBallot(ballotId: string): Promise<({
        position: {
            id: string;
            Position_Title: string;
            displayOrder: number;
        };
        candidate: {
            id: string;
            position: {
                Position_Title: string;
                displayOrder: number;
            };
            Candidate_Name: string;
            Candidate_StudentId: string;
            photo: string;
            partyList: {
                name: string;
            };
        };
        voter: {
            id: string;
            department: {
                Department_Name: string;
            };
            course: {
                Course_Name: string;
            };
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        positionId: string;
        ipAddress: string | null;
        userAgent: string | null;
        sessionId: string | null;
        voterId: string;
        candidateId: string;
        auditHash: string | null;
        verificationCode: string | null;
        electionId: string | null;
        ballotId: string | null;
    })[]>;
    getVotesByVoter(voterId: string): Promise<({
        position: {
            id: string;
            Position_Title: string;
            displayOrder: number;
        };
        ballot: {
            id: string;
            Ballot_Title: string;
            Ballot_Status: import(".prisma/client").$Enums.BallotStatus;
        };
        candidate: {
            id: string;
            position: {
                Position_Title: string;
                displayOrder: number;
            };
            Candidate_Name: string;
            photo: string;
            partyList: {
                name: string;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        positionId: string;
        ipAddress: string | null;
        userAgent: string | null;
        sessionId: string | null;
        voterId: string;
        candidateId: string;
        auditHash: string | null;
        verificationCode: string | null;
        electionId: string | null;
        ballotId: string | null;
    })[]>;
    getVoteResults(ballotId: string): Promise<{
        position: string;
        candidates: any[];
    }[]>;
    getComprehensiveVoteAnalytics(ballotId: string): Promise<{
        totalVotes: number;
        uniqueVoters: number;
        departmentBreakdown: {};
        positionBreakdown: {};
        partyBreakdown: {};
        timestamp: Date;
    }>;
    getDepartmentVotingResults(ballotId: string): Promise<unknown[]>;
    deleteVote(id: string): Promise<{
        id: string;
        createdAt: Date;
        positionId: string;
        ipAddress: string | null;
        userAgent: string | null;
        sessionId: string | null;
        voterId: string;
        candidateId: string;
        auditHash: string | null;
        verificationCode: string | null;
        electionId: string | null;
        ballotId: string | null;
    }>;
    resetVoterStatus(voterId: string): Promise<{
        id: string;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string | null;
        courseId: string | null;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    }>;
    getVoterVotingStatus(voterId: string, ballotId: string): Promise<{
        voter: {
            id: string;
            name: string;
            email: string;
            studentId: string;
            hasVoted: boolean;
        };
        ballot: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.BallotStatus;
        };
        votes: ({
            position: {
                id: string;
                Position_Title: string;
                displayOrder: number;
            };
            candidate: {
                id: string;
                Candidate_Name: string;
                photo: string;
                partyList: {
                    name: string;
                };
            };
        } & {
            id: string;
            createdAt: Date;
            positionId: string;
            ipAddress: string | null;
            userAgent: string | null;
            sessionId: string | null;
            voterId: string;
            candidateId: string;
            auditHash: string | null;
            verificationCode: string | null;
            electionId: string | null;
            ballotId: string | null;
        })[];
        availablePositions: {
            id: string;
            Position_Title: string;
            displayOrder: number;
        }[];
        canVote: boolean;
    }>;
    getRealTimeStats(): Promise<{
        totalVotes: number;
        totalVoters: number;
        votersWhoVoted: number;
        voterTurnout: number;
        candidatesWithVotes: number;
        totalPositions: number;
        timestamp: Date;
    }>;
    getVoteTimeline(): Promise<any[]>;
    getActiveBallotResults(): Promise<any[]>;
}
