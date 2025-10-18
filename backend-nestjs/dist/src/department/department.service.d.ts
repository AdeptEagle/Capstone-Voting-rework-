import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
export declare class DepartmentService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    getAllDepartments(): Promise<({
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            courses: number;
            candidates: number;
            voters: number;
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
    createDepartment(createDepartmentDto: CreateDepartmentDto, adminId: string): Promise<{
        message: string;
        department: {
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
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
        };
    }>;
    getDepartmentById(id: string): Promise<{
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            courses: number;
            candidates: number;
            voters: number;
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
    }>;
    updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        message: string;
        department: {
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
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
        };
    }>;
    deleteDepartment(id: string): Promise<{
        message: string;
    }>;
    getDepartmentCourses(id: string): Promise<({
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        _count: {
            candidates: number;
            voters: number;
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
    getDepartmentVoters(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    }[]>;
    getDepartmentCandidates(id: string): Promise<({
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
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
}
