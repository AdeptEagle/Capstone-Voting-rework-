import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../utils/id-generator.service';
import { EmailService } from '../services/email.service';
import { Response } from 'express';
export declare class AuthService {
    private prisma;
    private jwtService;
    private idGenerator;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, idGenerator: IdGeneratorService, emailService: EmailService);
    checkAuthStatus(req: any): Promise<{
        isAuthenticated: boolean;
        role: import(".prisma/client").$Enums.Role;
        user: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
            Voter_Name?: undefined;
            Voter_Email?: undefined;
            Voter_StudentId?: undefined;
            hasVoted?: undefined;
            department?: undefined;
            course?: undefined;
        };
    } | {
        isAuthenticated: boolean;
        role: string;
        user: {
            id: string;
            Voter_Name: string;
            Voter_Email: string;
            Voter_StudentId: string;
            hasVoted: boolean;
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
            };
            Admin_Username?: undefined;
            Admin_Email?: undefined;
        };
    }>;
    adminLogin(adminLoginDto: {
        Admin_Username: string;
        password: string;
    }, res: Response, req?: any): Promise<{
        message: string;
        admin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    adminLogout(adminId: string, res: Response): Promise<{
        message: string;
    }>;
    userLogin(userLoginDto: {
        Voter_StudentId: string;
        password: string;
    }, res: Response, req?: any): Promise<{
        message: string;
        voter: {
            id: string;
            name: string;
            email: string;
            studentId: string;
            hasVoted: boolean;
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
            };
        };
    }>;
    userLogout(userId: string, res: Response): Promise<{
        message: string;
    }>;
    updateUserActivity(userId: string): Promise<{
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
    userRegister(userRegisterDto: {
        Voter_Name: string;
        Voter_Email: string;
        Voter_StudentId: string;
        password: string;
        departmentId?: string;
        courseId?: string;
    }, res: Response): Promise<{
        message: string;
        voter: {
            id: string;
            name: string;
            email: string;
            studentId: string;
            hasVoted: boolean;
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
            };
        };
    }>;
    requestPasswordReset(requestPasswordResetDto: {
        ResetToken_Email: string;
        userType: 'voter' | 'admin';
    }): Promise<{
        message: string;
    }>;
    verifyResetToken(token: string): Promise<{
        valid: boolean;
        message: string;
    }>;
    resetPassword(resetPasswordDto: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    cleanupExpiredTokens(): Promise<{
        message: string;
        deletedCount: number;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    validateAdminToken(body: {
        token: string;
    }): Promise<{
        valid: boolean;
        payload: any;
        error?: undefined;
    } | {
        valid: boolean;
        error: any;
        payload?: undefined;
    }>;
    testEmailConnection(): Promise<boolean>;
}
