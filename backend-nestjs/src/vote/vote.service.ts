import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { TimezoneService } from '../services/timezone.service';
import { VotingGateway } from '../websocket/voting.gateway';

@Injectable()
export class VoteService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private readonly timezoneService: TimezoneService,
    private readonly votingGateway: VotingGateway,
  ) {}

  async getAllVotes() {
    return this.prisma.vote.findMany({
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getVoteById(id: string) {
    const vote = await this.prisma.vote.findUnique({
      where: { id },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    return vote;
  }

  async createVote(createVoteDto: CreateVoteDto) {
    const { voterId, candidateId, electionId, positionId } = createVoteDto;

    // Check if election exists and is active
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (!election.isActive) {
      throw new BadRequestException('Election is not active');
    }

    // Check if voter exists
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Check if voter is locked out (has completed voting)
    if (voter.hasVoted) {
      throw new ConflictException('Voter has already completed voting and cannot vote again');
    }

    // Check if candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if position exists and get vote limit
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    const voteLimit = position.voteLimit || 1;

    // Get current vote count for this voter in this election and position
    const currentVoteCount = await this.prisma.vote.count({
      where: {
        voterId,
        electionId,
        positionId,
      },
    });

    // Check if voter has reached the vote limit for this position
    if (currentVoteCount >= voteLimit) {
      throw new ConflictException(`Voter has already cast ${voteLimit} vote(s) for this position`);
    }

    // Check for candidate duplication if vote limit is 1
    if (voteLimit === 1) {
      const existingVoteForCandidate = await this.prisma.vote.findFirst({
        where: {
          voterId,
          electionId,
          positionId,
          candidateId,
        },
      });

      if (existingVoteForCandidate) {
        throw new ConflictException('Voter has already voted for this candidate in this position');
      }
    } else {
      // For vote limits > 1, check if voter has already voted for this specific candidate
      const existingVoteForCandidate = await this.prisma.vote.findFirst({
        where: {
          voterId,
          electionId,
          positionId,
          candidateId,
        },
      });

      if (existingVoteForCandidate) {
        throw new ConflictException('Voter has already voted for this candidate in this position');
      }
    }

    // Generate custom ID
    const customId = await this.idGenerator.generateVoteId();

    // BEGIN TRANSACTION - ACID Atomicity
    return await this.prisma.$transaction(async (prisma) => {
      // Create the vote
      const vote = await prisma.vote.create({
      data: {
        id: customId,
        voterId,
        candidateId,
        electionId,
        positionId,
      },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
              voteLimit: true,
            },
          },
        },
      });

      // Check if this was the last vote for this position (vote limit reached)
      const updatedVoteCount = await prisma.vote.count({
        where: {
          voterId,
          electionId,
          positionId,
        },
      });

      // Check if this was the final vote for this position
      const isFinalVoteForPosition = updatedVoteCount >= voteLimit;

      // Get all positions in this election
      const electionPositions = await prisma.electionPosition.findMany({
        where: { electionId },
      });

      // Check if voter has completed voting for all positions
      let allPositionsCompleted = true;
      for (const electionPosition of electionPositions) {
        const positionVoteCount = await prisma.vote.count({
          where: {
            voterId,
            electionId,
            positionId: electionPosition.positionId,
      },
    });

        const position = await prisma.position.findUnique({
          where: { id: electionPosition.positionId },
        });

        const positionVoteLimit = position?.voteLimit || 1;

        if (positionVoteCount < positionVoteLimit) {
          allPositionsCompleted = false;
          break;
        }
      }

      // Mark voter as locked out if they've completed voting for all positions
      if (allPositionsCompleted) {
        await prisma.voter.update({
      where: { id: voterId },
      data: { hasVoted: true },
    });
      }

    return {
        message: `Vote cast successfully! (${updatedVoteCount}/${voteLimit} votes for this position)`,
      vote: {
        id: vote.id,
        voter: vote.voter,
        candidate: vote.candidate,
        election: vote.election,
        position: vote.position,
        createdAt: vote.createdAt,
      },
        voteCount: updatedVoteCount,
        voteLimit: voteLimit,
        isFinalVoteForPosition,
        isLockedOut: allPositionsCompleted,
        confirmation: {
          voterName: vote.voter.name,
          candidateName: vote.candidate.name,
          positionTitle: vote.position.title,
          electionTitle: vote.election.title,
          votedAt: vote.createdAt,
          voteId: vote.id,
          remainingVotes: voteLimit - updatedVoteCount,
          lockoutMessage: allPositionsCompleted ? 'Voter has completed all voting and is now locked out' : null,
        },
      };

      // Create confirmation object
      const confirmation = {
        voterName: vote.voter.name,
        candidateName: vote.candidate.name,
        positionTitle: vote.position.title,
        electionTitle: vote.election.title,
        votedAt: vote.createdAt,
        voteId: vote.id,
        remainingVotes: voteLimit - updatedVoteCount,
        lockoutMessage: allPositionsCompleted ? 'Voter has completed all voting and is now locked out' : null,
      };

      // Emit real-time vote update
      this.votingGateway.emitVoteUpdate(electionId, {
        voteId: vote.id,
        voterId,
        candidateId,
        positionId,
        electionId,
        voteCount: updatedVoteCount,
        voteLimit,
        isFinalVoteForPosition,
        isLockedOut: allPositionsCompleted,
        confirmation
      });

      // Emit results update
      const updatedResults = await this.getVoteResults(electionId);
      this.votingGateway.emitResultsUpdate(electionId, updatedResults);

      return {
        message: `Vote cast successfully! (${updatedVoteCount}/${voteLimit} votes for this position)`,
        vote: {
          id: vote.id,
          voter: vote.voter,
          candidate: vote.candidate,
          election: vote.election,
          position: vote.position,
          createdAt: vote.createdAt,
        },
        voteCount: updatedVoteCount,
        voteLimit: voteLimit,
        isFinalVoteForPosition,
        isLockedOut: allPositionsCompleted,
        confirmation: {
          voterName: vote.voter.name,
          candidateName: vote.candidate.name,
          positionTitle: vote.position.title,
          electionTitle: vote.election.title,
          votedAt: vote.createdAt,
          voteId: vote.id,
          remainingVotes: voteLimit - updatedVoteCount,
          lockoutMessage: allPositionsCompleted ? 'Voter has completed all voting and is now locked out' : null,
        },
      };
    }, {
      // ACID Transaction Options
      maxWait: 5000, // Maximum time to wait for transaction
      timeout: 10000, // Transaction timeout
      isolationLevel: 'Serializable', // Highest isolation level for vote integrity
    });
  }

  async confirmVote(createVoteDto: CreateVoteDto) {
    const { voterId, candidateId, electionId, positionId } = createVoteDto;

    // Check if election exists and is active
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (!election.isActive) {
      throw new BadRequestException('Election is not active');
    }

    // Check if voter exists
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Check if voter is locked out (has completed voting)
    if (voter.hasVoted) {
      throw new ConflictException('Voter has already completed voting and cannot vote again');
    }

    // Check if candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if position exists and get vote limit
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    const voteLimit = position.voteLimit || 1;

    // Get current vote count for this voter in this election and position
    const currentVoteCount = await this.prisma.vote.count({
      where: {
        voterId,
        electionId,
        positionId,
      },
    });

    // Check if voter has reached the vote limit for this position
    if (currentVoteCount >= voteLimit) {
      throw new ConflictException(`Voter has already cast ${voteLimit} vote(s) for this position`);
    }

    // Check for candidate duplication
    const existingVoteForCandidate = await this.prisma.vote.findFirst({
      where: {
        voterId,
        electionId,
        positionId,
        candidateId,
      },
    });

    if (existingVoteForCandidate) {
      throw new ConflictException('Voter has already voted for this candidate in this position');
    }

    // Get all positions in this election to check overall voting status
    const electionPositions = await this.prisma.electionPosition.findMany({
      where: { electionId },
    });

    // Check voting progress across all positions
    let totalPositions = 0;
    let completedPositions = 0;
    let totalVotesCast = 0;

    for (const electionPosition of electionPositions) {
      const positionVoteCount = await this.prisma.vote.count({
        where: {
          voterId,
          electionId,
          positionId: electionPosition.positionId,
        },
      });

      const position = await this.prisma.position.findUnique({
        where: { id: electionPosition.positionId },
      });

      const positionVoteLimit = position?.voteLimit || 1;
      totalPositions++;
      totalVotesCast += positionVoteCount;

      if (positionVoteCount >= positionVoteLimit) {
        completedPositions++;
      }
    }

    const willBeFinalVoteForPosition = currentVoteCount + 1 >= voteLimit;
    const willCompleteAllVoting = completedPositions === totalPositions - 1 && willBeFinalVoteForPosition;

    // Return confirmation details without casting the vote
    return {
      canVote: true,
      confirmation: {
        voterName: voter.name,
        candidateName: candidate.name,
        positionTitle: position.title,
        electionTitle: election.title,
        currentVoteCount,
        voteLimit,
        remainingVotes: voteLimit - currentVoteCount,
        willBeFinalVoteForPosition,
        willCompleteAllVoting,
        votingProgress: {
          totalPositions,
          completedPositions,
          totalVotesCast,
          remainingPositions: totalPositions - completedPositions,
        },
      },
      validation: {
        electionActive: election.isActive,
        voterExists: true,
        candidateExists: true,
        positionExists: true,
        withinVoteLimit: currentVoteCount < voteLimit,
        noDuplicateVote: !existingVoteForCandidate,
        notLockedOut: !voter.hasVoted,
      },
      lockoutWarning: willCompleteAllVoting ? 'This vote will complete your voting for all positions. You will be locked out after this vote.' : null,
    };
  }

  async deleteVote(id: string) {
    const vote = await this.prisma.vote.findUnique({
      where: { id },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    // BEGIN TRANSACTION - ACID Atomicity
    return await this.prisma.$transaction(async (prisma) => {
      // Delete the vote
      await prisma.vote.delete({
      where: { id },
    });

    // Reset voter's hasVoted status
      await prisma.voter.update({
      where: { id: vote.voterId },
      data: { hasVoted: false },
    });

    return {
      message: 'Vote deleted successfully!',
    };
    }, {
      // ACID Transaction Options
      maxWait: 5000,
      timeout: 10000,
      isolationLevel: 'Serializable',
    });
  }

  async getVotesByElection(electionId: string) {
    return this.prisma.vote.findMany({
      where: { electionId },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getVotesByVoter(voterId: string) {
    return this.prisma.vote.findMany({
      where: { voterId },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getVoteResults(electionId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { electionId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
            voteLimit: true,
          },
        },
      },
    });

    // Get election positions to include vote limits
    const electionPositions = await this.prisma.electionPosition.findMany({
      where: { electionId },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            voteLimit: true,
          },
        },
      },
    });

    // Group votes by position and candidate
    const results: any = {};
    
    votes.forEach(vote => {
      const positionId = vote.positionId;
      const candidateId = vote.candidateId;
      
      if (!results[positionId]) {
        results[positionId] = {
          position: {
            ...vote.position,
            voteLimit: vote.position.voteLimit || 1,
          },
          candidates: {},
          totalVotes: 0,
        };
      }
      
      if (!results[positionId].candidates[candidateId]) {
        results[positionId].candidates[candidateId] = {
          candidate: vote.candidate,
          votes: 0,
        };
      }
      
      results[positionId].candidates[candidateId].votes++;
      results[positionId].totalVotes++;
    });

    // Add positions that have no votes yet
    electionPositions.forEach(electionPosition => {
      const positionId = electionPosition.positionId;
      if (!results[positionId]) {
        results[positionId] = {
          position: {
            ...electionPosition.position,
            voteLimit: electionPosition.position.voteLimit || 1,
          },
          candidates: {},
          totalVotes: 0,
        };
      }
    });

    // Convert to array and sort candidates by vote count
    const resultsArray = Object.values(results).map((positionResult: any) => {
      const candidatesArray = Object.values(positionResult.candidates).sort((a: any, b: any) => b.votes - a.votes);
      return {
        ...positionResult,
        candidates: candidatesArray,
      };
    });

    return {
      electionId,
      results: resultsArray,
      summary: {
        totalPositions: resultsArray.length,
        totalVotes: resultsArray.reduce((sum: number, pos: any) => sum + pos.totalVotes, 0),
      },
    };
  }

  async getComprehensiveVoteAnalytics(electionId: string) {
    // Get all votes with full details
    const votes = await this.prisma.vote.findMany({
      where: { electionId },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
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
        },
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
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
        },
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
        position: {
          select: {
            id: true,
            title: true,
            description: true,
            voteLimit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get election details
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
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
                voteLimit: true,
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
                positionId: true,
              },
            },
          },
        },
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Calculate comprehensive statistics
    const totalVotes = votes.length;
    const uniqueVoters = new Set(votes.map(vote => vote.voterId)).size;
    const uniqueCandidates = new Set(votes.map(vote => vote.candidateId)).size;
    const uniquePositions = new Set(votes.map(vote => vote.positionId)).size;

    // Group votes by position
    const votesByPosition = {};
    votes.forEach(vote => {
      const positionId = vote.positionId;
      if (!votesByPosition[positionId]) {
        votesByPosition[positionId] = {
          position: vote.position,
          votes: [],
          candidateVotes: {},
          totalVotes: 0,
        };
      }
      votesByPosition[positionId].votes.push(vote);
      votesByPosition[positionId].totalVotes++;
      
      // Count votes per candidate
      const candidateId = vote.candidateId;
      if (!votesByPosition[positionId].candidateVotes[candidateId]) {
        votesByPosition[positionId].candidateVotes[candidateId] = {
          candidate: vote.candidate,
          voteCount: 0,
          voters: [],
        };
      }
      votesByPosition[positionId].candidateVotes[candidateId].voteCount++;
      votesByPosition[positionId].candidateVotes[candidateId].voters.push({
        id: vote.voter.id,
        name: vote.voter.name,
        studentId: vote.voter.studentId,
        votedAt: vote.createdAt,
      });
    });

    // Group votes by voter
    const votesByVoter = {};
    votes.forEach(vote => {
      const voterId = vote.voterId;
      if (!votesByVoter[voterId]) {
        votesByVoter[voterId] = {
          voter: vote.voter,
          votes: [],
          positionsVoted: new Set(),
        };
      }
      votesByVoter[voterId].votes.push({
        id: vote.id,
        candidate: vote.candidate,
        position: vote.position,
        election: vote.election,
        votedAt: vote.createdAt,
      });
      votesByVoter[voterId].positionsVoted.add(vote.positionId);
    });

    // Calculate voter participation
    const totalEligibleVoters = await this.prisma.voter.count();
    const participationRate = totalEligibleVoters > 0 ? (uniqueVoters / totalEligibleVoters) * 100 : 0;

    // Get vote timeline
    const voteTimeline = votes.map(vote => ({
      voteId: vote.id,
      voterName: vote.voter.name,
      candidateName: vote.candidate.name,
      positionTitle: vote.position.title,
      votedAt: vote.createdAt,
    })).sort((a, b) => new Date(a.votedAt).getTime() - new Date(b.votedAt).getTime());

    return {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
        createdBy: election.admin,
        positions: election.electionPositions.map(ep => ep.position),
        candidates: election.electionCandidates.map(ec => ec.candidate),
      },
      statistics: {
        totalVotes,
        uniqueVoters,
        uniqueCandidates,
        uniquePositions,
        totalEligibleVoters,
        participationRate: Math.round(participationRate * 100) / 100,
        averageVotesPerVoter: uniqueVoters > 0 ? Math.round((totalVotes / uniqueVoters) * 100) / 100 : 0,
      },
      detailedResults: {
        byPosition: Object.values(votesByPosition).map((positionData: any) => ({
          position: positionData.position,
          totalVotes: positionData.totalVotes,
          candidates: Object.values(positionData.candidateVotes).map((candidateData: any) => ({
            candidate: candidateData.candidate,
            voteCount: candidateData.voteCount,
            percentage: positionData.totalVotes > 0 ? Math.round((candidateData.voteCount / positionData.totalVotes) * 100 * 100) / 100 : 0,
            voters: candidateData.voters,
          })).sort((a: any, b: any) => b.voteCount - a.voteCount),
        })),
        byVoter: Object.values(votesByVoter).map((voterData: any) => ({
          voter: voterData.voter,
          totalVotes: voterData.votes.length,
          positionsVoted: Array.from(voterData.positionsVoted),
          votes: voterData.votes,
        })),
        byDepartment: await this.getDepartmentVotingResults(electionId),
      },
      timeline: {
        firstVote: voteTimeline.length > 0 ? voteTimeline[0] : null,
        lastVote: voteTimeline.length > 0 ? voteTimeline[voteTimeline.length - 1] : null,
        totalVoteSessions: uniqueVoters,
        voteTimeline,
      },
      audit: {
        voteRecords: votes.map(vote => ({
          voteId: vote.id,
          voter: {
            id: vote.voter.id,
            name: vote.voter.name,
            studentId: vote.voter.studentId,
            email: vote.voter.email,
            department: vote.voter.department,
            course: vote.voter.course,
          },
          candidate: {
            id: vote.candidate.id,
            name: vote.candidate.name,
            studentId: vote.candidate.studentId,
            email: vote.candidate.email,
            position: vote.candidate.position,
            department: vote.candidate.department,
            course: vote.candidate.course,
          },
          position: vote.position,
          election: vote.election,
          votedAt: vote.createdAt,
        })),
      },
    };
  }

  async getDepartmentVotingResults(electionId: string) {
    // Get all votes with department information
    const votes = await this.prisma.vote.findMany({
      where: { electionId },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            studentId: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            studentId: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        position: {
          select: {
            id: true,
            title: true,
            voteLimit: true,
          },
        },
      },
    });

    // Get all departments that have voters
    const departments = await this.prisma.department.findMany({
      include: {
        voters: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
      },
    });

    // Group votes by department
    const departmentResults = {};

    // Initialize department results
    departments.forEach(dept => {
      departmentResults[dept.id] = {
        department: {
          id: dept.id,
          name: dept.name,
        },
        totalVoters: dept.voters.length,
        totalVotes: 0,
        participationRate: 0,
        positions: {},
        candidates: {},
        voterDetails: [],
      };
    });

    // Process votes and group by department
    votes.forEach(vote => {
      const departmentId = vote.voter.department?.id || 'unknown';
      const departmentName = vote.voter.department?.name || 'Unknown Department';
      
      if (!departmentResults[departmentId]) {
        departmentResults[departmentId] = {
          department: {
            id: departmentId,
            name: departmentName,
          },
          totalVoters: 0,
          totalVotes: 0,
          participationRate: 0,
          positions: {},
          candidates: {},
          voterDetails: [],
        };
      }

      const deptResult = departmentResults[departmentId];
      deptResult.totalVotes++;

      // Track unique voters
      if (!deptResult.voterDetails.find(v => v.id === vote.voter.id)) {
        deptResult.voterDetails.push({
          id: vote.voter.id,
          name: vote.voter.name,
          studentId: vote.voter.studentId,
        });
      }

      // Group by position
      const positionId = vote.positionId;
      if (!deptResult.positions[positionId]) {
        deptResult.positions[positionId] = {
          position: vote.position,
          totalVotes: 0,
          candidates: {},
        };
      }
      deptResult.positions[positionId].totalVotes++;

      // Group by candidate
      const candidateId = vote.candidateId;
      if (!deptResult.candidates[candidateId]) {
        deptResult.candidates[candidateId] = {
          candidate: vote.candidate,
          totalVotes: 0,
          voters: [],
        };
      }
      deptResult.candidates[candidateId].totalVotes++;
      deptResult.candidates[candidateId].voters.push({
        id: vote.voter.id,
        name: vote.voter.name,
        studentId: vote.voter.studentId,
      });

      // Group candidates by position
      if (!deptResult.positions[positionId].candidates[candidateId]) {
        deptResult.positions[positionId].candidates[candidateId] = {
          candidate: vote.candidate,
          votes: 0,
        };
      }
      deptResult.positions[positionId].candidates[candidateId].votes++;
    });

    // Calculate participation rates and format results
    const formattedResults = Object.values(departmentResults).map((deptResult: any) => {
      const uniqueVoters = deptResult.voterDetails.length;
      const participationRate = deptResult.totalVoters > 0 ? (uniqueVoters / deptResult.totalVoters) * 100 : 0;

      // Format positions
      const formattedPositions = Object.values(deptResult.positions).map((positionData: any) => ({
        position: positionData.position,
        totalVotes: positionData.totalVotes,
        candidates: Object.values(positionData.candidates).map((candidateData: any) => ({
          candidate: candidateData.candidate,
          votes: candidateData.votes,
          percentage: positionData.totalVotes > 0 ? Math.round((candidateData.votes / positionData.totalVotes) * 100 * 100) / 100 : 0,
        })).sort((a: any, b: any) => b.votes - a.votes),
      }));

      // Format candidates
      const formattedCandidates = Object.values(deptResult.candidates).map((candidateData: any) => ({
        candidate: candidateData.candidate,
        totalVotes: candidateData.totalVotes,
        voters: candidateData.voters,
      })).sort((a: any, b: any) => b.totalVotes - a.totalVotes);

      return {
        department: deptResult.department,
        statistics: {
          totalVoters: deptResult.totalVoters,
          uniqueVoters,
          totalVotes: deptResult.totalVotes,
          participationRate: Math.round(participationRate * 100) / 100,
          averageVotesPerVoter: uniqueVoters > 0 ? Math.round((deptResult.totalVotes / uniqueVoters) * 100) / 100 : 0,
        },
        positions: formattedPositions,
        candidates: formattedCandidates,
        voterDetails: deptResult.voterDetails,
      };
    });

    return formattedResults.sort((a: any, b: any) => b.statistics.totalVotes - a.statistics.totalVotes);
  }

  async getVoterVotingStatus(voterId: string, electionId: string) {
    // Check if voter exists
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    // Check if election exists
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Get all positions in this election
    const electionPositions = await this.prisma.electionPosition.findMany({
      where: { electionId },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            voteLimit: true,
          },
        },
      },
    });

    // Check voting progress for each position
    const votingStatus = [];
    let totalVotesCast = 0;
    let completedPositions = 0;

    for (const electionPosition of electionPositions) {
      const positionVoteCount = await this.prisma.vote.count({
        where: {
          voterId,
          electionId,
          positionId: electionPosition.positionId,
        },
      });

      const position = electionPosition.position;
      const voteLimit = position.voteLimit || 1;
      const isCompleted = positionVoteCount >= voteLimit;
      const remainingVotes = Math.max(0, voteLimit - positionVoteCount);

      if (isCompleted) {
        completedPositions++;
      }

      totalVotesCast += positionVoteCount;

      votingStatus.push({
        positionId: position.id,
        positionTitle: position.title,
        voteLimit,
        votesCast: positionVoteCount,
        remainingVotes,
        isCompleted,
        progress: `${positionVoteCount}/${voteLimit}`,
      });
    }

    const totalPositions = electionPositions.length;
    const allPositionsCompleted = completedPositions === totalPositions;
    const isLockedOut = voter.hasVoted || allPositionsCompleted;

    return {
      voter: {
        id: voter.id,
        name: voter.name,
        studentId: voter.studentId,
        hasVoted: voter.hasVoted,
      },
      election: {
        id: election.id,
        title: election.title,
        isActive: election.isActive,
      },
      votingStatus: {
        totalPositions,
        completedPositions,
        remainingPositions: totalPositions - completedPositions,
        totalVotesCast,
        allPositionsCompleted,
        isLockedOut,
        lockoutReason: voter.hasVoted ? 'Voter manually marked as voted' : allPositionsCompleted ? 'All positions completed' : null,
      },
      positions: votingStatus,
      canVote: !isLockedOut && election.isActive,
      lockoutMessage: isLockedOut ? 'Voter has completed all voting and is locked out' : null,
    };
  }

  async getRealTimeStats() {
    try {
      // Get all votes for active elections
      const activeVotes = await this.prisma.vote.findMany({
        where: {
          election: {
            status: 'active'
          }
        },
        select: {
          id: true,
          voterId: true,
          candidateId: true,
          electionId: true
        }
      });

      // Get total voters count
      const totalVoters = await this.prisma.voter.count();

      // Calculate real-time statistics
      const totalVotes = activeVotes.length;
      const uniqueVoters = new Set(activeVotes.map(vote => vote.voterId)).size;
      const candidatesWithVotes = new Set(activeVotes.map(vote => vote.candidateId)).size;

      // Get positions count for active elections
      const totalPositions = await this.prisma.electionPosition.count({
        where: {
          election: {
            status: 'active'
          }
        }
      });

      // Calculate voter turnout
      const votersWhoVoted = uniqueVoters;
      const voterTurnout = totalVoters > 0 ? Math.round((votersWhoVoted / totalVoters) * 100) : 0;

      return {
        totalVotes,
        uniqueVoters: votersWhoVoted,
        candidatesWithVotes,
        totalPositions,
        votersWhoVoted,
        totalVoters,
        voterTurnout
      };
    } catch (error) {
      console.error('Error getting real-time stats:', error);
      throw new Error('Failed to get real-time statistics');
    }
  }

  async getVoteTimeline() {
    try {
      // Get votes from the last 24 hours for active elections
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const timelineData = await this.prisma.$queryRaw`
        SELECT 
          TO_CHAR(v.created_at, 'HH24:00') as hour,
          COUNT(*) as voteCount
        FROM votes v
        INNER JOIN elections e ON v.election_id = e.id
        WHERE e.status = 'active'
        AND v.created_at >= ${twentyFourHoursAgo}
        GROUP BY TO_CHAR(v.created_at, 'HH24:00')
        ORDER BY hour
      `;

      return timelineData;
    } catch (error) {
      console.error('Error getting vote timeline:', error);
      throw new Error('Failed to get vote timeline');
    }
  }

  async getActiveElectionResults() {
    try {
      // Get results for currently active elections only
      const activeElectionResults = await this.prisma.vote.groupBy({
        by: ['electionId', 'positionId', 'candidateId'],
        where: {
          election: {
            status: 'active'
          }
        },
        _count: {
          id: true
        }
      });

      // Get position and candidate details
      const results = [];
      for (const result of activeElectionResults) {
        const position = await this.prisma.position.findUnique({
          where: { id: result.positionId },
          select: { title: true, voteLimit: true }
        });

        const candidate = await this.prisma.candidate.findUnique({
          where: { id: result.candidateId },
          select: { name: true, photo: true }
        });

        if (position && candidate) {
          results.push({
            positionId: result.positionId,
            positionName: position.title,
            voteLimit: position.voteLimit,
            candidateId: result.candidateId,
            candidateName: candidate.name,
            photoUrl: candidate.photo,
            voteCount: result._count.id
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting active election results:', error);
      throw new Error('Failed to get active election results');
    }
  }

  async resetVoterStatus(voterId: string) {
    try {
      // Check if voter exists
      const voter = await this.prisma.voter.findUnique({
        where: { id: voterId }
      });

      if (!voter) {
        throw new NotFoundException('Voter not found');
      }

      // Reset voter's hasVoted status
      await this.prisma.voter.update({
        where: { id: voterId },
        data: { hasVoted: false }
      });

      return {
        message: 'Voter status reset successfully',
        voter: {
          id: voter.id,
          name: voter.name,
          studentId: voter.studentId,
          hasVoted: false
        }
      };
    } catch (error) {
      console.error('Error resetting voter status:', error);
      throw new Error('Failed to reset voter status');
    }
  }
} 