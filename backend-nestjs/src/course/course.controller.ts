import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@ApiTags('Course')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of all courses' })
  async getAllCourses() {
    return this.courseService.getAllCourses();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async createCourse(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    // Use the existing superadmin ID from the database
    const adminId = 'SUPERADMIN-1';
    return this.courseService.createCourse(createCourseDto, adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get courses by department' })
  @ApiResponse({ status: 200, description: 'Courses found' })
  async getCoursesByDepartment(@Param('departmentId') departmentId: string) {
    return this.courseService.getCoursesByDepartment(departmentId);
  }

  @Get(':id/voters')
  @ApiOperation({ summary: 'Get voters in a course' })
  @ApiResponse({ status: 200, description: 'Voters found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseVoters(@Param('id') id: string) {
    return this.courseService.getCourseVoters(id);
  }

  @Get(':id/candidates')
  @ApiOperation({ summary: 'Get candidates in a course' })
  @ApiResponse({ status: 200, description: 'Candidates found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseCandidates(@Param('id') id: string) {
    return this.courseService.getCourseCandidates(id);
  }
} 