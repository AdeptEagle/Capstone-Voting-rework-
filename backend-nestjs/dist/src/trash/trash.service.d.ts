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
        elections: number;
        total: number;
    }>;
    getDeletedCandidates(): Promise<({
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
        course: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string;
            createdBy: string;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
        };
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
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
    })[]>;
    getDeletedPositions(): Promise<{
        id: string;
        Position_Title: string;
        Position_Description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        displayOrder: number;
        voteLimit: number;
    }[]>;
    getDeletedDepartments(): Promise<({
        admin: {
            Admin_Username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Department_Name: string;
        Department_Description: string | null;
        createdBy: string;
    })[]>;
    getDeletedCourses(): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
        };
        admin: {
            Admin_Username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string;
        createdBy: string;
        Course_Name: string;
        Course_Code: string;
        Course_Description: string | null;
    })[]>;
    getDeletedVoters(): Promise<({
        course: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string;
            createdBy: string;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
        };
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        courseId: string;
        departmentId: string;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        password: string | null;
        hasVoted: boolean;
    })[]>;
    restoreCandidate(candidateId: string): Promise<{
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
        course: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string;
            createdBy: string;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
        };
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
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
    }>;
    restorePosition(positionId: string): Promise<{
        id: string;
        Position_Title: string;
        Position_Description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        displayOrder: number;
        voteLimit: number;
    }>;
    restoreDepartment(departmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Department_Name: string;
        Department_Description: string | null;
        createdBy: string;
    }>;
    restoreCourse(courseId: string): Promise<{
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string;
        createdBy: string;
        Course_Name: string;
        Course_Code: string;
        Course_Description: string | null;
    }>;
    restoreVoter(voterId: string): Promise<{
        course: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string;
            createdBy: string;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
        };
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        courseId: string;
        departmentId: string;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        password: string | null;
        hasVoted: boolean;
    }>;
    bulkRestore(itemIds: string[], itemType: 'candidate' | 'position' | 'department' | 'course' | 'voter'): Promise<{
        restored: any[];
        errors: any[];
        successCount: number;
        errorCount: number;
    }>;
    permanentlyDeleteCandidate(candidateId: string): Promise<{
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
    }>;
    permanentlyDeletePosition(positionId: string): Promise<{
        id: string;
        Position_Title: string;
        Position_Description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        displayOrder: number;
        voteLimit: number;
    }>;
    permanentlyDeleteDepartment(departmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        Department_Name: string;
        Department_Description: string | null;
        createdBy: string;
    }>;
    permanentlyDeleteCourse(courseId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string;
        createdBy: string;
        Course_Name: string;
        Course_Code: string;
        Course_Description: string | null;
    }>;
    permanentlyDeleteVoter(voterId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        courseId: string;
        departmentId: string;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        password: string | null;
        hasVoted: boolean;
    }>;
    emptyTrash(): Promise<{
        message: string;
        results: {
            candidates: number;
            positions: number;
            departments: number;
            courses: number;
            voters: number;
            elections: number;
            errors: any[];
        };
        errors: any[];
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
    restoreElection(electionId: string): Promise<{
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
    permanentlyDeleteElection(electionId: string): Promise<{
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
}
