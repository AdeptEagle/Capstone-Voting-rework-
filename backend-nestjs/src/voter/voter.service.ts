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
  }

  async getVoterById(id: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id },
      include: {
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

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return voter;
  }

  async getVoterByStudentId(studentId: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { Voter_StudentId: studentId },
      include: {
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

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return voter;
  }

  async createVoter(createVoterDto: CreateVoterDto) {
    const { Voter_Email, Voter_StudentId, password, ...rest } = createVoterDto;

    // Check if voter already exists
    const existingVoter = await this.prisma.voter.findFirst({
      where: {
        OR: [
          { Voter_Email: Voter_Email },
          { Voter_StudentId: Voter_StudentId },
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
      Voter_StudentId: Voter_StudentId,
      ...rest,
      Voter_Email: Voter_Email,
      password: hashedPassword,
    };

    const voter = await this.prisma.voter.create({
      data: voterData,
      include: {
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

    // Emit real-time voter registration
    console.log('🔌 Emitting voter-registered WebSocket event...');
    console.log('📊 Voter data to emit:', {
      id: voter.id,
      studentId: voter.Voter_StudentId,
      name: voter.Voter_Name,
      email: voter.Voter_Email
    });
    
    try {
      this.votingGateway.emitVoterRegistered({
        id: voter.id,
        studentId: voter.Voter_StudentId,
        name: voter.Voter_Name,
        email: voter.Voter_Email,
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
        voterName: voter.Voter_Name,
      });
      console.log('✅ admin-action event emitted successfully');
    } catch (error) {
      console.error('❌ Error emitting admin-action event:', error);
    }

    return {
      message: 'Voter created successfully!',
      voter: {
        id: voter.id,
        studentId: voter.Voter_StudentId,
        name: voter.Voter_Name,
        email: voter.Voter_Email,
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

    // Emit real-time voter update
    this.votingGateway.emitVoterUpdated({
      id: updatedVoter.id,
      studentId: updatedVoter.Voter_StudentId,
      name: updatedVoter.Voter_Name,
      email: updatedVoter.Voter_Email,
      hasVoted: updatedVoter.hasVoted,
      department: updatedVoter.department,
      course: updatedVoter.course,
      updatedAt: updatedVoter.updatedAt,
    });

    // Also emit admin action for voter management
    this.votingGateway.emitAdminAction('voter-management', {
      action: 'voter-updated',
      voterId: updatedVoter.id,
      voterName: updatedVoter.Voter_Name,
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
      studentId: updatedVoter.Voter_StudentId,
      name: updatedVoter.Voter_Name,
      email: updatedVoter.Voter_Email,
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
      studentId: updatedVoter.Voter_StudentId,
      name: updatedVoter.Voter_Name,
      email: updatedVoter.Voter_Email,
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
        Voter_StudentId: true,
        Voter_Name: true,
        Voter_Email: true,
        password: true,
      },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Check if the current password is the default (student ID)
    const isDefaultPassword = await bcrypt.compare(voter.Voter_StudentId, voter.password);
    
    return {
      message: 'Password retrieved successfully',
      voter: {
        id: voter.id,
        studentId: voter.Voter_StudentId,
        name: voter.Voter_Name,
        email: voter.Voter_Email,
      },
      currentPassword: isDefaultPassword ? voter.Voter_StudentId : 'Custom Password Set',
      isDefaultPassword: isDefaultPassword,
      defaultPassword: voter.Voter_StudentId,
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
    const hashedPassword = await bcrypt.hash(voter.Voter_StudentId, 10);

    const updatedVoter = await this.prisma.voter.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Emit real-time voter update for password reset
    this.votingGateway.emitVoterUpdated({
      id: updatedVoter.id,
      studentId: updatedVoter.Voter_StudentId,
      name: updatedVoter.Voter_Name,
      email: updatedVoter.Voter_Email,
      hasVoted: updatedVoter.hasVoted,
      updatedAt: updatedVoter.updatedAt,
    });

    // Also emit admin action for voter management
    this.votingGateway.emitAdminAction('voter-management', {
      action: 'voter-password-reset',
      voterId: updatedVoter.id,
      voterName: updatedVoter.Voter_Name,
    });

    return {
      message: 'Password reset to Student ID successfully!',
      newPassword: voter.Voter_StudentId,
      voter: {
        id: updatedVoter.id,
        studentId: updatedVoter.Voter_StudentId,
        name: updatedVoter.Voter_Name,
        email: updatedVoter.Voter_Email,
      },
    };
  }
} 