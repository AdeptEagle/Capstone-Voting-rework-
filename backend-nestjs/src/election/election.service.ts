import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionDto, UpdateElectionDto, AddPositionDto, AddCandidateDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';

@Injectable()
export class ElectionService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async getAllElections() {
    return this.prisma.election.findMany({
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        electionPositions: {
          include: {
            position: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        electionCandidates: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                studentId: true,
              },
            },
          },
        },
        votes: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getElectionById(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        electionPositions: {
          include: {
            position: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        electionCandidates: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                studentId: true,
              },
            },
          },
        },
        votes: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    return election;
  }

  async createElection(createElectionDto: CreateElectionDto, adminId: string) {
    const { title, description, startDate, endDate, isActive } = createElectionDto;

    // Check if election with same title already exists
    const existingElection = await this.prisma.election.findFirst({
      where: { title },
    });

    if (existingElection) {
      throw new ConflictException('Election with this title already exists');
    }

    // Generate custom ID
    const customId = await this.idGenerator.generateElectionId();

    const election = await this.prisma.election.create({
      data: {
        id: customId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
        createdBy: adminId,
      },
      include: {
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
      message: 'Election created successfully!',
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
        createdBy: election.createdBy,
        admin: election.admin,
        createdAt: election.createdAt,
        updatedAt: election.updatedAt,
      },
    };
  }

  async updateElection(id: string, updateElectionDto: UpdateElectionDto) {
    const election = await this.prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const updateData: any = { ...updateElectionDto };

    // Convert dates if provided
    if (updateElectionDto.startDate) {
      updateData.startDate = new Date(updateElectionDto.startDate);
    }
    if (updateElectionDto.endDate) {
      updateData.endDate = new Date(updateElectionDto.endDate);
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: updateData,
      include: {
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
      message: 'Election updated successfully!',
      election: updatedElection,
    };
  }

  async deleteElection(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    await this.prisma.election.delete({
      where: { id },
    });

    return {
      message: 'Election deleted successfully!',
    };
  }

  async activateElection(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { isActive: true },
    });

    return {
      message: 'Election activated successfully!',
      election: updatedElection,
    };
  }

  async deactivateElection(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Election deactivated successfully!',
      election: updatedElection,
    };
  }

  async getActiveElections() {
    return this.prisma.election.findMany({
      where: { isActive: true },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        electionPositions: {
          include: {
            position: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        electionCandidates: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                studentId: true,
              },
            },
          },
        },
      },
    });
  }

  async addPositionToElection(electionId: string, addPositionDto: AddPositionDto) {
    const { positionId } = addPositionDto;

    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Check if position exists
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    // Check if position is already added to this election
    const existingElectionPosition = await this.prisma.electionPosition.findUnique({
      where: {
        electionId_positionId: {
          electionId,
          positionId,
        },
      },
    });

    if (existingElectionPosition) {
      throw new ConflictException('Position is already added to this election');
    }

    // Generate custom ID for election position
    const electionPositionId = await this.idGenerator.generateElectionPositionId();

    const electionPosition = await this.prisma.electionPosition.create({
      data: {
        id: electionPositionId,
        electionId,
        positionId,
      },
      include: {
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      message: 'Position added to election successfully!',
      electionPosition,
    };
  }

  async addCandidateToElection(electionId: string, addCandidateDto: AddCandidateDto) {
    const { candidateId } = addCandidateDto;

    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Check if candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if candidate is already added to this election
    const existingElectionCandidate = await this.prisma.electionCandidate.findUnique({
      where: {
        electionId_candidateId: {
          electionId,
          candidateId,
        },
      },
    });

    if (existingElectionCandidate) {
      throw new ConflictException('Candidate is already added to this election');
    }

    // Generate custom ID for election candidate
    const electionCandidateId = await this.idGenerator.generateElectionCandidateId();

    const electionCandidate = await this.prisma.electionCandidate.create({
      data: {
        id: electionCandidateId,
        electionId,
        candidateId,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
            positionId: true,
          },
        },
      },
    });

    return {
      message: 'Candidate added to election successfully!',
      electionCandidate,
    };
  }

  async removePositionFromElection(electionId: string, positionId: string) {
    // Check if election position exists
    const electionPosition = await this.prisma.electionPosition.findUnique({
      where: {
        electionId_positionId: {
          electionId,
          positionId,
        },
      },
    });

    if (!electionPosition) {
      throw new NotFoundException('Position is not added to this election');
    }

    await this.prisma.electionPosition.delete({
      where: {
        electionId_positionId: {
          electionId,
          positionId,
        },
      },
    });

    return {
      message: 'Position removed from election successfully!',
    };
  }

  async removeCandidateFromElection(electionId: string, candidateId: string) {
    // Check if election candidate exists
    const electionCandidate = await this.prisma.electionCandidate.findUnique({
      where: {
        electionId_candidateId: {
          electionId,
          candidateId,
        },
      },
    });

    if (!electionCandidate) {
      throw new NotFoundException('Candidate is not added to this election');
    }

    await this.prisma.electionCandidate.delete({
      where: {
        electionId_candidateId: {
          electionId,
          candidateId,
        },
      },
    });

    return {
      message: 'Candidate removed from election successfully!',
    };
  }
} 