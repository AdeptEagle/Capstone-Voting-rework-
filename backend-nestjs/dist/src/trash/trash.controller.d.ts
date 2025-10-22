import { TrashService } from './trash.service';
export declare class TrashController {
    private readonly trashService;
    constructor(trashService: TrashService);
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
    restoreCandidate(id: string): Promise<{
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
    restorePosition(id: string): Promise<{
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
    restoreDepartment(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Department_Name: string;
        Department_Description: string | null;
    }>;
    restoreCourse(id: string): Promise<{
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
    restoreVoter(id: string): Promise<{
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
    restoreBallot(id: string): Promise<{
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
    bulkRestore(body: {
        itemIds: string[];
        itemType: 'candidate' | 'position' | 'department' | 'course' | 'voter';
    }): Promise<{
        message: string;
    }>;
    permanentlyDeleteCandidate(id: string): Promise<{
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
    permanentlyDeletePosition(id: string): Promise<{
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
    permanentlyDeleteDepartment(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Department_Name: string;
        Department_Description: string | null;
    }>;
    permanentlyDeleteCourse(id: string): Promise<{
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
    permanentlyDeleteVoter(id: string): Promise<{
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
    permanentlyDeleteBallot(id: string): Promise<{
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
