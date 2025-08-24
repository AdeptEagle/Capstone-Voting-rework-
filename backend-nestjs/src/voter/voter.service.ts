import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoterDto, UpdateVoterDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { IdGeneratorService } from '../utils/id-generator.service';
import { VotingGateway } from '../websocket/voting.gateway';

@Injectable()
export class VoterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: IdGeneratorService,
    private readonly votingGateway: VotingGateway,
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

    // departmentId and courseId are now required fields, no need for conditional logic

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

    // Emit real-time voter registration
    console.log('🔌 Emitting voter-registered WebSocket event...');
    console.log('📊 Voter data to emit:', {
      id: voter.id,
      studentId: voter.studentId,
      name: voter.name,
      email: voter.email
    });
    
    try {
      this.votingGateway.emitVoterRegistered({
        id: voter.id,
        studentId: voter.studentId,
        name: voter.name,
        email: voter.email,
        hasVoted: voter.hasVoted,
        department: voter.department,
        course: voter.course,
        createdAt: voter.createdAt,
      });
      console.log('✅ voter-registered event emitted successfully');
    } catch (error) {
      console.error('❌ Error emitting voter-registered event:', error);
    }

    // Also emit admin action for voter management
    console.log('🔌 Emitting admin-action WebSocket event...');
    try {
      this.votingGateway.emitAdminAction('voter-management', {
        action: 'voter-created',
        voterId: voter.id,
        voterName: voter.name,
      });
      console.log('✅ admin-action event emitted successfully');
    } catch (error) {
      console.error('❌ Error emitting admin-action event:', error);
    }

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

    // Emit real-time voter update
    this.votingGateway.emitVoterUpdated({
      id: updatedVoter.id,
      studentId: updatedVoter.studentId,
      name: updatedVoter.name,
      email: updatedVoter.email,
      hasVoted: updatedVoter.hasVoted,
      department: updatedVoter.department,
      course: updatedVoter.course,
      updatedAt: updatedVoter.updatedAt,
    });

    // Also emit admin action for voter management
    this.votingGateway.emitAdminAction('voter-management', {
      action: 'voter-updated',
      voterId: updatedVoter.id,
      voterName: updatedVoter.name,
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

    // Emit real-time voter deletion
    this.votingGateway.emitVoterDeleted(id);

    // Also emit admin action for voter management
    this.votingGateway.emitAdminAction('voter-management', {
      action: 'voter-deleted',
      voterId: id,
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

    // Emit real-time voter update for vote status
    this.votingGateway.emitVoterUpdated({
      id: updatedVoter.id,
      studentId: updatedVoter.studentId,
      name: updatedVoter.name,
      email: updatedVoter.email,
      hasVoted: updatedVoter.hasVoted,
      updatedAt: updatedVoter.updatedAt,
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

    // Emit real-time voter update for vote status reset
    this.votingGateway.emitVoterUpdated({
      id: updatedVoter.id,
      studentId: updatedVoter.studentId,
      name: updatedVoter.name,
      email: updatedVoter.email,
      hasVoted: updatedVoter.hasVoted,
      updatedAt: updatedVoter.updatedAt,
    });

    return {
      message: 'Voter vote status reset!',
      voter: updatedVoter,
    };
  }

  async getVoterPassword(id: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        password: true,
      },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // For security, we don't return the actual hashed password
    // Instead, we return a message indicating the password status
    return {
      message: 'Password retrieved successfully',
      hasCustomPassword: voter.password !== voter.studentId,
      defaultPassword: voter.studentId,
    };
  }

  async resetVoterPassword(id: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Reset password to student ID
    const hashedPassword = await bcrypt.hash(voter.studentId, 10);

    const updatedVoter = await this.prisma.voter.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Emit real-time voter update for password reset
    this.votingGateway.emitVoterUpdated({
      id: updatedVoter.id,
      studentId: updatedVoter.studentId,
      name: updatedVoter.name,
      email: updatedVoter.email,
      hasVoted: updatedVoter.hasVoted,
      updatedAt: updatedVoter.updatedAt,
    });

    // Also emit admin action for voter management
    this.votingGateway.emitAdminAction('voter-management', {
      action: 'voter-password-reset',
      voterId: updatedVoter.id,
      voterName: updatedVoter.name,
    });

    return {
      message: 'Password reset to Student ID successfully!',
      newPassword: voter.studentId,
      voter: {
        id: updatedVoter.id,
        studentId: updatedVoter.studentId,
        name: updatedVoter.name,
        email: updatedVoter.email,
      },
    };
  }
} 