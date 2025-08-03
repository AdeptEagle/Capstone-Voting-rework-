import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { FileUploadService } from '../services/file-upload.service';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private fileUploadService: FileUploadService
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

    // Handle photo upload using FileUploadService
    let photoUrl = null;
    if (photo) {
      try {
        // Check if photo is a file upload or a URL string
        if (photo.buffer || photo.originalname) {
          // It's a file upload
          const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
          photoUrl = fileInfo.url;
        } else if (typeof photo === 'string' && photo.startsWith('/uploads/')) {
          // It's a URL string from file upload service
          photoUrl = photo;
        }
      } catch (error) {
        throw new ConflictException(`Photo upload failed: ${error.message}`);
      }
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

    // Handle photo upload using FileUploadService
    let photoUrl = existingCandidate.photo;
    if (photo) {
      try {
        // Check if photo is a file upload or a URL string
        if (photo.buffer || photo.originalname) {
          // It's a file upload
          // Delete old photo if exists
          if (existingCandidate.photo) {
            const oldPhotoFilename = existingCandidate.photo.split('/').pop();
            if (oldPhotoFilename) {
              await this.fileUploadService.deleteFile(oldPhotoFilename, 'image');
            }
          }

          // Upload new photo
          const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
          photoUrl = fileInfo.url;
        } else if (typeof photo === 'string' && photo.startsWith('/uploads/')) {
          // It's a URL string from file upload service
          photoUrl = photo;
        }
      } catch (error) {
        throw new ConflictException(`Photo upload failed: ${error.message}`);
      }
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
      const photoFilename = candidate.photo.split('/').pop();
      if (photoFilename) {
        await this.fileUploadService.deleteFile(photoFilename, 'image');
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