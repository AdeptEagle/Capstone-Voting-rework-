import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
export declare class CourseService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    getAllCourses(): Promise<({
        _count: {
            candidates: number;
            voters: number;
        };
        department: {
            id: string;
            Department_Name: string;
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
    createCourse(createCourseDto: CreateCourseDto, adminId: string): Promise<{
        message: string;
        course: {
            department: {
                id: string;
                Department_Name: string;
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
        };
    }>;
    getCourseById(id: string): Promise<{
        _count: {
            candidates: number;
            voters: number;
        };
        department: {
            id: string;
            Department_Name: string;
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
    }>;
    updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<{
        message: string;
        course: {
            department: {
                id: string;
                Department_Name: string;
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
        };
    }>;
    deleteCourse(id: string): Promise<{
        message: string;
    }>;
    getCoursesByDepartment(departmentId: string): Promise<({
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
        position: {
            id: string;
            Position_Title: string;
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
