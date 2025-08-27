import { Controller, Get, Post, Put, Delete, Body, Param, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Course')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly prisma: PrismaService
  ) {}

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

      console.log(`🔧 [CourseController] Using superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
      
      return this.courseService.createCourse(createCourseDto, superadmin.id);
    } catch (error) {
      console.error('❌ [CourseController] Error creating course:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create course. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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

      console.log(`🔧 [CourseController] Updating course with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
      
      return this.courseService.updateCourse(id, updateCourseDto);
    } catch (error) {
      console.error('❌ [CourseController] Error updating course:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update course. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(@Param('id') id: string) {
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

      console.log(`🔧 [CourseController] Deleting course with superadmin: ${superadmin.Admin_Username} (${superadmin.id})`);
      
      return this.courseService.deleteCourse(id);
    } catch (error) {
      console.error('❌ [CourseController] Error deleting course:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete course. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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