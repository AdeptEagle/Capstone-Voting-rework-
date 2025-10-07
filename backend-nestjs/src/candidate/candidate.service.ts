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
      where: showAll ? {} : { isDeleted: false }, // Exclude soft-deleted items by default
      include: {
        position: {
          select: {
            id: true,
            Position_Title: true,
          },
        },
        department: {
          select: {
            id: true,
            Department_Name: true,
          },
        },
        course: {
          select: {
            id: true,
            Course_Name: true,
            Course_Code: true,
          },
        },
        partyList: {
          select: {
            id: true,
            name: true,
            color: true,
            logo: true,
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
    const { Candidate_Name, Candidate_Email, Candidate_StudentId, positionId, departmentId, courseId, manifesto, partyListId } = createCandidateDto;

    // Check if position exists
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    // Check if department exists (now required)
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if course exists (now required)
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if party list exists (now required)
    const partyList = await this.prisma.partyList.findUnique({
      where: { id: partyListId },
    });

    if (!partyList) {
      throw new NotFoundException('Party list not found');
    }

    // Check if candidate with this student ID already exists
    const existingCandidate = await this.prisma.candidate.findFirst({
      where: { Candidate_StudentId: Candidate_StudentId },
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
          console.log('📸 Processing image upload for candidate');
          console.log('📸 Photo details:', {
            originalname: photo.originalname,
            mimetype: photo.mimetype,
            size: photo.size,
            buffer: photo.buffer ? 'Buffer exists' : 'No buffer'
          });
          
          // It's a file upload - will be processed by local storage
          const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
          console.log('📸 FileInfo received:', fileInfo);
          
          if (fileInfo && fileInfo.url) {
            photoUrl = fileInfo.url; // This will be a local URL like /uploads/images/filename.jpg
            console.log('📸 Image uploaded successfully:', photoUrl);
          } else {
            console.error('📸 Image upload failed - invalid response:', fileInfo);
            photoUrl = null;
          }
        } else if (typeof photo === 'string') {
          // Check if it's a Cloudinary URL or local upload URL
          if (photo.startsWith('https://res.cloudinary.com/') || photo.startsWith('/uploads/')) {
            photoUrl = photo;
          } else {
            photoUrl = null;
          }
        } else {
          photoUrl = null;
        }
      } catch (error) {
        console.error('📸 Image upload error:', error.message);
        console.error('📸 Full error:', error);
        photoUrl = null;
      }
    }

    // Generate custom ID
    const customId = await this.idGenerator.generateCandidateId();

    const candidate = await this.prisma.candidate.create({
      data: {
        id: customId,
        Candidate_Name: Candidate_Name,
        Candidate_Email: Candidate_Email,
        Candidate_StudentId: Candidate_StudentId,
        positionId,
        departmentId,
        courseId,
        photo: photoUrl,
        manifesto,
        partyListId,
      },
      include: {
        position: {
          select: {
            id: true,
            Position_Title: true,
          },
        },
        department: {
          select: {
            id: true,
            Department_Name: true,
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
            Position_Title: true,
          },
        },
        department: {
          select: {
            id: true,
            Department_Name: true,
          },
        },
        course: {
          select: {
            id: true,
            Course_Name: true,
            Course_Code: true,
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

    // Check if candidate is soft-deleted
    if (candidate.isDeleted) {
      throw new NotFoundException('Candidate has been deleted');
    }

    return candidate;
  }

  async updateCandidate(id: string, updateCandidateDto: UpdateCandidateDto, photo?: any) {
    const { Candidate_Name, Candidate_Email, Candidate_StudentId, positionId, departmentId, courseId, manifesto, partyListId } = updateCandidateDto;

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
    if (Candidate_StudentId && Candidate_StudentId !== existingCandidate.Candidate_StudentId) {
      const conflictingCandidate = await this.prisma.candidate.findFirst({
        where: {
          Candidate_StudentId: Candidate_StudentId,
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
          // It's a file upload - will be processed by Cloudinary
          
          // Delete old photo if exists (handles both Cloudinary and local files)
          if (existingCandidate.photo) {
            try {
              // Create file info object for deletion
              const oldPhotoInfo = {
                url: existingCandidate.photo,
                filename: existingCandidate.photo.split('/').pop() || '',
                type: 'image'
              };
              await this.fileUploadService.deleteFile(oldPhotoInfo);
            } catch (deleteError) {
              console.log('Failed to delete old photo:', deleteError.message);
              // Continue with upload even if deletion fails
            }
          }

          // Upload new photo to local storage
          const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
          console.log('FileInfo received:', fileInfo);
          
          if (fileInfo && fileInfo.url) {
            photoUrl = fileInfo.url; // This will be a local URL like /uploads/images/filename.jpg
            console.log('Photo URL set to:', photoUrl);
          } else {
            console.error('Invalid fileInfo or fileInfo.url:', fileInfo);
            photoUrl = existingCandidate.photo; // Keep existing photo
          }
        } else if (typeof photo === 'string') {
          // Check if it's a Cloudinary URL or local upload URL
          if (photo.startsWith('https://res.cloudinary.com/') || photo.startsWith('/uploads/')) {
            console.log('Processing as URL string:', photo);
            photoUrl = photo;
          } else {
            console.log('Invalid URL format, keeping existing photo');
            photoUrl = existingCandidate.photo;
          }
        } else {
          console.log('Photo is neither file upload nor valid URL string, keeping existing photo');
          photoUrl = existingCandidate.photo;
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        photoUrl = existingCandidate.photo; // Keep existing photo on error
      }
    } else {
      console.log('No photo provided, keeping existing photo');
    }

    const candidate = await this.prisma.candidate.update({
      where: { id },
      data: {
        Candidate_Name: Candidate_Name,
        Candidate_Email: Candidate_Email,
        Candidate_StudentId: Candidate_StudentId,
        positionId,
        departmentId,
        courseId,
        photo: photoUrl,
        manifesto,
        partyListId,
      },
      include: {
        position: {
          select: {
            id: true,
            Position_Title: true,
          },
        },
        department: {
          select: {
            id: true,
            Department_Name: true,
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

    // Check if candidate is already soft-deleted
    if (candidate.isDeleted) {
      throw new NotFoundException('Candidate has already been deleted');
    }

    // SOFT DELETE: Mark as deleted but preserve data
    // We allow deletion even with related data since soft delete preserves everything
    await this.prisma.candidate.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return {
      message: 'Candidate moved to trash successfully!',
    };
  }
} 