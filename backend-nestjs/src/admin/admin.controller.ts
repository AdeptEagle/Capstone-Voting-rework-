import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from './dto';

@ApiTags('Admin')
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, description: 'List of all admins' })
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Post('custom-id')
  @ApiOperation({ summary: 'Create admin with custom ID format' })
  @ApiResponse({ status: 201, description: 'Admin created with custom ID format' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async createAdminWithCustomId(
    @Body() createAdminDto: CreateAdminDto,
    @Query('format') format: 'simple' | 'padded' | 'year' = 'simple'
  ) {
    return this.adminService.createAdminWithCustomId(createAdminDto, format);
  }

  @Get('id-formats')
  @ApiOperation({ summary: 'Get ID format examples and current counts' })
  @ApiResponse({ status: 200, description: 'ID format examples retrieved' })
  async getIdFormatExamples() {
    return this.adminService.getIdFormatExamples();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin found' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async getAdminById(@Param('id') id: string) {
    return this.adminService.getAdminById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update admin' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }
} 