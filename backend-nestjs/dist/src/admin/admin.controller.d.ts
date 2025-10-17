import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from './dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllAdmins(req: any): Promise<{
        id: string;
        Admin_Username: string;
        Admin_Email: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createAdmin(createAdminDto: CreateAdminDto, req: any): Promise<{
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
    createSuperAdmin(createAdminDto: CreateAdminDto, req: any): Promise<{
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
    createAdminWithCustomId(createAdminDto: CreateAdminDto, format: 'simple' | 'padded' | 'year', req: any): Promise<{
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
    getIdFormatExamples(req: any): Promise<{
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
    getMyProfile(req: any): Promise<{
        id: string;
        Admin_Username: string;
        Admin_Email: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMyProfile(updateAdminDto: UpdateAdminDto, req: any): Promise<{
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
    getAdminStats(req: any): Promise<{
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
                Admin_Username: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
            }[];
        };
        adminActivity: {
            id: string;
            Admin_Username: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                ballots: number;
                courses: number;
                departments: number;
            };
        }[];
    }>;
    getAdminLoginLogs(req: any, page?: string, limit?: string, adminId?: string): Promise<{
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
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
            ipAddress: string | null;
            userAgent: string | null;
            sessionId: string | null;
            isActive: boolean;
            adminId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAdminLoginStats(req: any): Promise<{
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
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
            ipAddress: string | null;
            userAgent: string | null;
            sessionId: string | null;
            isActive: boolean;
            adminId: string;
        })[];
    }>;
    getAdminLoginLogById(id: string, req: any): Promise<{
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
        loginTime: Date;
        logoutTime: Date | null;
        duration: number | null;
        ipAddress: string | null;
        userAgent: string | null;
        sessionId: string | null;
        isActive: boolean;
        adminId: string;
    }>;
    getUserLoginLogs(req: any, page?: string, limit?: string, search?: string, department?: string, course?: string): Promise<{
        loginLogs: ({
            user: {
                id: string;
                department: {
                    Department_Name: string;
                };
                course: {
                    Course_Name: string;
                };
                Voter_Name: string;
                Voter_Email: string;
                Voter_StudentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
            ipAddress: string | null;
            userAgent: string | null;
            sessionId: string | null;
            isActive: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserLoginStats(req: any): Promise<{
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
            userId: string;
            loginTime: Date;
            logoutTime: Date | null;
            duration: number | null;
            ipAddress: string | null;
            userAgent: string | null;
            sessionId: string | null;
            isActive: boolean;
        })[];
    }>;
    getUserLoginLogById(id: string, req: any): Promise<{
        user: {
            id: string;
            department: {
                Department_Name: string;
            };
            course: {
                Course_Name: string;
            };
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        loginTime: Date;
        logoutTime: Date | null;
        duration: number | null;
        ipAddress: string | null;
        userAgent: string | null;
        sessionId: string | null;
        isActive: boolean;
    }>;
    getAdminById(id: string, req: any): Promise<{
        id: string;
        Admin_Username: string;
        Admin_Email: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAdmin(id: string, updateAdminDto: UpdateAdminDto, req: any): Promise<{
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
    deleteAdmin(id: string, req: any): Promise<{
        message: string;
    }>;
}
