import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async getAllCourses() {
    return this.prisma.course.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            voters: true,
            candidates: true,
          },
        },
      },
    });
  }

  async createCourse(createCourseDto: CreateCourseDto, adminId: string) {
    const { name, code, description, departmentId, customId } = createCourseDto;

    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if course with this code already exists
    const existingCourse = await this.prisma.course.findFirst({
      where: { code },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this code already exists');
    }

    // Check if custom ID is already taken
    if (customId) {
      const existingCustomId = await this.prisma.course.findUnique({
        where: { id: customId },
      });

      if (existingCustomId) {
        throw new ConflictException(`Course with ID '${customId}' already exists`);
      }
    }

    // Use custom ID if provided, otherwise generate one
    const courseId = customId || await this.idGenerator.generateCourseId();

    const course = await this.prisma.course.create({
      data: {
        id: courseId,
        name,
        code,
        description,
        departmentId,
        createdBy: adminId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Course created successfully!',
      course,
    };
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            voters: true,
            candidates: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto) {
    const { name, code, description, departmentId } = updateCourseDto;

    // Check if course exists
    const existingCourse = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    // Check if department exists if departmentId is provided
    if (departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    // Check if code is already taken by another course
    if (code && code !== existingCourse.code) {
      const conflictingCourse = await this.prisma.course.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (conflictingCourse) {
        throw new ConflictException('Course with this code already exists');
      }
    }

    // Regular update - ignore customId field
    const course = await this.prisma.course.update({
      where: { id },
      data: {
        name,
        code,
        description,
        departmentId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Course updated successfully!',
      course,
    };
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            voters: true,
            candidates: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course has related data
    if (course._count.voters > 0 || course._count.candidates > 0) {
      throw new ConflictException('Cannot delete course with related voters or candidates');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return {
      message: 'Course deleted successfully!',
    };
  }

  async getCoursesByDepartment(departmentId: string) {
    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.course.findMany({
      where: { departmentId },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            voters: true,
            candidates: true,
          },
        },
      },
    });
  }

  async getCourseVoters(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.voter.findMany({
      where: { courseId: id },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        hasVoted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getCourseCandidates(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.candidate.findMany({
      where: { courseId: id },
      include: {
        position: {
          select: {
            id: true,
            title: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
} 