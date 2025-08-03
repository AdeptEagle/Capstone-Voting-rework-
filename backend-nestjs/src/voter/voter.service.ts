import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoterDto, UpdateVoterDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { IdGeneratorService } from '../utils/id-generator.service';

@Injectable()
export class VoterService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async getAllVoters() {
    return this.prisma.voter.findMany({
      include: {
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
  }

  async getVoterById(id: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
      include: {
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

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return voter;
  }

  async getVoterByStudentId(studentId: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { studentId }, // Use studentId field
      include: {
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

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return voter;
  }

  async createVoter(createVoterDto: CreateVoterDto) {
    const { email, studentId, password, ...rest } = createVoterDto;

    // Check if voter already exists
    const existingVoter = await this.prisma.voter.findFirst({
      where: {
        OR: [
          { email },
          { studentId }, // Check if student ID already exists
        ],
      },
    });

    if (existingVoter) {
      throw new ConflictException('Voter with this email or student ID already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique ID for the voter
    const voterId = await this.idGenerator.generateVoterId();

    const voterData: any = {
      id: voterId,
      studentId,
      ...rest,
      email,
      password: hashedPassword,
    };

    // Only include departmentId and courseId if they exist
    if (rest.departmentId) {
      voterData.departmentId = rest.departmentId;
    }
    if (rest.courseId) {
      voterData.courseId = rest.courseId;
    }

    const voter = await this.prisma.voter.create({
      data: voterData,
      include: {
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
      message: 'Voter created successfully!',
      voter: {
        id: voter.id,
        studentId: voter.studentId,
        name: voter.name,
        email: voter.email,
        hasVoted: voter.hasVoted,
        department: voter.department,
        course: voter.course,
        createdAt: voter.createdAt,
        updatedAt: voter.updatedAt,
      },
    };
  }

  async updateVoter(id: string, updateVoterDto: UpdateVoterDto) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    const updateData: any = { ...updateVoterDto };

    // Hash password if provided
    if (updateVoterDto.password) {
      updateData.password = await bcrypt.hash(updateVoterDto.password, 10);
    }

    const updatedVoter = await this.prisma.voter.update({
      where: { id },
      data: updateData,
      include: {
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
      message: 'Voter updated successfully!',
      voter: updatedVoter,
    };
  }

  async deleteVoter(id: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    await this.prisma.voter.delete({
      where: { id },
    });

    return {
      message: 'Voter deleted successfully!',
    };
  }

  async markVoterAsVoted(id: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    const updatedVoter = await this.prisma.voter.update({
      where: { id },
      data: { hasVoted: true },
    });

    return {
      message: 'Voter marked as voted!',
      voter: updatedVoter,
    };
  }

  async resetVoterVoteStatus(id: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    const updatedVoter = await this.prisma.voter.update({
      where: { id },
      data: { hasVoted: false },
    });

    return {
      message: 'Voter vote status reset!',
      voter: updatedVoter,
    };
  }
} 