import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { TimezoneService } from '../services/timezone.service';
import { VotingGateway } from '../websocket/voting.gateway';
import { AuditService } from '../services/audit.service';
export declare class VoteService {
    private prisma;
    private idGenerator;
    private readonly timezoneService;
    private readonly votingGateway;
    private readonly auditService;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, timezoneService: TimezoneService, votingGateway: VotingGateway, auditService: AuditService);
    getAllVotes(): Promise<({
        position: {
            id: string;
            Position_Title: string;
        };
        candidate: {
            id: string;
            Candidate_Name: string;
            Candidate_StudentId: string;
        };
        election: {
            id: string;
            Election_Title: string;
        };
        voter: {
            id: string;
            Voter_Name: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        auditHash: string | null;
        candidateId: string;
        electionId: string | null;
        ipAddress: string | null;
        positionId: string;
        sessionId: string | null;
        userAgent: string | null;
        verificationCode: string | null;
        voterId: string;
        ballotId: string | null;
    })[]>;
    getVoteById(id: string): Promise<{
        position: {
            id: string;
            Position_Title: string;
        };
        candidate: {
            id: string;
            Candidate_Name: string;
            Candidate_StudentId: string;
        };
        election: {
            id: string;
            Election_Title: string;
        };
        voter: {
            id: string;
            Voter_Name: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        auditHash: string | null;
        candidateId: string;
        electionId: string | null;
        ipAddress: string | null;
        positionId: string;
        sessionId: string | null;
        userAgent: string | null;
        verificationCode: string | null;
        voterId: string;
        ballotId: string | null;
    }>;
    createVote(createVoteDto: CreateVoteDto): Promise<{
        message: string;
        vote: {
            id: string;
            voter: {
                id: string;
                Voter_Name: string;
                Voter_StudentId: string;
            };
            candidate: {
                id: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
            election: {
                id: string;
                Election_Title: string;
            };
            position: {
                id: string;
                Position_Title: string;
                voteLimit: number;
            };
            createdAt: Date;
        };
        voteCount: number;
        voteLimit: number;
        isFinalVoteForPosition: boolean;
        isLockedOut: boolean;
        confirmation: {
            voterName: string;
            candidateName: string;
            positionTitle: string;
            electionTitle: string;
            votedAt: Date;
            voteId: string;
            remainingVotes: number;
            lockoutMessage: string;
        };
    }>;
    confirmVote(createVoteDto: CreateVoteDto): Promise<{
        canVote: boolean;
        confirmation: {
            voterName: string;
            candidateName: string;
            positionTitle: string;
            electionTitle: string;
            currentVoteCount: number;
            voteLimit: number;
            remainingVotes: number;
            willBeFinalVoteForPosition: boolean;
            willCompleteAllVoting: boolean;
            votingProgress: {
                totalPositions: number;
                completedPositions: number;
                totalVotesCast: number;
                remainingPositions: number;
            };
        };
        validation: {
            electionActive: true;
            voterExists: boolean;
            candidateExists: boolean;
            positionExists: boolean;
            withinVoteLimit: boolean;
            noDuplicateVote: boolean;
            notLockedOut: boolean;
        };
        lockoutWarning: string;
    }>;
    deleteVote(id: string): Promise<{
        message: string;
    }>;
    getVotesByElection(electionId: string): Promise<({
        position: {
            id: string;
            Position_Title: string;
        };
        candidate: {
            id: string;
            Candidate_Name: string;
            Candidate_StudentId: string;
        };
        election: {
            id: string;
            Election_Title: string;
        };
        voter: {
            id: string;
            Voter_Name: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        auditHash: string | null;
        candidateId: string;
        electionId: string | null;
        ipAddress: string | null;
        positionId: string;
        sessionId: string | null;
        userAgent: string | null;
        verificationCode: string | null;
        voterId: string;
        ballotId: string | null;
    })[]>;
    getVotesByVoter(voterId: string): Promise<({
        position: {
            id: string;
            Position_Title: string;
        };
        candidate: {
            id: string;
            Candidate_Name: string;
            Candidate_StudentId: string;
        };
        election: {
            id: string;
            Election_Title: string;
        };
        voter: {
            id: string;
            Voter_Name: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        auditHash: string | null;
        candidateId: string;
        electionId: string | null;
        ipAddress: string | null;
        positionId: string;
        sessionId: string | null;
        userAgent: string | null;
        verificationCode: string | null;
        voterId: string;
        ballotId: string | null;
    })[]>;
    getVoteResults(electionId: string): Promise<{
        electionId: string;
        results: any[];
        summary: {
            totalPositions: number;
            totalVotes: any;
        };
    }>;
    getComprehensiveVoteAnalytics(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
            description: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            createdBy: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
            };
            positions: {
                id: string;
                Position_Title: string;
                voteLimit: number;
            }[];
            candidates: {
                id: string;
                positionId: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            }[];
        };
        statistics: {
            totalVotes: number;
            uniqueVoters: number;
            uniqueCandidates: number;
            uniquePositions: number;
            totalEligibleVoters: number;
            participationRate: number;
            averageVotesPerVoter: number;
        };
        detailedResults: {
            byPosition: {
                position: any;
                totalVotes: any;
                candidates: {
                    candidate: any;
                    voteCount: any;
                    percentage: number;
                    voters: any;
                }[];
            }[];
            byVoter: {
                voter: any;
                totalVotes: any;
                positionsVoted: unknown[];
                votes: any;
            }[];
            byDepartment: {
                department: any;
                statistics: {
                    totalVoters: any;
                    uniqueVoters: any;
                    totalVotes: any;
                    participationRate: number;
                    averageVotesPerVoter: number;
                };
                positions: {
                    position: any;
                    totalVotes: any;
                    candidates: {
                        candidate: any;
                        votes: any;
                        percentage: number;
                    }[];
                }[];
                candidates: {
                    candidate: any;
                    totalVotes: any;
                    voters: any;
                }[];
                voterDetails: any;
            }[];
        };
        timeline: {
            firstVote: {
                voteId: string;
                voterName: string;
                candidateName: string;
                positionTitle: string;
                votedAt: Date;
            };
            lastVote: {
                voteId: string;
                voterName: string;
                candidateName: string;
                positionTitle: string;
                votedAt: Date;
            };
            totalVoteSessions: number;
            voteTimeline: {
                voteId: string;
                voterName: string;
                candidateName: string;
                positionTitle: string;
                votedAt: Date;
            }[];
        };
        audit: {
            voteRecords: {
                voteId: string;
                voter: {
                    id: string;
                    name: string;
                    studentId: string;
                    email: string;
                    department: {
                        id: string;
                        Department_Name: string;
                    };
                    course: {
                        id: string;
                        Course_Name: string;
                        Course_Code: string;
                    };
                };
                candidate: {
                    id: string;
                    name: string;
                    studentId: string;
                    email: string;
                    position: {
                        id: string;
                        Position_Title: string;
                    };
                    department: {
                        id: string;
                        Department_Name: string;
                    };
                    course: {
                        id: string;
                        Course_Name: string;
                        Course_Code: string;
                    };
                };
                position: {
                    id: string;
                    Position_Title: string;
                    Position_Description: string;
                    voteLimit: number;
                };
                election: {
                    id: string;
                    Election_Title: string;
                    Election_Description: string;
                    endDate: Date;
                    isActive: boolean;
                    startDate: Date;
                };
                votedAt: Date;
            }[];
        };
    }>;
    getDepartmentVotingResults(electionId: string): Promise<{
        department: any;
        statistics: {
            totalVoters: any;
            uniqueVoters: any;
            totalVotes: any;
            participationRate: number;
            averageVotesPerVoter: number;
        };
        positions: {
            position: any;
            totalVotes: any;
            candidates: {
                candidate: any;
                votes: any;
                percentage: number;
            }[];
        }[];
        candidates: {
            candidate: any;
            totalVotes: any;
            voters: any;
        }[];
        voterDetails: any;
    }[]>;
    getVoterVotingStatus(voterId: string, electionId: string): Promise<{
        voter: {
            id: string;
            name: string;
            studentId: string;
            hasVoted: boolean;
        };
        election: {
            id: string;
            title: string;
            isActive: boolean;
        };
        votingStatus: {
            totalPositions: number;
            completedPositions: number;
            remainingPositions: number;
            totalVotesCast: number;
            allPositionsCompleted: boolean;
            isLockedOut: boolean;
            lockoutReason: string;
        };
        positions: any[];
        canVote: boolean;
        lockoutMessage: string;
    }>;
    getRealTimeStats(): Promise<{
        totalVotes: number;
        uniqueVoters: number;
        candidatesWithVotes: number;
        totalPositions: number;
        votersWhoVoted: number;
        totalVoters: number;
        voterTurnout: number;
    }>;
    getVoteTimeline(): Promise<any[]>;
    getActiveElectionResults(): Promise<any[]>;
    resetVoterStatus(voterId: string): Promise<{
        message: string;
        voter: {
            id: string;
            name: string;
            studentId: string;
            hasVoted: boolean;
        };
    }>;
}
