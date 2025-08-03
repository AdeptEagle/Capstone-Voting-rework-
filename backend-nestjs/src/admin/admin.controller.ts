import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admins')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all admins (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all admins' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async getAllAdmins(@Request() req) {
    // Only Super Admin can view all admins
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.getAllAdmins();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new admin (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @Request() req) {
    // Only Super Admin can create new admins
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.createAdmin(createAdminDto);
  }

  @Post('super-admin')
  @ApiOperation({ summary: 'Create a new Super Admin (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Super Admin created successfully' })
  @ApiResponse({ status: 409, description: 'Super Admin already exists' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async createSuperAdmin(@Body() createAdminDto: CreateAdminDto, @Request() req) {
    // Only Super Admin can create other Super Admins
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.createSuperAdmin(createAdminDto);
  }

  @Post('custom-id')
  @ApiOperation({ summary: 'Create admin with custom ID format (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin created with custom ID format' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async createAdminWithCustomId(
    @Body() createAdminDto: CreateAdminDto,
    @Query('format') format: 'simple' | 'padded' | 'year' = 'simple',
    @Request() req
  ) {
    // Only Super Admin can create admins with custom IDs
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.createAdminWithCustomId(createAdminDto, format);
  }

  @Get('id-formats')
  @ApiOperation({ summary: 'Get ID format examples and current counts (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'ID format examples retrieved' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async getIdFormatExamples(@Request() req) {
    // Only Super Admin can view ID format examples
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.getIdFormatExamples();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin found' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async getAdminById(@Param('id') id: string, @Request() req) {
    // Only Super Admin can view other admin details
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.getAdminById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update admin (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto, @Request() req) {
    // Only Super Admin can update other admins
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async deleteAdmin(@Param('id') id: string, @Request() req) {
    // Only Super Admin can delete other admins
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.deleteAdmin(id);
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile retrieved' })
  async getMyProfile(@Request() req) {
    // Any authenticated admin can view their own profile
    return this.adminService.getAdminById(req.user.sub);
  }

  @Put('profile/me')
  @ApiOperation({ summary: 'Update current admin profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async updateMyProfile(@Body() updateAdminDto: UpdateAdminDto, @Request() req) {
    // Any authenticated admin can update their own profile
    return this.adminService.updateAdmin(req.user.sub, updateAdminDto);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get admin statistics (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin required' })
  async getAdminStats(@Request() req) {
    // Only Super Admin can view admin statistics
    if (req.user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Access denied - Super Admin required');
    }
    return this.adminService.getAdminStats();
  }
} 