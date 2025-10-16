import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionDto, UpdateElectionDto, AddPositionDto, AddCandidateDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { TimezoneService } from '../services/timezone.service';
import { VotingGateway } from '../websocket/voting.gateway';
export declare class ElectionService {
    private prisma;
    private idGenerator;
    private timezoneService;
    private votingGateway;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, timezoneService: TimezoneService, votingGateway: VotingGateway);
    getAllElections(): Promise<({
        electionPositions: ({
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            positionId: string;
        })[];
        votes: {
            id: string;
            createdAt: Date;
        }[];
        electionCandidates: ({
            candidate: {
                id: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        })[];
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        status: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
    })[]>;
    getElectionById(id: string, includeDeleted?: boolean): Promise<{
        electionPositions: ({
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            positionId: string;
        })[];
        votes: {
            id: string;
            createdAt: Date;
        }[];
        electionCandidates: ({
            candidate: {
                id: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        })[];
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        status: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
    }>;
    createElection(createElectionDto: CreateElectionDto, adminId: string): Promise<{
        message: string;
        election: {
            id: string;
            title: string;
            description: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            status: string;
            createdBy: string;
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
            };
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateElection(id: string, updateElectionDto: UpdateElectionDto): Promise<{
        message: string;
        election: {
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    }>;
    deleteElection(id: string): Promise<{
        message: string;
    }>;
    getDeletedElections(): Promise<({
        electionPositions: ({
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            positionId: string;
        })[];
        votes: {
            id: string;
            createdAt: Date;
        }[];
        electionCandidates: ({
            candidate: {
                id: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        })[];
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        status: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
    })[]>;
    restoreElection(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    }>;
    permanentlyDeleteElection(id: string): Promise<{
        message: string;
    }>;
    activateElection(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    }>;
    deactivateElection(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    }>;
    startBallot(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
        ballotInfo: {
            positions: number;
            candidates: number;
            status: string;
            otherElectionsPaused: number;
        };
    }>;
    pauseBallot(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    }>;
    resumeBallot(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    }>;
    stopBallot(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    }>;
    endBallot(id: string): Promise<{
        message: string;
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            status: string;
            Election_Title: string;
            Election_Description: string | null;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
        finalResults: {
            totalVotes: number;
            uniqueVoters: number;
            status: string;
            endedAt: Date;
        };
    }>;
    getBallotStatus(id: string): Promise<{
        election: {
            id: string;
            title: string;
            status: string;
            isActive: boolean;
            startDate: Date;
            endDate: Date;
        };
        ballot: {
            positions: number;
            candidates: number;
            totalVotes: number;
            uniqueVoters: number;
            canVote: boolean;
            canPause: boolean;
            canResume: boolean;
            canEnd: boolean;
        };
        lifecycle: {
            draft: boolean;
            active: boolean;
            paused: boolean;
            ended: boolean;
        };
    }>;
    getActiveElections(): Promise<({
        electionPositions: ({
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            positionId: string;
        })[];
        electionCandidates: ({
            candidate: {
                id: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        })[];
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        status: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
    })[]>;
    getActiveElection(): Promise<{
        electionPositions: ({
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            positionId: string;
        })[];
        electionCandidates: ({
            candidate: {
                id: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        })[];
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        status: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
    }>;
    hasActiveElections(): Promise<{
        hasActive: boolean;
        activeCount: number;
    }>;
    getActiveElectionInfo(): Promise<{
        hasActive: boolean;
        activeCount: number;
        activeElections: {
            id: string;
            status: string;
            Election_Title: string;
            endDate: Date;
            startDate: Date;
        }[];
    }>;
    checkAndAutoEndElections(): Promise<{
        message: string;
        autoEndedElections: any[];
    }>;
    getElectionTimeStatus(id: string): Promise<{
        election: {
            id: string;
            title: string;
            status: string;
        };
        timezone: {
            timezone: string;
            abbreviation: string;
            currentTime: string;
            currentTimeDisplay: string;
            offset: string;
            isDST: boolean;
        };
        timeInfo: {
            now: string;
            nowPhilippine: string;
            startDate: string;
            startDatePhilippine: string;
            endDate: string;
            endDatePhilippine: string;
            isStarted: boolean;
            isEnded: boolean;
            timeUntilStart: number;
            timeUntilEnd: number;
            timeRemaining: number;
            timeDifference: {
                milliseconds: number;
                seconds: number;
                minutes: number;
                hours: number;
                days: number;
                isPast: boolean;
                isFuture: boolean;
                formatted: string;
            };
        };
        votingStatus: {
            canVote: boolean;
            shouldAutoEnd: boolean;
            isExpired: boolean;
            isInFuture: boolean;
            isInProgress: boolean;
        };
    }>;
    scheduleAutoEndCheck(): Promise<{
        message: string;
        autoEndedElections: any[];
    }>;
    addPositionToElection(electionId: string, addPositionDto: AddPositionDto): Promise<{
        message: string;
        electionPosition: {
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            positionId: string;
        };
    }>;
    addCandidateToElection(electionId: string, addCandidateDto: AddCandidateDto): Promise<{
        message: string;
        electionCandidate: {
            candidate: {
                id: string;
                positionId: string;
                Candidate_Name: string;
                Candidate_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        };
    }>;
    removePositionFromElection(electionId: string, positionId: string): Promise<{
        message: string;
    }>;
    removeCandidateFromElection(electionId: string, candidateId: string): Promise<{
        message: string;
    }>;
    getElectionHistory(): Promise<{
        message: string;
        totalElections: number;
        elections: {
            electionId: string;
            Election_Title: string;
            Election_Description: string;
            status: string;
            startDate: Date;
            endDate: Date;
            startDateFormatted: string;
            endDateFormatted: string;
            durationInMinutes: number;
            createdBy: string;
            admin: {
                Admin_Username: string;
                role: import(".prisma/client").$Enums.Role;
            };
            adminRole: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            totalVotes: number;
            totalVoters: number;
            votersWhoVoted: number;
            voterTurnout: number;
            uniqueVoters: number;
            totalPositions: number;
            totalCandidates: number;
            positions: {
                positionId: string;
                title: string;
                description: string;
                voteLimit: number;
            }[];
            candidates: {
                candidateId: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                position: string;
                department: string;
                course: string;
            }[];
            resultsByPosition: {};
            summary: {
                totalPositions: number;
                totalCandidates: number;
                totalVotes: number;
                totalVoters: number;
                votersWhoVoted: number;
                voterTurnout: string;
                duration: string;
                status: string;
            };
        }[];
    }>;
}
