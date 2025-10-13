import { ElectionAssignmentService } from './election-assignment.service';
import { CreateElectionAssignmentDto, UpdateElectionAssignmentDto } from './dto';
export declare class ElectionAssignmentController {
    private readonly electionAssignmentService;
    constructor(electionAssignmentService: ElectionAssignmentService);
    getAllBallotAssignments(ballotId?: string, candidateId?: string): Promise<({
        election: {
            id: string;
            Election_Title: string;
            Election_Description: string;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
        candidate: {
            id: string;
            department: {
                id: string;
                Department_Name: string;
            };
            position: {
                id: string;
                Position_Title: string;
            };
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string;
            manifesto: string;
        };
    } & {
        id: string;
        createdAt: Date;
        electionId: string;
        candidateId: string;
    })[]>;
    createElectionAssignment(createElectionAssignmentDto: CreateElectionAssignmentDto): Promise<{
        message: string;
        assignment: {
            election: {
                id: string;
                Election_Title: string;
                Election_Description: string;
                endDate: Date;
                isActive: boolean;
                startDate: Date;
            };
            candidate: {
                id: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
                position: {
                    id: string;
                    Position_Title: string;
                };
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            candidateId: string;
        };
    }>;
    getElectionAssignmentById(id: string): Promise<{
        election: {
            id: string;
            Election_Title: string;
            Election_Description: string;
            endDate: Date;
            isActive: boolean;
            startDate: Date;
        };
        candidate: {
            id: string;
            department: {
                id: string;
                Department_Name: string;
            };
            position: {
                id: string;
                Position_Title: string;
            };
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string;
            manifesto: string;
        };
    } & {
        id: string;
        createdAt: Date;
        electionId: string;
        candidateId: string;
    }>;
    updateElectionAssignment(id: string, updateElectionAssignmentDto: UpdateElectionAssignmentDto): Promise<{
        message: string;
        assignment: {
            election: {
                id: string;
                Election_Title: string;
                Election_Description: string;
                endDate: Date;
                isActive: boolean;
                startDate: Date;
            };
            candidate: {
                id: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
                position: {
                    id: string;
                    Position_Title: string;
                };
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            candidateId: string;
        };
    }>;
    deleteElectionAssignment(id: string): Promise<{
        message: string;
    }>;
    getCandidatesForBallot(ballotId: string): Promise<{
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
                id: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
                position: {
                    id: string;
                    Position_Title: string;
                };
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                party_list_name: string;
                partyListId: string;
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
            electionId: string;
            candidateId: string;
        })[];
    }>;
    getBallotsForCandidate(candidateId: string): Promise<{
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
            electionId: string;
            candidateId: string;
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
    removeCandidateFromBallot(ballotId: string, candidateId: string): Promise<{
        message: string;
    }>;
    getBallotPositions(ballotId: string): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Position_Title: string;
            Position_Description: string | null;
            displayOrder: number;
            voteLimit: number;
        }[];
    }>;
    getUnassignedPositions(ballotId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        unassignedPositions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Position_Title: string;
            Position_Description: string | null;
            displayOrder: number;
            voteLimit: number;
        }[];
    }>;
    getPositionAssignmentStatus(ballotId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        positionStatus: {
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
            isAssigned: boolean;
            assignedAt: Date;
        }[];
    }>;
    assignPositionToBallot(ballotId: string, positionId: string): Promise<{
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
    removePositionFromBallot(ballotId: string, positionId: string): Promise<{
        message: string;
    }>;
    getUnassignedCandidates(ballotId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        unassignedCandidates: ({
            department: {
                id: string;
                Department_Name: string;
            };
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string | null;
            courseId: string | null;
            positionId: string;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string | null;
            manifesto: string | null;
            party_list_name: string | null;
            partyListId: string | null;
        })[];
    }>;
    getCandidateAssignmentStatus(ballotId: string): Promise<{
        election: {
            id: string;
            title: string;
        };
        candidateStatus: {
            candidate: {
                department: {
                    id: string;
                    Department_Name: string;
                };
                position: {
                    id: string;
                    Position_Title: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                departmentId: string | null;
                courseId: string | null;
                positionId: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string | null;
                manifesto: string | null;
                party_list_name: string | null;
                partyListId: string | null;
            };
            isAssigned: boolean;
            assignedAt: Date;
        }[];
    }>;
    assignCandidateToBallot(ballotId: string, candidateId: string): Promise<{
        message: string;
        assignment: {
            election: {
                id: string;
                Election_Title: string;
                Election_Description: string;
                endDate: Date;
                isActive: boolean;
                startDate: Date;
            };
            candidate: {
                id: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
                position: {
                    id: string;
                    Position_Title: string;
                };
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
            };
        } & {
            id: string;
            createdAt: Date;
            electionId: string;
            candidateId: string;
        };
    }>;
    getBallotDetails(ballotId: string): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                Position_Title: string;
                Position_Description: string | null;
                displayOrder: number;
                voteLimit: number;
            };
            candidates: {
                id: string;
                department: {
                    id: string;
                    Department_Name: string;
                };
                position: {
                    id: string;
                    Position_Title: string;
                };
                positionId: string;
                Candidate_Name: string;
                Candidate_Email: string;
                Candidate_StudentId: string;
                photo: string;
                manifesto: string;
                party_list_name: string;
                partyListId: string;
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
