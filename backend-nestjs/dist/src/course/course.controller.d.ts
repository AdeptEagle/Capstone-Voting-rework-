import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class CourseController {
    private readonly courseService;
    private readonly prisma;
    constructor(courseService: CourseService, prisma: PrismaService);
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
    createCourse(createCourseDto: CreateCourseDto, req: any): Promise<{
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
        party_list_name: string | null;
        courseId: string | null;
        positionId: string;
        partyListId: string | null;
    })[]>;
}
