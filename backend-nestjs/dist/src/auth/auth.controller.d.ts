import { Response } from 'express';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    adminLogin(adminLoginDto: AdminLoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
    userLogin(userLoginDto: UserLoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
    userRegister(userRegisterDto: UserRegisterDto, res: Response): Promise<Response<any, Record<string, any>>>;
    requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    verifyResetToken(token: string): Promise<{
        valid: boolean;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    cleanupExpiredTokens(): Promise<{
        message: string;
        deletedCount: number;
    }>;
    logout(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
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
    testEmailService(): Promise<{
        success: boolean;
        message: string;
    }>;
}
