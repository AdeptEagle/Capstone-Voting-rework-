import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionAssignmentDto, UpdateElectionAssignmentDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';

@Injectable()
export class ElectionAssignmentService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
  ) {}

  async getAllElectionAssignments(electionId?: string, candidateId?: string) {
    const where: any = {};
    
    if (electionId) {
      where.electionId = electionId;
    }
    
    if (candidateId) {
      where.candidateId = candidateId;
    }

    return this.prisma.electionCandidate.findMany({
      where,
      include: {
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            photo: true,
            manifesto: true,
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
        },
      },
    });
  }

  async createElectionAssignment(createElectionAssignmentDto: CreateElectionAssignmentDto) {
    const { electionId, candidateId } = createElectionAssignmentDto;

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

    // Check if assignment already exists
    const existingAssignment = await this.prisma.electionCandidate.findFirst({
      where: {
        electionId,
        candidateId,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Candidate is already assigned to this election');
    }

    // Generate custom ID
    const customId = await this.idGenerator.generateElectionCandidateId();

    const assignment = await this.prisma.electionCandidate.create({
      data: {
        id: customId,
        electionId,
        candidateId,
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            photo: true,
            manifesto: true,
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
        },
      },
    });

    return {
      message: 'Election assignment created successfully!',
      assignment,
    };
  }

  async getElectionAssignmentById(id: string) {
    const assignment = await this.prisma.electionCandidate.findUnique({
      where: { id },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            photo: true,
            manifesto: true,
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
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Election assignment not found');
    }

    return assignment;
  }

  async updateElectionAssignment(id: string, updateElectionAssignmentDto: UpdateElectionAssignmentDto) {
    const assignment = await this.prisma.electionCandidate.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Election assignment not found');
    }

    const { electionId, candidateId } = updateElectionAssignmentDto;

    // Check if election exists if provided
    if (electionId) {
      const election = await this.prisma.election.findUnique({
        where: { id: electionId },
      });

      if (!election) {
        throw new NotFoundException('Election not found');
      }
    }

    // Check if candidate exists if provided
    if (candidateId) {
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate not found');
      }
    }

    const updatedAssignment = await this.prisma.electionCandidate.update({
      where: { id },
      data: {
        electionId,
        candidateId,
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            photo: true,
            manifesto: true,
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
        },
      },
    });

    return {
      message: 'Election assignment updated successfully!',
      assignment: updatedAssignment,
    };
  }

  async deleteElectionAssignment(id: string) {
    const assignment = await this.prisma.electionCandidate.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Election assignment not found');
    }

    await this.prisma.electionCandidate.delete({
      where: { id },
    });

    return {
      message: 'Election assignment deleted successfully!',
    };
  }

  async getCandidatesForElection(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const candidates = await this.prisma.electionCandidate.findMany({
      where: { electionId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            photo: true,
            manifesto: true,
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
        },
      },
    });

    return {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
      },
      candidates,
    };
  }

  async getElectionsForCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const elections = await this.prisma.electionCandidate.findMany({
      where: { candidateId },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
      },
    });

    return {
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        studentId: candidate.studentId,
        photo: candidate.photo,
        manifesto: candidate.manifesto,
      },
      elections,
    };
  }

  async bulkAssignCandidates(assignments: CreateElectionAssignmentDto[]) {
    const results = [];

    for (const assignment of assignments) {
      try {
        const result = await this.createElectionAssignment(assignment);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          data: assignment 
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      message: `Bulk assignment completed. ${successful} successful, ${failed} failed.`,
      results,
      summary: {
        total: assignments.length,
        successful,
        failed,
      },
    };
  }

  async removeCandidateFromElection(electionId: string, candidateId: string) {
    const assignment = await this.prisma.electionCandidate.findFirst({
      where: {
        electionId,
        candidateId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Election assignment not found');
    }

    await this.prisma.electionCandidate.delete({
      where: { id: assignment.id },
    });

    return {
      message: 'Candidate removed from election successfully!',
    };
  }

  // ===== ADVANCED ELECTION ASSIGNMENT FEATURES =====

  async getElectionPositions(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const positions = await this.prisma.electionPosition.findMany({
      where: { electionId },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            description: true,
            voteLimit: true,
          },
        },
      },
    });

    return {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
      },
      positions: positions.map(p => p.position),
    };
  }

  async getUnassignedPositions(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Get all positions
    const allPositions = await this.prisma.position.findMany();
    
    // Get assigned positions for this election
    const assignedPositions = await this.prisma.electionPosition.findMany({
      where: { electionId },
      select: { positionId: true },
    });

    const assignedPositionIds = assignedPositions.map(p => p.positionId);
    
    // Filter out assigned positions
    const unassignedPositions = allPositions.filter(
      position => !assignedPositionIds.includes(position.id)
    );

    return {
      election: {
        id: election.id,
        title: election.title,
      },
      unassignedPositions,
    };
  }

  async getPositionAssignmentStatus(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const allPositions = await this.prisma.position.findMany();
    const assignedPositions = await this.prisma.electionPosition.findMany({
      where: { electionId },
      include: {
        position: true,
      },
    });

    const status = allPositions.map(position => {
      const isAssigned = assignedPositions.some(ap => ap.positionId === position.id);
      return {
        position,
        isAssigned,
        assignedAt: isAssigned ? assignedPositions.find(ap => ap.positionId === position.id)?.createdAt : null,
      };
    });

    return {
      election: {
        id: election.id,
        title: election.title,
      },
      positionStatus: status,
    };
  }

  async assignPositionToElection(electionId: string, positionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    // Check if position is already assigned
    const existingAssignment = await this.prisma.electionPosition.findFirst({
      where: {
        electionId,
        positionId,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Position is already assigned to this election');
    }

    // Generate custom ID
    const customId = await this.idGenerator.generateElectionPositionId();

    const assignment = await this.prisma.electionPosition.create({
      data: {
        id: customId,
        electionId,
        positionId,
      },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            description: true,
            voteLimit: true,
          },
        },
      },
    });

    return {
      message: 'Position assigned to election successfully!',
      assignment,
    };
  }

  async removePositionFromElection(electionId: string, positionId: string) {
    const assignment = await this.prisma.electionPosition.findFirst({
      where: {
        electionId,
        positionId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Position assignment not found');
    }

    await this.prisma.electionPosition.delete({
      where: { id: assignment.id },
    });

    return {
      message: 'Position removed from election successfully!',
    };
  }

  async getUnassignedCandidates(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Get all candidates
    const allCandidates = await this.prisma.candidate.findMany({
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
    
    // Get assigned candidates for this election
    const assignedCandidates = await this.prisma.electionCandidate.findMany({
      where: { electionId },
      select: { candidateId: true },
    });

    const assignedCandidateIds = assignedCandidates.map(c => c.candidateId);
    
    // Filter out assigned candidates
    const unassignedCandidates = allCandidates.filter(
      candidate => !assignedCandidateIds.includes(candidate.id)
    );

    return {
      election: {
        id: election.id,
        title: election.title,
      },
      unassignedCandidates,
    };
  }

  async getCandidateAssignmentStatus(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const allCandidates = await this.prisma.candidate.findMany({
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

    const assignedCandidates = await this.prisma.electionCandidate.findMany({
      where: { electionId },
      include: {
        candidate: {
          include: {
            position: true,
            department: true,
          },
        },
      },
    });

    const status = allCandidates.map(candidate => {
      const isAssigned = assignedCandidates.some(ac => ac.candidateId === candidate.id);
      return {
        candidate,
        isAssigned,
        assignedAt: isAssigned ? assignedCandidates.find(ac => ac.candidateId === candidate.id)?.createdAt : null,
      };
    });

    return {
      election: {
        id: election.id,
        title: election.title,
      },
      candidateStatus: status,
    };
  }

  async assignCandidateToElection(electionId: string, candidateId: string) {
    // This is the same as createElectionAssignment but with a different name for clarity
    return this.createElectionAssignment({ electionId, candidateId });
  }

  async getElectionBallot(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Get all positions assigned to this election
    const electionPositions = await this.prisma.electionPosition.findMany({
      where: { electionId },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            description: true,
            voteLimit: true,
          },
        },
      },
    });

    // Get all candidates assigned to this election
    const electionCandidates = await this.prisma.electionCandidate.findMany({
      where: { electionId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            photo: true,
            manifesto: true,
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
        },
      },
    });

    // Group candidates by position
    const ballot = electionPositions.map(electionPosition => {
      const positionCandidates = electionCandidates.filter(
        ec => ec.candidate.position.id === electionPosition.positionId
      );

      return {
        position: electionPosition.position,
        candidates: positionCandidates.map(ec => ec.candidate),
      };
    });

    return {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
      },
      ballot,
    };
  }
} 