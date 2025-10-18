"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
const email_service_1 = require("../services/email.service");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwtService, idGenerator, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.idGenerator = idGenerator;
        this.emailService = emailService;
    }
    async validateToken(token) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded && decoded.sub;
        }
        catch (error) {
            console.error('Invalid token:', error);
            return false;
        }
    }
    isTokenExpired(token) {
        try {
            const decoded = this.jwtService.decode(token);
            return decoded.exp < Date.now() / 1000;
        }
        catch {
            return true;
        }
    }
    logSecurityEvent(event, details) {
        console.log(`🔒 SECURITY: ${event}`, {
            timestamp: new Date().toISOString(),
            event,
            details,
            ip: details.ip || 'unknown'
        });
    }
    async checkAuthStatus(req) {
        try {
            const token = req.cookies?.access_token;
            if (!token) {
                return {
                    isAuthenticated: false,
                    role: null,
                    user: null
                };
            }
            const decoded = this.jwtService.verify(token);
            if (decoded.role === 'SUPERADMIN' || decoded.role === 'ADMIN') {
                const admin = await this.prisma.admin.findUnique({
                    where: { id: decoded.sub }
                });
                if (!admin) {
                    return {
                        isAuthenticated: false,
                        role: null,
                        user: null
                    };
                }
                return {
                    isAuthenticated: true,
                    role: admin.role,
                    user: {
                        id: admin.id,
                        Admin_Username: admin.Admin_Username,
                        Admin_Email: admin.Admin_Email
                    }
                };
            }
            else {
                const voter = await this.prisma.voter.findUnique({
                    where: { id: decoded.sub },
                    include: {
                        department: {
                            select: {
                                id: true,
                                Department_Name: true,
                            },
                        },
                        course: {
                            select: {
                                id: true,
                                Course_Name: true,
                            },
                        },
                    },
                });
                if (!voter) {
                    return {
                        isAuthenticated: false,
                        role: null,
                        user: null
                    };
                }
                return {
                    isAuthenticated: true,
                    role: 'USER',
                    user: {
                        id: voter.id,
                        Voter_Name: voter.Voter_Name,
                        Voter_Email: voter.Voter_Email,
                        Voter_StudentId: voter.Voter_StudentId,
                        hasVoted: voter.hasVoted,
                        department: voter.department,
                        course: voter.course
                    }
                };
            }
        }
        catch (error) {
            console.error('Error checking auth status:', error);
            return {
                isAuthenticated: false,
                role: null,
                user: null
            };
        }
    }
    async adminLogin(adminLoginDto, res, req) {
        const { Admin_Username, password } = adminLoginDto;
        const admin = await this.prisma.admin.findUnique({
            where: { Admin_Username: Admin_Username },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: admin.id,
            username: admin.Admin_Username,
            role: admin.role,
            type: 'admin'
        };
        const token = this.jwtService.sign(payload);
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.up.railway.app' : undefined,
        });
        try {
            const loginLogId = await this.idGenerator.generateId('admin_login_log', 'simple');
            const sessionId = (0, crypto_1.randomBytes)(32).toString('hex');
            const ipAddress = req?.ip || req?.connection?.remoteAddress || req?.socket?.remoteAddress || 'unknown';
            const userAgent = req?.get('User-Agent') || 'unknown';
            await this.prisma.adminLoginLog.create({
                data: {
                    id: loginLogId,
                    adminId: admin.id,
                    loginTime: new Date(),
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    sessionId: sessionId,
                    isActive: true,
                },
            });
        }
        catch (error) {
            console.error('Failed to log admin login:', error);
        }
        return {
            message: 'Admin login successful',
            admin: {
                id: admin.id,
                Admin_Username: admin.Admin_Username,
                Admin_Email: admin.Admin_Email,
                role: admin.role,
            },
        };
    }
    async adminLogout(adminId, res) {
        try {
            const activeLoginLog = await this.prisma.adminLoginLog.findFirst({
                where: {
                    adminId: adminId,
                    isActive: true,
                },
                orderBy: {
                    loginTime: 'desc',
                },
            });
            if (activeLoginLog) {
                const logoutTime = new Date();
                const duration = Math.floor((logoutTime.getTime() - activeLoginLog.loginTime.getTime()) / 1000);
                await this.prisma.adminLoginLog.update({
                    where: { id: activeLoginLog.id },
                    data: {
                        logoutTime: logoutTime,
                        duration: duration,
                        isActive: false,
                    },
                });
            }
        }
        catch (error) {
            console.error('Failed to log admin logout:', error);
        }
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return {
            message: 'Admin logout successful',
        };
    }
    async userLogin(userLoginDto, res, req) {
        const { Voter_StudentId, password } = userLoginDto;
        const voter = await this.prisma.voter.findUnique({
            where: { Voter_StudentId: Voter_StudentId },
            include: {
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                    },
                },
            },
        });
        if (!voter) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, voter.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: voter.id,
            studentId: voter.Voter_StudentId,
            type: 'voter'
        };
        const token = this.jwtService.sign(payload);
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.up.railway.app' : undefined,
        });
        try {
            const loginLogId = await this.idGenerator.generateId('user_login_log', 'simple');
            const sessionId = (0, crypto_1.randomBytes)(32).toString('hex');
            const ipAddress = req?.ip || req?.connection?.remoteAddress || req?.socket?.remoteAddress || 'unknown';
            const userAgent = req?.get('User-Agent') || 'unknown';
            await this.prisma.userLoginLog.create({
                data: {
                    id: loginLogId,
                    userId: voter.id,
                    loginTime: new Date(),
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    sessionId: sessionId,
                    isActive: true,
                },
            });
        }
        catch (error) {
            console.error('Failed to log user login:', error);
        }
        return {
            message: 'User login successful',
            voter: {
                id: voter.id,
                name: voter.Voter_Name,
                email: voter.Voter_Email,
                studentId: voter.Voter_StudentId,
                hasVoted: voter.hasVoted,
                department: voter.department,
                course: voter.course,
            },
        };
    }
    async userLogout(userId, res) {
        try {
            const activeLoginLogs = await this.prisma.userLoginLog.findMany({
                where: {
                    userId: userId,
                    isActive: true,
                },
                orderBy: {
                    loginTime: 'desc',
                },
            });
            if (activeLoginLogs.length > 0) {
                const logoutTime = new Date();
                for (const log of activeLoginLogs) {
                    const duration = Math.floor((logoutTime.getTime() - log.loginTime.getTime()) / 1000);
                    await this.prisma.userLoginLog.update({
                        where: { id: log.id },
                        data: {
                            logoutTime: logoutTime,
                            duration: duration,
                            isActive: false,
                        },
                    });
                }
                console.log(`✅ Logged out ${activeLoginLogs.length} active session(s) for user ${userId}`);
            }
        }
        catch (error) {
            console.error('Failed to log user logout:', error);
        }
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return {
            message: 'User logout successful',
        };
    }
    async updateUserActivity(userId) {
        try {
            const activeLoginLog = await this.prisma.userLoginLog.findFirst({
                where: {
                    userId: userId,
                    isActive: true,
                },
                orderBy: {
                    loginTime: 'desc',
                },
            });
            if (activeLoginLog) {
                await this.prisma.userLoginLog.update({
                    where: { id: activeLoginLog.id },
                    data: {
                        updatedAt: new Date(),
                    },
                });
                return activeLoginLog;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to update user activity:', error);
            throw error;
        }
    }
    async userRegister(userRegisterDto, res) {
        const { Voter_Name, Voter_Email, Voter_StudentId, password, departmentId, courseId } = userRegisterDto;
        const existingEmail = await this.prisma.voter.findUnique({
            where: { Voter_Email: Voter_Email },
        });
        const existingStudentId = await this.prisma.voter.findUnique({
            where: { Voter_StudentId: Voter_StudentId },
        });
        if (existingEmail && existingStudentId) {
            throw new common_1.ConflictException(`Account creation failed: Both email address "${Voter_Email}" and student ID "${Voter_StudentId}" are already registered. Please use different credentials or contact support if you believe this is an error.`);
        }
        if (existingEmail) {
            throw new common_1.ConflictException(`Account creation failed: Email address "${Voter_Email}" is already registered. Please use a different email address or contact support if you believe this is an error.`);
        }
        if (existingStudentId) {
            throw new common_1.ConflictException(`Account creation failed: Student ID "${Voter_StudentId}" is already registered. Please use a different student ID or contact support if you believe this is an error.`);
        }
        const voterId = await this.idGenerator.generateVoterId();
        const hashedPassword = await bcrypt.hash(password, 10);
        const voterData = {
            id: voterId,
            Voter_Name: Voter_Name,
            Voter_Email: Voter_Email,
            Voter_StudentId: Voter_StudentId,
            password: hashedPassword,
        };
        if (departmentId) {
            voterData.departmentId = departmentId;
        }
        if (courseId) {
            voterData.courseId = courseId;
        }
        try {
            const voter = await this.prisma.voter.create({
                data: voterData,
                include: {
                    department: {
                        select: {
                            id: true,
                            Department_Name: true,
                        },
                    },
                    course: {
                        select: {
                            id: true,
                            Course_Name: true,
                        },
                    },
                },
            });
            const payload = {
                sub: voter.id,
                studentId: voter.Voter_StudentId,
                type: 'voter'
            };
            const token = this.jwtService.sign(payload);
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? '.up.railway.app' : undefined,
            });
            return {
                message: 'User registration successful',
                voter: {
                    id: voter.id,
                    name: voter.Voter_Name,
                    email: voter.Voter_Email,
                    studentId: voter.Voter_StudentId,
                    hasVoted: voter.hasVoted,
                    department: voter.department,
                    course: voter.course,
                },
            };
        }
        catch (error) {
            console.error('❌ Error creating voter in userRegister:', error);
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0];
                if (field === 'Voter_Email') {
                    throw new common_1.ConflictException(`Account creation failed: Email address "${Voter_Email}" is already registered. Please use a different email address or contact support if you believe this is an error.`);
                }
                else if (field === 'Voter_StudentId') {
                    throw new common_1.ConflictException(`Account creation failed: Student ID "${Voter_StudentId}" is already registered. Please use a different student ID or contact support if you believe this is an error.`);
                }
                else {
                    throw new common_1.ConflictException(`Account creation failed: The provided information conflicts with an existing account. Please check your details and try again.`);
                }
            }
            if (error.code === 'P2003') {
                const field = error.meta?.field_name;
                if (field === 'departmentId') {
                    throw new common_1.ConflictException(`Account creation failed: Invalid department selected. Please select a valid department.`);
                }
                else if (field === 'courseId') {
                    throw new common_1.ConflictException(`Account creation failed: Invalid course selected. Please select a valid course.`);
                }
                else {
                    throw new common_1.ConflictException(`Account creation failed: Invalid reference data. Please check your department and course selections.`);
                }
            }
            throw new common_1.ConflictException(`Account creation failed: ${error.message || 'An unexpected error occurred. Please try again or contact support.'}`);
        }
    }
    async requestPasswordReset(requestPasswordResetDto) {
        const { ResetToken_Email, userType, verificationField } = requestPasswordResetDto;
        console.log(`🔒 Password reset attempt: ${userType} with ID/Username: ${verificationField}, Email: ${ResetToken_Email}`);
        let user;
        if (userType === 'voter') {
            user = await this.prisma.voter.findUnique({
                where: { Voter_StudentId: verificationField }
            });
            if (user) {
                console.log(`🔍 DEBUG: Found voter with Student ID ${verificationField}`);
                console.log(`🔍 DEBUG: Database email: "${user.Voter_Email}"`);
                console.log(`🔍 DEBUG: Provided email: "${ResetToken_Email}"`);
                console.log(`🔍 DEBUG: Emails match: ${user.Voter_Email === ResetToken_Email}`);
            }
            else {
                console.log(`🔍 DEBUG: No voter found with Student ID ${verificationField}`);
            }
            if (!user || user.Voter_Email !== ResetToken_Email) {
                console.log(`❌ Security: Password reset failed - Student ID ${verificationField} does not match email ${ResetToken_Email}`);
                throw new common_1.BadRequestException('The Student ID and email address do not match our records. Please verify your credentials and try again.');
            }
            console.log(`✅ Security: Password reset verified - Student ID ${verificationField} matches email ${ResetToken_Email}`);
        }
        else {
            user = await this.prisma.admin.findUnique({
                where: { Admin_Username: verificationField }
            });
            if (!user || user.Admin_Email !== ResetToken_Email) {
                console.log(`❌ Security: Password reset failed - Username ${verificationField} does not match email ${ResetToken_Email}`);
                throw new common_1.BadRequestException('The Admin Username and email address do not match our records. Please verify your credentials and try again.');
            }
            console.log(`✅ Security: Password reset verified - Username ${verificationField} matches email ${ResetToken_Email}`);
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        try {
            await this.prisma.passwordResetToken.deleteMany({
                where: { ResetToken_Email: ResetToken_Email },
            });
            await this.prisma.passwordResetToken.create({
                data: {
                    id: await this.idGenerator.generatePasswordResetTokenId(),
                    ResetToken_Email: ResetToken_Email,
                    token: resetToken,
                    expiresAt,
                },
            });
            await this.emailService.sendPasswordResetEmail(ResetToken_Email, resetToken, userType, userType === 'voter' ? user.Voter_Name : user.Admin_Username, userType === 'voter' ? user.Voter_StudentId : user.Admin_Username);
            return {
                message: userType === 'admin'
                    ? 'Password reset link has been sent to your admin email address. Please check your inbox and follow the instructions to reset your password.'
                    : 'Password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
            };
        }
        catch (error) {
            console.log('Database constraint issue, trying alternative approach...');
            await this.prisma.passwordResetToken.create({
                data: {
                    id: await this.idGenerator.generatePasswordResetTokenId(),
                    ResetToken_Email: ResetToken_Email,
                    token: resetToken,
                    expiresAt,
                },
            });
            await this.emailService.sendPasswordResetEmail(ResetToken_Email, resetToken, userType, userType === 'voter' ? user.Voter_Name : user.Admin_Username, userType === 'voter' ? user.Voter_StudentId : user.Admin_Username);
            return {
                message: userType === 'admin'
                    ? 'Password reset link has been sent to your admin email address. Please check your inbox and follow the instructions to reset your password.'
                    : 'Password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
            };
        }
    }
    async verifyResetToken(token) {
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token },
        });
        if (!resetToken) {
            throw new common_1.UnauthorizedException('Invalid reset token');
        }
        if (resetToken.expiresAt < new Date()) {
            await this.prisma.passwordResetToken.delete({
                where: { token },
            });
            throw new common_1.UnauthorizedException('Reset token has expired');
        }
        return {
            valid: true,
            message: 'Token is valid',
        };
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const resetToken = await this.prisma.passwordResetToken.findFirst({
            where: { token },
        });
        if (!resetToken) {
            throw new common_1.UnauthorizedException('Invalid reset token');
        }
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Reset token has expired');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const email = resetToken.ResetToken_Email;
        let user = await this.prisma.voter.findUnique({ where: { Voter_Email: email } });
        let userType = 'voter';
        if (user) {
            await this.prisma.voter.update({
                where: { Voter_Email: email },
                data: { password: hashedPassword },
            });
        }
        else {
            const adminUser = await this.prisma.admin.findUnique({ where: { Admin_Email: email } });
            if (adminUser) {
                await this.prisma.admin.update({
                    where: { Admin_Email: email },
                    data: { password: hashedPassword },
                });
                userType = 'admin';
            }
            else {
                throw new common_1.UnauthorizedException('User not found');
            }
        }
        await this.prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });
        try {
            await this.emailService.sendPasswordChangedEmail(email, userType);
        }
        catch (error) {
            console.error('Failed to send password changed email:', error);
        }
        return {
            message: 'Password has been successfully reset. Please check your email for confirmation.',
        };
    }
    async changePassword(userId, userType, currentPassword, newPassword) {
        let user;
        if (userType === 'voter') {
            user = await this.prisma.voter.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    Voter_Email: true,
                    password: true,
                },
            });
        }
        else {
            user = await this.prisma.admin.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    Admin_Email: true,
                    password: true,
                },
            });
        }
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        if (userType === 'voter') {
            await this.prisma.voter.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
        }
        else {
            await this.prisma.admin.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
        }
        try {
            const email = userType === 'voter' ? user.Voter_Email : user.Admin_Email;
            await this.emailService.sendPasswordChangedEmail(email, userType);
        }
        catch (error) {
            console.error('Failed to send password changed email:', error);
        }
        return {
            message: 'Password changed successfully',
        };
    }
    async cleanupExpiredTokens() {
        const deletedCount = await this.prisma.passwordResetToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return {
            message: `Cleaned up ${deletedCount.count} expired tokens`,
            deletedCount: deletedCount.count,
        };
    }
    async logout(res) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return {
            message: 'Logout successful',
        };
    }
    async validateAdminToken(body) {
        try {
            const payload = this.jwtService.verify(body.token);
            return { valid: true, payload };
        }
        catch (error) {
            return { valid: false, error: error.message };
        }
    }
    async testEmailConnection() {
        return this.emailService.testConnection();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        id_generator_service_1.IdGeneratorService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map