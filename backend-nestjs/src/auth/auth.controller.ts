import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'Admin login successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        token: { type: 'string' },
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
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }

  @Post('user/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User login successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        token: { type: 'string' },
        voter: {
          type: 'object',
          properties: {
            id: { type: 'number' },
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
  async userLogin(@Body() userLoginDto: UserLoginDto) {
    return this.authService.userLogin(userLoginDto);
  }

  @Post('user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User registration successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        token: { type: 'string' },
        voter: {
          type: 'object',
          properties: {
            id: { type: 'number' },
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
  async userRegister(@Body() userRegisterDto: UserRegisterDto) {
    return this.authService.userRegister(userRegisterDto);
  }

  @Post('admin/validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate admin token' })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
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
  async validateAdminToken(@Body() body: { token: string }) {
    return this.authService.validateAdminToken(body.token);
  }
} 