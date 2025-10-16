import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionAssignmentDto, UpdateElectionAssignmentDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
export declare class ElectionAssignmentService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    getAllElectionAssignments(electionId?: string, candidateId?: string): Promise<({
        candidate: {
            position: {
                id: string;
                Position_Title: string;
            };
            id: string;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string;
            manifesto: string;
            department: {
                id: string;
                Department_Name: string;
            };
        };
        election: {
            id: string;
            Election_Title: string;
            Election_Description: string;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        candidateId: string;
        electionId: string;
    })[]>;
    createElectionAssignment(createElectionAssignmentDto: CreateElectionAssignmentDto): Promise<{
        message: string;
        assignment: {
            candidate: {
                position: {
                    id: string;
                    Position_Title: string;
                };
                id: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
            };
            election: {
                id: string;
                Election_Title: string;
                Election_Description: string;
                endDate: Date;
                isActive: boolean;
                startDate: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        };
    }>;
    getElectionAssignmentById(id: string): Promise<{
        candidate: {
            position: {
                id: string;
                Position_Title: string;
            };
            id: string;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string;
            manifesto: string;
            department: {
                id: string;
                Department_Name: string;
            };
        };
        election: {
            id: string;
            Election_Title: string;
            Election_Description: string;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        candidateId: string;
        electionId: string;
    }>;
    updateElectionAssignment(id: string, updateElectionAssignmentDto: UpdateElectionAssignmentDto): Promise<{
        message: string;
        assignment: {
            candidate: {
                position: {
                    id: string;
                    Position_Title: string;
                };
                id: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
            };
            election: {
                id: string;
                Election_Title: string;
                Election_Description: string;
                endDate: Date;
                isActive: boolean;
                startDate: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        };
    }>;
    deleteElectionAssignment(id: string): Promise<{
        message: string;
    }>;
    getCandidatesForElection(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
            description: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
        };
        candidates: ({
            candidate: {
                position: {
                    id: string;
                    Position_Title: string;
                };
                id: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                party_list_name: string;
                partyListId: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
                partyList: {
                    id: string;
                    name: string;
                    color: string;
                    logo: string;
                };
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        })[];
    }>;
    getElectionsForCandidate(candidateId: string): Promise<{
        candidate: {
            id: string;
            name: string;
            email: string;
            studentId: string;
            photo: string;
            manifesto: string;
        };
        elections: ({
            election: {
                id: string;
                Election_Title: string;
                Election_Description: string;
                endDate: Date;
                isActive: boolean;
                startDate: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        })[];
    }>;
    bulkAssignCandidates(assignments: CreateElectionAssignmentDto[]): Promise<{
        message: string;
        results: any[];
        summary: {
            total: number;
            successful: number;
            failed: number;
        };
    }>;
    removeCandidateFromElection(electionId: string, candidateId: string): Promise<{
        message: string;
    }>;
    getElectionPositions(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
            description: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
        };
        positions: {
            id: string;
            Position_Title: string;
            Position_Description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            displayOrder: number;
            voteLimit: number;
        }[];
    }>;
    getUnassignedPositions(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        unassignedPositions: {
            id: string;
            Position_Title: string;
            Position_Description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            displayOrder: number;
            voteLimit: number;
        }[];
    }>;
    getPositionAssignmentStatus(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        positionStatus: {
            position: {
                id: string;
                Position_Title: string;
                Position_Description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                displayOrder: number;
                voteLimit: number;
            };
            isAssigned: boolean;
            assignedAt: Date;
        }[];
    }>;
    assignPositionToElection(electionId: string, positionId: string): Promise<{
        message: string;
        assignment: {
            position: {
                id: string;
                Position_Title: string;
                Position_Description: string;
                voteLimit: number;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            positionId: string;
        };
    }>;
    removePositionFromElection(electionId: string, positionId: string): Promise<{
        message: string;
    }>;
    getUnassignedCandidates(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        unassignedCandidates: ({
            position: {
                id: string;
                Position_Title: string;
            };
            department: {
                id: string;
                Department_Name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            positionId: string;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string | null;
            manifesto: string | null;
            party_list_name: string | null;
            courseId: string | null;
            departmentId: string | null;
            partyListId: string | null;
        })[];
    }>;
    getCandidateAssignmentStatus(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        candidateStatus: {
            candidate: {
                position: {
                    id: string;
                    Position_Title: string;
                };
                department: {
                    id: string;
                    Department_Name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                positionId: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                courseId: string | null;
                departmentId: string | null;
                partyListId: string | null;
            };
            isAssigned: boolean;
            assignedAt: Date;
        }[];
    }>;
    assignCandidateToElection(electionId: string, candidateId: string): Promise<{
        message: string;
        assignment: {
            candidate: {
                position: {
                    id: string;
                    Position_Title: string;
                };
                id: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
            };
            election: {
                id: string;
                Election_Title: string;
                Election_Description: string;
                endDate: Date;
                isActive: boolean;
                startDate: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            candidateId: string;
            electionId: string;
        };
    }>;
    getElectionBallot(electionId: string): Promise<{
        election: {
            id: string;
            title: string;
            description: string;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
        };
        ballot: {
            position: {
                id: string;
                Position_Title: string;
                Position_Description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                displayOrder: number;
                voteLimit: number;
            };
            candidates: {
                position: {
                    id: string;
                    Position_Title: string;
                };
                id: string;
                positionId: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                party_list_name: string;
                partyListId: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
                partyList: {
                    id: string;
                    name: string;
                    color: string;
                    logo: string;
                };
            }[];
        }[];
    }>;
}
