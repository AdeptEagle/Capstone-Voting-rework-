import { Controller, Post, Body, HttpCode, HttpStatus, Res, UseGuards, Get, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Check authentication status',
    description: 'Check if user is authenticated and return user info'
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async checkAuthStatus(@Request() req: any) {
    return this.authService.checkAuthStatus(req);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Admin login',
    description: 'Authenticate admin user. Token is stored in HTTP-only cookie for security.'
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async adminLogin(@Body() adminLoginDto: AdminLoginDto, @Res() res: Response) {
    const result = await this.authService.adminLogin(adminLoginDto, res);
    return res.json(result);
  }

  @Post('user/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate voter user. Token is stored in HTTP-only cookie for security.'
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async userLogin(@Body() userLoginDto: UserLoginDto, @Res() res: Response) {
    const result = await this.authService.userLogin(userLoginDto, res);
    return res.json(result);
  }

  @Post('user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'User registration',
    description: 'Register new voter user. Token is stored in HTTP-only cookie for security.'
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async userRegister(@Body() userRegisterDto: UserRegisterDto, @Res() res: Response) {
    const result = await this.authService.userRegister(userRegisterDto, res);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send a password reset email to the user'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  @Get('verify-token/:token')
  @ApiOperation({
    summary: 'Verify reset token',
    description: 'Verify if a password reset token is valid'
  })
  @ApiParam({ name: 'token', description: 'Password reset token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async verifyResetToken(@Param('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password using a valid token'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('cleanup-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cleanup expired tokens',
    description: 'Remove expired password reset tokens from database'
  })
  @ApiResponse({
    status: 200,
    description: 'Expired tokens cleaned up',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedCount: { type: 'number' },
      },
    },
  })
  async cleanupExpiredTokens() {
    return this.authService.cleanupExpiredTokens();
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logout user and clear HTTP-only cookie'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful - HTTP-only cookie cleared',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async logout(@Request() req: any, @Res() res: Response) {
    // Check if user is authenticated and get their info
    try {
      const authStatus = await this.authService.checkAuthStatus(req);
      
      if (authStatus.isAuthenticated) {
        // Determine if it's an admin or user logout
        if (authStatus.role === 'SUPER_ADMIN' || authStatus.role === 'ADMIN') {
          // Admin logout
          const result = await this.authService.adminLogout(authStatus.user.id, res);
          return res.json(result);
        } else {
          // User logout
          const result = await this.authService.userLogout(authStatus.user.id, res);
          return res.json(result);
        }
      } else {
        // Not authenticated, just clear cookie
        const result = await this.authService.logout(res);
        return res.json(result);
      }
    } catch (error) {
      // If there's an error checking auth status, just clear the cookie
      console.error('Error during logout:', error);
      const result = await this.authService.logout(res);
      return res.json(result);
    }
  }

  @Post('validate-admin-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validate admin token',
    description: 'Validate admin token (for API testing only)'
  })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        payload: { type: 'object' },
      },
    },
  })
  async validateAdminToken(@Body() body: { token: string }) {
    return this.authService.validateAdminToken(body);
  }

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Test email service',
    description: 'Test the email service connection (for development only)'
  })
  @ApiResponse({
    status: 200,
    description: 'Email service test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async testEmailService() {
    const isConnected = await this.authService.testEmailConnection();
    return {
      success: isConnected,
      message: isConnected 
        ? 'Email service is working correctly' 
        : 'Email service connection failed. Check your Gmail credentials.',
    };
  }
} 