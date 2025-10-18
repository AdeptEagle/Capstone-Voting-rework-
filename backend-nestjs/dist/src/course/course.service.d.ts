import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
export declare class CourseService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    getAllCourses(): Promise<({
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        department: {
            id: string;
            Department_Name: string;
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
    createCourse(createCourseDto: CreateCourseDto, adminId: string): Promise<{
        message: string;
        course: {
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
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
            createdBy: string;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
            departmentId: string;
        };
    }>;
    getCourseById(id: string): Promise<{
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
        department: {
            id: string;
            Department_Name: string;
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
    }>;
    updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<{
        message: string;
        course: {
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
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
            createdBy: string;
            Course_Name: string;
            Course_Code: string;
            Course_Description: string | null;
            departmentId: string;
        };
    }>;
    deleteCourse(id: string): Promise<{
        message: string;
    }>;
    getCoursesByDepartment(departmentId: string): Promise<({
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
    getCourseVoters(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        hasVoted: boolean;
    }[]>;
    getCourseCandidates(id: string): Promise<({
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
