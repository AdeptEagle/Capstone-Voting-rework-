import { Controller, Get, Post, Put, Delete, Body, Param, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Department')
@Controller('departments')
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'List of all departments' })
  async getAllDepartments() {
    return this.departmentService.getAllDepartments();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto, @Request() req) {
    try {
      // Find the first available superadmin from the database
      const superadmin = await this.prisma.admin.findFirst({
        where: { role: 'SUPERADMIN' },
        select: { id: true, Admin_Username: true, role: true }
      });

      if (!superadmin) {
        throw new HttpException(
          'No superadmin found in the system. Please create a superadmin first.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      console.log(`🔧 [DepartmentController] Using superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
      
      return this.departmentService.createDepartment(createDepartmentDto, superadmin.id);
    } catch (error) {
      console.error('❌ [DepartmentController] Error creating department:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create department. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentById(@Param('id') id: string) {
    return this.departmentService.getDepartmentById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async updateDepartment(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    try {
      // Find the first available superadmin from the database
      const superadmin = await this.prisma.admin.findFirst({
        where: { role: 'SUPERADMIN' },
        select: { id: true, Admin_Username: true, role: true }
      });

      if (!superadmin) {
        throw new HttpException(
          'No superadmin found in the system. Please create a superadmin first.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      console.log(`🔧 [DepartmentController] Updating department with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
      
      return this.departmentService.updateDepartment(id, updateDepartmentDto);
    } catch (error) {
      console.error('❌ [DepartmentController] Error updating department:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update department. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async deleteDepartment(@Param('id') id: string) {
    try {
      // Find the first available superadmin from the database
      const superadmin = await this.prisma.admin.findFirst({
        where: { role: 'SUPERADMIN' },
        select: { id: true, Admin_Username: true, role: true }
      });

      if (!superadmin) {
        throw new HttpException(
          'No superadmin found in the system. Please create a superadmin first.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      console.log(`🔧 [DepartmentController] Deleting department with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
      
      return this.departmentService.deleteDepartment(id);
    } catch (error) {
      console.error('❌ [DepartmentController] Error deleting department:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete department. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get courses in a department' })
  @ApiResponse({ status: 200, description: 'Courses found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentCourses(@Param('id') id: string) {
    return this.departmentService.getDepartmentCourses(id);
  }

  @Get(':id/voters')
  @ApiOperation({ summary: 'Get voters in a department' })
  @ApiResponse({ status: 200, description: 'Voters found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentVoters(@Param('id') id: string) {
    return this.departmentService.getDepartmentVoters(id);
  }

  @Get(':id/candidates')
  @ApiOperation({ summary: 'Get candidates in a department' })
  @ApiResponse({ status: 200, description: 'Candidates found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentCandidates(@Param('id') id: string) {
    return this.departmentService.getDepartmentCandidates(id);
  }
} 