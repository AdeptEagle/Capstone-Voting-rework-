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
    console.log('createCandidate called with photo:', photo);
    console.log('createCandidateDto:', createCandidateDto);
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
      console.log('Photo object received:', photo);
      console.log('Photo type:', typeof photo);
      console.log('Photo properties:', Object.keys(photo));
      
      try {
        // Check if photo is a file upload or a URL string
        if (photo.buffer || photo.originalname) {
          console.log('Processing as file upload');
          // It's a file upload
          const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
          console.log('FileInfo received:', fileInfo);
          
          if (fileInfo && fileInfo.url && fileInfo.url !== '/uploads/images/undefined') {
            photoUrl = fileInfo.url;
            console.log('Photo URL set to:', photoUrl);
          } else {
            console.error('Invalid fileInfo or fileInfo.url:', fileInfo);
            // Don't throw error, just set to null
            console.log('Setting photo to null due to invalid fileInfo');
            photoUrl = null;
          }
        } else if (typeof photo === 'string' && photo.startsWith('/uploads/') && photo !== '/uploads/images/undefined') {
          console.log('Processing as URL string:', photo);
          // It's a URL string from file upload service
          photoUrl = photo;
        } else {
          console.log('Photo is neither file upload nor valid URL string, setting to null');
          photoUrl = null;
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        // Don't throw error, just set to null
        console.log('Setting photo to null due to upload error');
        photoUrl = null;
      }
    } else {
      console.log('No photo provided, setting to null');
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
      console.log('Photo object received:', photo);
      console.log('Photo type:', typeof photo);
      console.log('Photo properties:', Object.keys(photo));
      
      try {
        // Check if photo is a file upload or a URL string
        if (photo.buffer || photo.originalname) {
          console.log('Processing as file upload');
          // It's a file upload
          // Delete old photo if exists
          if (existingCandidate.photo && existingCandidate.photo !== '/uploads/images/undefined') {
            const oldPhotoFilename = existingCandidate.photo.split('/').pop();
            if (oldPhotoFilename) {
              await this.fileUploadService.deleteFile(oldPhotoFilename, 'image');
            }
          }

          // Upload new photo
          const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
          console.log('FileInfo received:', fileInfo);
          
          if (fileInfo && fileInfo.url && fileInfo.url !== '/uploads/images/undefined') {
            photoUrl = fileInfo.url;
            console.log('Photo URL set to:', photoUrl);
          } else {
            console.error('Invalid fileInfo or fileInfo.url:', fileInfo);
            // Don't throw error, just keep existing photo
            console.log('Keeping existing photo due to invalid fileInfo');
          }
        } else if (typeof photo === 'string' && photo.startsWith('/uploads/') && photo !== '/uploads/images/undefined') {
          console.log('Processing as URL string:', photo);
          // It's a URL string from file upload service
          photoUrl = photo;
        } else {
          console.log('Photo is neither file upload nor valid URL string, keeping existing photo');
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        // Don't throw error, just keep existing photo
        console.log('Keeping existing photo due to upload error');
      }
    } else {
      console.log('No photo provided, keeping existing photo');
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