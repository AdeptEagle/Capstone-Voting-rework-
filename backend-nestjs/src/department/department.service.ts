import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async getAllDepartments() {
    return this.prisma.department.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        admin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
        _count: {
          select: {
            courses: true,
            voters: true,
            candidates: true,
          },
        },
      },
    });
  }

  async createDepartment(createDepartmentDto: CreateDepartmentDto, adminId: string) {
    const { Department_Name, Department_Description, customId } = createDepartmentDto;

    // Check if department with this name already exists
    const existingDepartment = await this.prisma.department.findFirst({
      where: { Department_Name: Department_Name },
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    // Check if custom ID is already taken
    if (customId) {
      const existingCustomId = await this.prisma.department.findUnique({
        where: { id: customId },
      });

      if (existingCustomId) {
        throw new ConflictException(`Department with ID '${customId}' already exists`);
      }
    }

    // Use custom ID if provided, otherwise generate one
    const departmentId = customId || await this.idGenerator.generateDepartmentId();

    const department = await this.prisma.department.create({
      data: {
        id: departmentId,
        Department_Name: Department_Name,
        Department_Description: Department_Description,
        createdBy: adminId,
      },
      include: {
        admin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
      },
    });

    return {
      message: 'Department created successfully!',
      department,
    };
  }

  async getDepartmentById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
        _count: {
          select: {
            courses: true,
            voters: true,
            candidates: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const { Department_Name, Department_Description } = updateDepartmentDto;

    // Check if department exists
    const existingDepartment = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      throw new NotFoundException('Department not found');
    }

    // Check if name is already taken by another department
    if (Department_Name && Department_Name !== existingDepartment.Department_Name) {
      const conflictingDepartment = await this.prisma.department.findFirst({
        where: {
          Department_Name: Department_Name,
          NOT: { id },
        },
      });

      if (conflictingDepartment) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    const department = await this.prisma.department.update({
      where: { id },
      data: {
        Department_Name: Department_Name,
        Department_Description: Department_Description,
      },
      include: {
        admin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
      },
    });

    return {
      message: 'Department updated successfully!',
      department,
    };
  }

  async deleteDepartment(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
            voters: true,
            candidates: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if department is already soft-deleted
    if (department.isDeleted) {
      throw new NotFoundException('Department has already been deleted');
    }

    // SOFT DELETE: Mark as deleted but preserve data
    // We allow deletion even with related data since soft delete preserves everything

    // SOFT DELETE: Mark as deleted but preserve data
    await this.prisma.department.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return {
      message: 'Department moved to trash successfully!',
    };
  }

  async getDepartmentCourses(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.course.findMany({
      where: { 
        departmentId: id,
        isDeleted: false,
      },
      include: {
        admin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
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

  async getDepartmentVoters(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.voter.findMany({
      where: { departmentId: id },
      select: {
        id: true,
        Voter_Name: true,
        Voter_Email: true,
        Voter_StudentId: true,
        hasVoted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getDepartmentCandidates(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.candidate.findMany({
      where: { 
        departmentId: id,
        isDeleted: false,
      },
      include: {
        position: {
          select: {
            id: true,
            Position_Title: true,
          },
        },
        course: {
          select: {
            id: true,
            Course_Name: true,
            Course_Code: true,
          },
        },
      },
    });
  }
} 