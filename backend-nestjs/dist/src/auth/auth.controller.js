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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const admin_login_dto_1 = require("./dto/admin-login.dto");
const user_login_dto_1 = require("./dto/user-login.dto");
const user_register_dto_1 = require("./dto/user-register.dto");
const request_password_reset_dto_1 = require("./dto/request-password-reset.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async checkAuthStatus(req) {
        return this.authService.checkAuthStatus(req);
    }
    async adminLogin(adminLoginDto, res) {
        const result = await this.authService.adminLogin(adminLoginDto, res);
        return res.json(result);
    }
    async userLogin(userLoginDto, res) {
        const result = await this.authService.userLogin(userLoginDto, res);
        return res.json(result);
    }
    async userRegister(userRegisterDto, res) {
        const result = await this.authService.userRegister(userRegisterDto, res);
        return res.status(common_1.HttpStatus.CREATED).json(result);
    }
    async requestPasswordReset(requestPasswordResetDto) {
        return this.authService.requestPasswordReset(requestPasswordResetDto);
    }
    async verifyResetToken(token) {
        return this.authService.verifyResetToken(token);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    async changePassword(req, changePasswordDto) {
        console.log('🔐 Change password request received');
        console.log('👤 User from JWT:', req.user);
        console.log('📝 Request body:', changePasswordDto);
        const { userId, type } = req.user;
        console.log('🆔 User ID:', userId);
        console.log('👥 User Type:', type);
        return this.authService.changePassword(userId, type, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    }
    async cleanupExpiredTokens() {
        return this.authService.cleanupExpiredTokens();
    }
    async logout(req, res) {
        try {
            const authStatus = await this.authService.checkAuthStatus(req);
            if (authStatus.isAuthenticated) {
                if (authStatus.role === 'SUPER_ADMIN' || authStatus.role === 'ADMIN') {
                    const result = await this.authService.adminLogout(authStatus.user.id, res);
                    return res.json(result);
                }
                else {
                    const result = await this.authService.userLogout(authStatus.user.id, res);
                    return res.json(result);
                }
            }
            else {
                const result = await this.authService.logout(res);
                return res.json(result);
            }
        }
        catch (error) {
            console.error('Error during logout:', error);
            const result = await this.authService.logout(res);
            return res.json(result);
        }
    }
    async validateAdminToken(body) {
        return this.authService.validateAdminToken(body);
    }
    async testEmailService() {
        const isConnected = await this.authService.testEmailConnection();
        return {
            success: isConnected,
            message: isConnected
                ? 'Email service is working correctly'
                : 'Email service connection failed. Check your email service credentials.',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Check authentication status',
        description: 'Check if user is authenticated and return user info'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Authentication status check successful',
        schema: {
            type: 'object',
            properties: {
                isAuthenticated: { type: 'boolean' },
                role: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Not authenticated' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAuthStatus", null);
__decorate([
    (0, common_1.Post)('admin/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin login',
        description: 'Authenticate admin user. Token is stored in HTTP-only cookie for security.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Admin login successful - Token stored in HTTP-only cookie',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                admin: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_login_dto_1.AdminLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('user/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'User login',
        description: 'Authenticate voter user. Token is stored in HTTP-only cookie for security.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User login successful - Token stored in HTTP-only cookie',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                voter: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        studentId: { type: 'string' },
                        hasVoted: { type: 'boolean' },
                        department: { type: 'object' },
                        course: { type: 'object' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_login_dto_1.UserLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "userLogin", null);
__decorate([
    (0, common_1.Post)('user/register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'User registration',
        description: 'Register new voter user. Token is stored in HTTP-only cookie for security.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User registration successful - Token stored in HTTP-only cookie',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                voter: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        studentId: { type: 'string' },
                        hasVoted: { type: 'boolean' },
                        department: { type: 'object' },
                        course: { type: 'object' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_register_dto_1.UserRegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "userRegister", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Request password reset',
        description: 'Send a password reset email to the user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset email sent',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_password_reset_dto_1.RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Get)('verify-token/:token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify reset token',
        description: 'Verify if a password reset token is valid'
    }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'Password reset token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token is valid',
        schema: {
            type: 'object',
            properties: {
                valid: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired token',
    }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyResetToken", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password',
        description: 'Reset password using a valid token'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired token',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Put)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Change password',
        description: 'Change password for authenticated user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password changed successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Current password is incorrect',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('cleanup-tokens'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Cleanup expired tokens',
        description: 'Remove expired password reset tokens from database'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Expired tokens cleaned up',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                deletedCount: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "cleanupExpiredTokens", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout user',
        description: 'Logout user and clear HTTP-only cookie'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logout successful - HTTP-only cookie cleared',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('validate-admin-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate admin token',
        description: 'Validate admin token (for API testing only)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token validation result',
        schema: {
            type: 'object',
            properties: {
                valid: { type: 'boolean' },
                payload: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateAdminToken", null);
__decorate([
    (0, common_1.Post)('test-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Test email service',
        description: 'Test the email service connection (for development only)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Email service test result',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testEmailService", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map