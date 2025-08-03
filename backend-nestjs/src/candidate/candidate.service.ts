import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async getAllCandidates(showAll: boolean = false) {
    return this.prisma.candidate.findMany({
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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            votes: true,
            electionCandidates: true,
          },
        },
      },
    });
  }

  async createCandidate(createCandidateDto: CreateCandidateDto, photo?: any) {
    const { name, email, studentId, positionId, departmentId, courseId, manifesto } = createCandidateDto;

    // Check if position exists
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    // Check if department exists if provided
    if (departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    // Check if course exists if provided
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    // Check if candidate with this student ID already exists
    const existingCandidate = await this.prisma.candidate.findFirst({
      where: { studentId },
    });

    if (existingCandidate) {
      throw new ConflictException('Candidate with this student ID already exists');
    }

    // Handle photo upload
    let photoUrl = null;
    if (photo) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${photo.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      
      fs.writeFileSync(filePath, photo.buffer);
      photoUrl = fileName;
    }

    // Generate custom ID
    const customId = await this.idGenerator.generateCandidateId();

    const candidate = await this.prisma.candidate.create({
      data: {
        id: customId,
        name,
        email,
        studentId,
        positionId,
        departmentId,
        courseId,
        photo: photoUrl,
        manifesto,
      },
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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      message: 'Candidate created successfully!',
      candidate,
    };
  }

  async getCandidateById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            votes: true,
            electionCandidates: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async updateCandidate(id: string, updateCandidateDto: UpdateCandidateDto, photo?: any) {
    const { name, email, studentId, positionId, departmentId, courseId, manifesto } = updateCandidateDto;

    // Check if candidate exists
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!existingCandidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if position exists if provided
    if (positionId) {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new NotFoundException('Position not found');
      }
    }

    // Check if department exists if provided
    if (departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    // Check if course exists if provided
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    // Check if student ID is already taken by another candidate
    if (studentId && studentId !== existingCandidate.studentId) {
      const conflictingCandidate = await this.prisma.candidate.findFirst({
        where: {
          studentId,
          NOT: { id },
        },
      });

      if (conflictingCandidate) {
        throw new ConflictException('Candidate with this student ID already exists');
      }
    }

    // Handle photo upload
    let photoUrl = existingCandidate.photo;
    if (photo) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Delete old photo if exists
      if (existingCandidate.photo) {
        const oldPhotoPath = path.join(uploadsDir, existingCandidate.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      const fileName = `${Date.now()}-${photo.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      
      fs.writeFileSync(filePath, photo.buffer);
      photoUrl = fileName;
    }

    const candidate = await this.prisma.candidate.update({
      where: { id },
      data: {
        name,
        email,
        studentId,
        positionId,
        departmentId,
        courseId,
        photo: photoUrl,
        manifesto,
      },
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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      message: 'Candidate updated successfully!',
      candidate,
    };
  }

  async deleteCandidate(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            votes: true,
            electionCandidates: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if candidate has related data
    if (candidate._count.votes > 0 || candidate._count.electionCandidates > 0) {
      throw new ConflictException('Cannot delete candidate with related votes or election assignments');
    }

    // Delete photo file if exists
    if (candidate.photo) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const photoPath = path.join(uploadsDir, candidate.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await this.prisma.candidate.delete({
      where: { id },
    });

    return {
      message: 'Candidate deleted successfully!',
    };
  }
} 