import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionDto, UpdateElectionDto, AddPositionDto, AddCandidateDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { TimezoneService } from '../services/timezone.service';
import { VotingGateway } from '../websocket/voting.gateway';

@Injectable()
export class ElectionService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private timezoneService: TimezoneService,
    private votingGateway: VotingGateway,
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

    // Emit real-time election creation
    this.votingGateway.emitElectionCreated({
      id: election.id,
      title: election.title,
      description: election.description,
      startDate: election.startDate,
      endDate: election.endDate,
      isActive: election.isActive,
      createdBy: election.createdBy,
      admin: election.admin,
      createdAt: election.createdAt,
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
      data: { 
        isActive: true,
        status: 'active'
      },
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
      data: { 
        isActive: false,
        status: 'draft'
      },
    });

    return {
      message: 'Election deactivated successfully!',
      election: updatedElection,
    };
  }

  // ===== COMPREHENSIVE BALLOT LIFECYCLE MANAGEMENT =====

  async startBallot(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
        electionPositions: true,
        electionCandidates: true,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Check if election has positions and candidates
    if (election.electionPositions.length === 0) {
      throw new ConflictException('Cannot start ballot: No positions assigned to election');
    }

    if (election.electionCandidates.length === 0) {
      throw new ConflictException('Cannot start ballot: No candidates assigned to election');
    }

    // Check if ballot is already active
    if (election.status === 'active') {
      throw new ConflictException('Ballot is already active');
    }

    // Check if ballot has ended
    if (election.status === 'ended') {
      throw new ConflictException('Cannot start ballot: Election has already ended');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { 
        isActive: true,
        status: 'active'
      },
    });

    // Emit real-time election status update
    this.votingGateway.emitElectionStatusUpdate(id, 'active', {
      id: updatedElection.id,
      title: updatedElection.title,
      status: updatedElection.status,
      startDate: updatedElection.startDate,
      endDate: updatedElection.endDate,
      updatedAt: updatedElection.updatedAt,
    });

    return {
      message: 'Ballot started successfully! Voting is now open.',
      election: updatedElection,
      ballotInfo: {
        positions: election.electionPositions.length,
        candidates: election.electionCandidates.length,
        status: 'active'
      }
    };
  }

  async pauseBallot(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Check if ballot is active
    if (election.status !== 'active') {
      throw new ConflictException('Cannot pause ballot: Ballot is not active');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { 
        isActive: false,
        status: 'paused'
      },
    });

    // Emit real-time election status update
    this.votingGateway.emitElectionStatusUpdate(id, 'paused', {
      id: updatedElection.id,
      title: updatedElection.title,
      status: updatedElection.status,
      startDate: updatedElection.startDate,
      endDate: updatedElection.endDate,
      updatedAt: updatedElection.updatedAt,
    });

    return {
      message: 'Ballot paused successfully! Voting is temporarily suspended.',
      election: updatedElection,
    };
  }

  async resumeBallot(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Check if ballot is paused
    if (election.status !== 'paused') {
      throw new ConflictException('Cannot resume ballot: Ballot is not paused');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { 
        isActive: true,
        status: 'active'
      },
    });

    // Emit real-time election status update
    this.votingGateway.emitElectionStatusUpdate(id, 'active', {
      id: updatedElection.id,
      title: updatedElection.title,
      status: updatedElection.status,
      startDate: updatedElection.startDate,
      endDate: updatedElection.endDate,
      updatedAt: updatedElection.updatedAt,
    });

    return {
      message: 'Ballot resumed successfully! Voting is now open again.',
      election: updatedElection,
    };
  }

  async endBallot(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
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

    // Check if ballot can be ended
    if (election.status === 'ended') {
      throw new ConflictException('Ballot has already ended');
    }

    if (election.status === 'draft') {
      throw new ConflictException('Cannot end ballot: Ballot has not been started');
    }

    const updatedElection = await this.prisma.election.update({
      where: { id },
      data: { 
        isActive: false,
        status: 'ended'
      },
    });

    // Get final results
    const totalVotes = election.votes.length;
    const uniqueVoters = await this.prisma.vote.groupBy({
      by: ['voterId'],
      where: { electionId: id },
      _count: { voterId: true },
    });

    // Emit real-time election status update
    this.votingGateway.emitElectionStatusUpdate(id, 'ended', {
      id: updatedElection.id,
      title: updatedElection.title,
      status: updatedElection.status,
      startDate: updatedElection.startDate,
      endDate: updatedElection.endDate,
      updatedAt: updatedElection.updatedAt,
      finalResults: {
        totalVotes,
        uniqueVoters: uniqueVoters.length,
        status: 'ended',
        endedAt: new Date(),
      },
    });

    return {
      message: 'Ballot ended successfully! Results are now final.',
      election: updatedElection,
      finalResults: {
        totalVotes,
        uniqueVoters: uniqueVoters.length,
        status: 'ended',
        endedAt: new Date(),
      }
    };
  }

  async getBallotStatus(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
        electionPositions: {
          include: {
            position: true,
          },
        },
        electionCandidates: {
          include: {
            candidate: true,
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

    // Calculate voting statistics
    const totalVotes = election.votes.length;
    const uniqueVoters = await this.prisma.vote.groupBy({
      by: ['voterId'],
      where: { electionId: id },
      _count: { voterId: true },
    });

    const ballotInfo = {
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
        isActive: election.isActive,
        startDate: election.startDate,
        endDate: election.endDate,
      },
      ballot: {
        positions: election.electionPositions.length,
        candidates: election.electionCandidates.length,
        totalVotes,
        uniqueVoters: uniqueVoters.length,
        canVote: election.status === 'active',
        canPause: election.status === 'active',
        canResume: election.status === 'paused',
        canEnd: election.status === 'active' || election.status === 'paused',
      },
      lifecycle: {
        draft: election.status === 'draft',
        active: election.status === 'active',
        paused: election.status === 'paused',
        ended: election.status === 'ended',
      }
    };

    return ballotInfo;
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

  // ===== AUTOMATIC VOTE LOCKOUT SYSTEM =====

  async checkAndAutoEndElections() {
    const now = this.timezoneService.getCurrentPhilippineTime();
    
    // Find all active elections that have passed their end time
    const expiredElections = await this.prisma.election.findMany({
      where: {
        status: 'active',
        endDate: {
          lte: now, // Less than or equal to current Philippine time
        },
      },
      include: {
        votes: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    const autoEndedElections = [];

    for (const election of expiredElections) {
      try {
        // Auto-end the election
        const updatedElection = await this.prisma.election.update({
          where: { id: election.id },
          data: { 
            isActive: false,
            status: 'ended'
          },
        });

        // Get final results
        const totalVotes = election.votes.length;
        const uniqueVoters = await this.prisma.vote.groupBy({
          by: ['voterId'],
          where: { electionId: election.id },
          _count: { voterId: true },
        });

        autoEndedElections.push({
          election: updatedElection,
          finalResults: {
            totalVotes,
            uniqueVoters: uniqueVoters.length,
            status: 'ended',
            endedAt: now,
            endedAtPhilippine: this.timezoneService.formatPhilippineTimeForDisplay(now),
            autoEnded: true,
          }
        });

        console.log(`🕐 Auto-ended election: ${election.title} (ID: ${election.id})`);
        console.log(`   Total votes: ${totalVotes}, Unique voters: ${uniqueVoters.length}`);
      } catch (error) {
        console.error(`❌ Error auto-ending election ${election.id}:`, error);
      }
    }

    return {
      message: `Auto-ended ${autoEndedElections.length} expired election(s)`,
      autoEndedElections,
    };
  }

  async getElectionTimeStatus(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const now = this.timezoneService.getCurrentPhilippineTime();
    const startDate = this.timezoneService.convertToPhilippineTime(election.startDate);
    const endDate = this.timezoneService.convertToPhilippineTime(election.endDate);

    const timeStatus = {
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
      },
      timezone: this.timezoneService.getPhilippineTimezoneInfo(),
      timeInfo: {
        now: now.toISOString(),
        nowPhilippine: this.timezoneService.formatPhilippineTimeForDisplay(now),
        startDate: startDate.toISOString(),
        startDatePhilippine: this.timezoneService.formatPhilippineTimeForDisplay(startDate),
        endDate: endDate.toISOString(),
        endDatePhilippine: this.timezoneService.formatPhilippineTimeForDisplay(endDate),
        isStarted: now >= startDate,
        isEnded: now >= endDate,
        timeUntilStart: Math.max(0, startDate.getTime() - now.getTime()),
        timeUntilEnd: Math.max(0, endDate.getTime() - now.getTime()),
        timeRemaining: Math.max(0, endDate.getTime() - now.getTime()),
        timeDifference: this.timezoneService.getTimeDifferenceInPhilippineTime(endDate),
      },
      votingStatus: {
        canVote: election.status === 'active' && now >= startDate && now < endDate,
        shouldAutoEnd: election.status === 'active' && now >= endDate,
        isExpired: now >= endDate,
        isInFuture: now < startDate,
        isInProgress: now >= startDate && now < endDate,
      }
    };

    return timeStatus;
  }

  async scheduleAutoEndCheck() {
    // This method can be called by a cron job or scheduler
    // to periodically check for expired elections
    return this.checkAndAutoEndElections();
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

  async getElectionHistory() {
    try {
      // Get all ended elections with comprehensive data
      const endedElections = await this.prisma.election.findMany({
        where: {
          status: 'ended'
        },
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              role: true
            }
          },
          electionPositions: {
            include: {
              position: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  voteLimit: true
                }
              }
            }
          },
          electionCandidates: {
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
                      title: true
                    }
                  },
                  department: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  course: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          endDate: 'desc'
        }
      });

      // For each ended election, get detailed vote results
      const electionHistory = await Promise.all(
        endedElections.map(async (election) => {
          // Get vote results for this election
          const voteResults = await this.prisma.vote.groupBy({
            by: ['positionId', 'candidateId'],
            where: {
              electionId: election.id
            },
            _count: {
              id: true
            }
          });

          // Get voter participation data
          const totalVoters = await this.prisma.voter.count();
          const uniqueVoters = await this.prisma.vote.groupBy({
            by: ['voterId'],
            where: {
              electionId: election.id
            },
            _count: {
              id: true
            }
          });

          // Calculate participation statistics
          const votersWhoVoted = uniqueVoters.length;
          const voterTurnout = totalVoters > 0 ? Math.round((votersWhoVoted / totalVoters) * 100) : 0;

          // Get total votes cast
          const totalVotes = voteResults.reduce((sum, result) => sum + result._count.id, 0);

          // Organize results by position
          const resultsByPosition = {};
          for (const result of voteResults) {
            const position = election.electionPositions.find(ep => ep.positionId === result.positionId);
            const candidate = election.electionCandidates.find(ec => ec.candidateId === result.candidateId);
            
            if (position && candidate) {
              const positionTitle = position.position.title;
              if (!resultsByPosition[positionTitle]) {
                resultsByPosition[positionTitle] = {
                  positionId: result.positionId,
                  positionTitle: positionTitle,
                  voteLimit: position.position.voteLimit,
                  candidates: []
                };
              }
              
              resultsByPosition[positionTitle].candidates.push({
                candidateId: result.candidateId,
                candidateName: candidate.candidate.name,
                candidateEmail: candidate.candidate.email,
                candidateStudentId: candidate.candidate.studentId,
                candidatePhoto: candidate.candidate.photo,
                candidateManifesto: candidate.candidate.manifesto,
                candidateDepartment: candidate.candidate.department?.name || 'N/A',
                candidateCourse: candidate.candidate.course?.name || 'N/A',
                voteCount: result._count.id
              });
            }
          }

          // Sort candidates by vote count within each position
          Object.values(resultsByPosition).forEach((position: any) => {
            position.candidates.sort((a: any, b: any) => b.voteCount - a.voteCount);
          });

          // Calculate election duration
          const startDate = new Date(election.startDate);
          const endDate = new Date(election.endDate);
          const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

          // Format dates for display
          const formatDate = (date) => {
            return new Date(date).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            });
          };

          return {
            electionId: election.id,
            title: election.title,
            description: election.description,
            status: election.status,
            startDate: election.startDate,
            endDate: election.endDate,
            startDateFormatted: formatDate(election.startDate),
            endDateFormatted: formatDate(election.endDate),
            durationInMinutes,
            createdBy: election.admin.username,
            adminRole: election.admin.role,
            createdAt: election.createdAt,
            updatedAt: election.updatedAt,
            
            // Statistics
            totalVotes,
            totalVoters,
            votersWhoVoted,
            voterTurnout,
            uniqueVoters: votersWhoVoted,
            
            // Positions and candidates
            totalPositions: election.electionPositions.length,
            totalCandidates: election.electionCandidates.length,
            positions: election.electionPositions.map(ep => ({
              positionId: ep.position.id,
              title: ep.position.title,
              description: ep.position.description,
              voteLimit: ep.position.voteLimit
            })),
            candidates: election.electionCandidates.map(ec => ({
              candidateId: ec.candidate.id,
              name: ec.candidate.name,
              email: ec.candidate.email,
              studentId: ec.candidate.studentId,
              photo: ec.candidate.photo,
              manifesto: ec.candidate.manifesto,
              position: ec.candidate.position.title,
              department: ec.candidate.department?.name || 'N/A',
              course: ec.candidate.course?.name || 'N/A'
            })),
            
            // Detailed results by position
            resultsByPosition,
            
            // Summary
            summary: {
              totalPositions: election.electionPositions.length,
              totalCandidates: election.electionCandidates.length,
              totalVotes,
              totalVoters,
              votersWhoVoted,
              voterTurnout: `${voterTurnout}%`,
              duration: `${durationInMinutes} minutes`,
              status: election.status
            }
          };
        })
      );

      return {
        message: 'Election history retrieved successfully',
        totalElections: electionHistory.length,
        elections: electionHistory
      };

    } catch (error) {
      console.error('Error getting election history:', error);
      throw new Error('Failed to get election history');
    }
  }
} 