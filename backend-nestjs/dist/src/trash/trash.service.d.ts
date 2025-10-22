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
        course: {
            id: string;
            departmentId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
            createdBy: string;
        };
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            Department_Name: string;
            Department_Description: string | null;
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
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        positionId: string;
        departmentId: string | null;
        courseId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        partyListId: string | null;
        party_list_name: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            Admin_Username: string;
            Admin_Email: string | null;
            password: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Department_Name: string;
        Department_Description: string | null;
    })[]>;
    getDeletedCourses(): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            Department_Name: string;
            Department_Description: string | null;
        };
    } & {
        id: string;
        departmentId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Course_Name: string;
        Course_Code: string;
        Course_Description: string | null;
        createdBy: string;
    })[]>;
    getDeletedVoters(): Promise<({
        course: {
            id: string;
            departmentId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
            createdBy: string;
        };
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            Department_Name: string;
            Department_Description: string | null;
        };
    } & {
        id: string;
        departmentId: string | null;
        courseId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        password: string | null;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    })[]>;
    getDeletedBallots(): Promise<({
        createdByAdmin: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            Admin_Username: string;
            Admin_Email: string | null;
            password: string;
            role: import(".prisma/client").$Enums.Role;
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
            course: {
                id: string;
                departmentId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                Course_Name: string;
                Course_Code: string;
                Course_Description: string | null;
                createdBy: string;
            };
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                createdBy: string;
                Department_Name: string;
                Department_Description: string | null;
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
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string | null;
            manifesto: string | null;
            positionId: string;
            departmentId: string | null;
            courseId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            partyListId: string | null;
            party_list_name: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                Admin_Username: string;
                Admin_Email: string | null;
                password: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            createdBy: string;
            Department_Name: string;
            Department_Description: string | null;
        })[];
        courses: ({
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                createdBy: string;
                Department_Name: string;
                Department_Description: string | null;
            };
        } & {
            id: string;
            departmentId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
            createdBy: string;
        })[];
        voters: ({
            course: {
                id: string;
                departmentId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                Course_Name: string;
                Course_Code: string;
                Course_Description: string | null;
                createdBy: string;
            };
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isDeleted: boolean;
                createdBy: string;
                Department_Name: string;
                Department_Description: string | null;
            };
        } & {
            id: string;
            departmentId: string | null;
            courseId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            password: string | null;
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
            hasVoted: boolean;
        })[];
        ballots: ({
            createdByAdmin: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                Admin_Username: string;
                Admin_Email: string | null;
                password: string;
                role: import(".prisma/client").$Enums.Role;
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
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        positionId: string;
        departmentId: string | null;
        courseId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        partyListId: string | null;
        party_list_name: string | null;
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
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Department_Name: string;
        Department_Description: string | null;
    }>;
    restoreCourse(courseId: string): Promise<{
        id: string;
        departmentId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Course_Name: string;
        Course_Code: string;
        Course_Description: string | null;
        createdBy: string;
    }>;
    restoreVoter(voterId: string): Promise<{
        id: string;
        departmentId: string | null;
        courseId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        password: string | null;
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
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        positionId: string;
        departmentId: string | null;
        courseId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        partyListId: string | null;
        party_list_name: string | null;
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
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Department_Name: string;
        Department_Description: string | null;
    }>;
    permanentlyDeleteCourse(courseId: string): Promise<{
        id: string;
        departmentId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Course_Name: string;
        Course_Code: string;
        Course_Description: string | null;
        createdBy: string;
    }>;
    permanentlyDeleteVoter(voterId: string): Promise<{
        id: string;
        departmentId: string | null;
        courseId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        password: string | null;
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
