import { PrismaService } from '../prisma/prisma.service';
export declare class TrashService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTrashSummary(): Promise<{
        candidates: number;
        positions: number;
        departments: number;
        courses: number;
        voters: number;
        ballots: number;
        total: number;
    }>;
    getDeletedCandidates(): Promise<({
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
        party_list_name: string | null;
        courseId: string | null;
        positionId: string;
        partyListId: string | null;
    })[]>;
    getDeletedPositions(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Position_Title: string;
        Position_Description: string | null;
        displayOrder: number;
        voteLimit: number;
    }[]>;
    getDeletedDepartments(): Promise<({
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string | null;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        Department_Name: string;
        Department_Description: string | null;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
    })[]>;
    getDeletedCourses(): Promise<({
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
    } & {
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
    })[]>;
    getDeletedVoters(): Promise<({
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
    getDeletedBallots(): Promise<({
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string | null;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
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
    getTrashItems(): Promise<{
        candidates: ({
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
            party_list_name: string | null;
            courseId: string | null;
            positionId: string;
            partyListId: string | null;
        })[];
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
        departments: ({
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string | null;
                password: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            Department_Name: string;
            Department_Description: string | null;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
        })[];
        courses: ({
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
        } & {
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
        })[];
        voters: ({
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
        })[];
        ballots: ({
            createdByAdmin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string | null;
                password: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
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
        })[];
    }>;
    getTrashCounts(): Promise<{
        candidates: number;
        positions: number;
        departments: number;
        courses: number;
        voters: number;
        ballots: number;
        total: number;
    }>;
    restoreCandidate(candidateId: string): Promise<{
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
    }>;
    restorePosition(positionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Position_Title: string;
        Position_Description: string | null;
        displayOrder: number;
        voteLimit: number;
    }>;
    restoreDepartment(departmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        Department_Name: string;
        Department_Description: string | null;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
    }>;
    restoreCourse(courseId: string): Promise<{
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
    }>;
    restoreVoter(voterId: string): Promise<{
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
    restoreBallot(ballotId: string): Promise<{
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
    permanentlyDeleteCandidate(candidateId: string): Promise<{
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
    }>;
    permanentlyDeletePosition(positionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Position_Title: string;
        Position_Description: string | null;
        displayOrder: number;
        voteLimit: number;
    }>;
    permanentlyDeleteDepartment(departmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        Department_Name: string;
        Department_Description: string | null;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
    }>;
    permanentlyDeleteCourse(courseId: string): Promise<{
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
    }>;
    permanentlyDeleteVoter(voterId: string): Promise<{
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
    permanentlyDeleteBallot(ballotId: string): Promise<{
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
    emptyTrash(): Promise<{
        message: string;
        results: {
            candidates: number;
            positions: number;
            departments: number;
            courses: number;
            voters: number;
            ballots: number;
            errors: any[];
        };
        errors: any[];
    }>;
}
