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
        positionId: string;
        courseId: string | null;
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
        departmentId: string | null;
        courseId: string | null;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    })[]>;
    getDeletedElections(): Promise<any[]>;
    restoreCandidate(id: string): Promise<{
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
        Department_Name: string;
        Department_Description: string | null;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
    }>;
    restoreCourse(id: string): Promise<{
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
    restoreVoter(id: string): Promise<{
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
    restoreElection(id: string): Promise<{
        message: string;
    }>;
    bulkRestore(body: {
        itemIds: string[];
        itemType: 'candidate' | 'position' | 'department' | 'course' | 'voter';
    }): Promise<{
        message: string;
    }>;
    permanentlyDeleteCandidate(id: string): Promise<{
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
        Department_Name: string;
        Department_Description: string | null;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
    }>;
    permanentlyDeleteCourse(id: string): Promise<{
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
    permanentlyDeleteVoter(id: string): Promise<{
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
    permanentlyDeleteElection(id: string): Promise<{
        message: string;
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
