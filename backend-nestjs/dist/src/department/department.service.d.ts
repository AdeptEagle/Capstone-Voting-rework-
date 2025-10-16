import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
export declare class DepartmentService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    getAllDepartments(): Promise<({
        _count: {
            candidates: number;
            courses: number;
            voters: number;
        };
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
        Department_Name: string;
        Department_Description: string | null;
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
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
        };
    }>;
    getDepartmentById(id: string): Promise<{
        _count: {
            candidates: number;
            courses: number;
            voters: number;
        };
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
        Department_Name: string;
        Department_Description: string | null;
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
            deletedAt: Date | null;
            isDeleted: boolean;
            Department_Name: string;
            Department_Description: string | null;
            createdBy: string;
        };
    }>;
    deleteDepartment(id: string): Promise<{
        message: string;
    }>;
    getDepartmentCourses(id: string): Promise<({
        _count: {
            candidates: number;
            voters: number;
        };
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
        departmentId: string;
        createdBy: string;
        Course_Name: string;
        Course_Code: string;
        Course_Description: string | null;
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
        position: {
            id: string;
            Position_Title: string;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
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
}
