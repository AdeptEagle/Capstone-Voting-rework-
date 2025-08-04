import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

@ApiTags('Department')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

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
    // Use the existing superadmin ID from the database
    const adminId = 'SUPERADMIN-1';
    return this.departmentService.createDepartment(createDepartmentDto, adminId);
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
    return this.departmentService.updateDepartment(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async deleteDepartment(@Param('id') id: string) {
    return this.departmentService.deleteDepartment(id);
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