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
        courseId: string | null;
        positionId: string;
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        party_list_name: string | null;
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
            Admin_Username: string;
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
        admin: {
            Admin_Username: string;
        };
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
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        courseId: string;
        hasVoted: boolean;
    })[]>;
    restoreCandidate(candidateId: string): Promise<{
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
        courseId: string | null;
        positionId: string;
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        party_list_name: string | null;
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
    }>;
    restoreVoter(voterId: string): Promise<{
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
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        courseId: string;
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
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        courseId: string;
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
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
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
            electionId: string;
            candidateId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
        status: string;
    })[]>;
    restoreElection(electionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
        status: string;
    }>;
    permanentlyDeleteElection(electionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        createdBy: string;
        Election_Title: string;
        Election_Description: string | null;
        endDate: Date;
        isActive: boolean;
        startDate: Date;
        status: string;
    }>;
}
