import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
export declare class AdminService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    getAllAdmins(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        Admin_Username: string;
        Admin_Email: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    createAdmin(createAdminDto: CreateAdminDto): Promise<{
        message: string;
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    createAdminWithCustomId(createAdminDto: CreateAdminDto, idFormat?: 'simple' | 'padded' | 'year'): Promise<{
        message: string;
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getIdFormatExamples(): Promise<{
        message: string;
        formats: {
            simple: {
                admin: string;
                department: string;
                course: string;
                position: string;
                candidate: string;
                voter: string;
                election: string;
                vote: string;
            };
            padded: {
                admin: string;
                department: string;
                course: string;
                position: string;
                candidate: string;
                voter: string;
                election: string;
                vote: string;
            };
            year: {
                admin: string;
                department: string;
                course: string;
                position: string;
                candidate: string;
                voter: string;
                election: string;
                vote: string;
            };
        };
        currentCounts: {
            admin: number;
            department: number;
            course: number;
            position: number;
            candidate: number;
            voter: number;
            election: number;
            vote: number;
        };
    }>;
    getAdminById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        Admin_Username: string;
        Admin_Email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateAdmin(id: string, updateAdminDto: UpdateAdminDto): Promise<{
        message: string;
        admin: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            Admin_Username: string;
            Admin_Email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    deleteAdmin(id: string): Promise<{
        message: string;
    }>;
    getAdminByUsername(username: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        Admin_Username: string;
        Admin_Email: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    getAdminByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        Admin_Username: string;
        Admin_Email: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    createSuperAdmin(createAdminDto: CreateAdminDto): Promise<{
        message: string;
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getAdminStats(): Promise<{
        overview: {
            totalAdmins: number;
            superAdmins: number;
            regularAdmins: number;
            superAdminPercentage: string;
            regularAdminPercentage: string;
        };
        recentActivity: {
            newAdmins: number;
            recentAdmins: {
                id: string;
                createdAt: Date;
                Admin_Username: string;
                role: import(".prisma/client").$Enums.Role;
            }[];
        };
        adminActivity: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                courses: number;
                departments: number;
                elections: number;
            };
            Admin_Username: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
    }>;
    getAdminLoginLogs(page?: number, limit?: number, adminId?: string): Promise<{
        loginLogs: ({
            admin: {
                id: string;
                Admin_Username: string;
                Admin_Email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ipAddress: string | null;
            sessionId: string | null;
            userAgent: string | null;
            isActive: boolean;
            adminId: string;
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAdminLoginStats(): Promise<{
        totalLogins: number;
        activeSessions: number;
        todayLogins: number;
        avgSessionDuration: number;
        recentLogins: ({
            admin: {
                Admin_Username: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ipAddress: string | null;
            sessionId: string | null;
            userAgent: string | null;
            isActive: boolean;
            adminId: string;
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
        })[];
    }>;
    getAdminLoginLogById(id: string): Promise<{
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress: string | null;
        sessionId: string | null;
        userAgent: string | null;
        isActive: boolean;
        adminId: string;
        loginTime: Date;
        logoutTime: Date | null;
        duration: number | null;
    }>;
    getUserLoginLogs(page?: number, limit?: number, searchTerm?: string, department?: string, course?: string): Promise<{
        loginLogs: ({
            user: {
                id: string;
                course: {
                    Course_Name: string;
                };
                department: {
                    Department_Name: string;
                };
                Voter_Name: string;
                Voter_Email: string;
                Voter_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ipAddress: string | null;
            sessionId: string | null;
            userAgent: string | null;
            isActive: boolean;
            userId: string;
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserLoginStats(): Promise<{
        totalLogins: number;
        activeSessions: number;
        todayLogins: number;
        avgSessionDuration: number;
        recentLogins: ({
            user: {
                department: {
                    Department_Name: string;
                };
                Voter_Name: string;
                Voter_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ipAddress: string | null;
            sessionId: string | null;
            userAgent: string | null;
            isActive: boolean;
            userId: string;
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
        })[];
    }>;
    getUserLoginLogById(id: string): Promise<{
        user: {
            id: string;
            course: {
                Course_Name: string;
            };
            department: {
                Department_Name: string;
            };
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress: string | null;
        sessionId: string | null;
        userAgent: string | null;
        isActive: boolean;
        userId: string;
        loginTime: Date;
        logoutTime: Date | null;
        duration: number | null;
    }>;
}
