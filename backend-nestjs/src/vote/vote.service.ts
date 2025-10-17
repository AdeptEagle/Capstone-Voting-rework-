import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuditService } from '../services/audit.service';
import { IdGeneratorService } from '../utils/id-generator.service';
import { VotingGateway } from '../websocket/voting.gateway';

@Injectable()
export class VoteService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private idGenerator: IdGeneratorService,
    private votingGateway: VotingGateway,
  ) {}

  async getVoteById(id: string) {
    const vote = await this.prisma.vote.findUnique({
      where: { id },
      include: {
        voter: {
          select: {
            id: true,
            Voter_Name: true,
            Voter_Email: true,
            Voter_StudentId: true,
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
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            Candidate_Name: true,
            Candidate_StudentId: true,
            Candidate_Email: true,
            photo: true,
            position: {
              select: {
                id: true,
                Position_Title: true,
                displayOrder: true,
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
              },
            },
            partyList: {
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
            Position_Title: true,
            displayOrder: true,
            voteLimit: true,
          },
        },
        ballot: {
          select: {
            id: true,
            Ballot_Title: true,
            Ballot_Description: true,
            Ballot_Status: true,
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
    const { voterId, candidateId, ballotId, positionId } = createVoteDto;

    // Validate ballot exists and is active
    const ballot = await this.prisma.ballot.findUnique({
      where: { id: ballotId },
    });

    if (!ballot) {
      throw new NotFoundException('Ballot not found');
    }

    if (ballot.Ballot_Status !== 'ACTIVE') {
      throw new BadRequestException('Ballot is not active');
    }

    // Validate voter exists
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    if (voter.hasVoted) {
      throw new BadRequestException('Voter has already voted');
    }

    // Validate candidate exists and is in the ballot
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        ballotCandidates: {
          where: { BallotCandidate_BallotId: ballotId },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.ballotCandidates.length === 0) {
      throw new BadRequestException('Candidate is not in this ballot');
    }

    // Validate position exists and is in the ballot
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      include: {
        ballotPositions: {
          where: { BallotPosition_BallotId: ballotId },
        },
      },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    if (position.ballotPositions.length === 0) {
      throw new BadRequestException('Position is not in this ballot');
    }

    // Check if voter has already voted for this position in this ballot
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        voterId,
        ballotId,
        positionId,
      },
    });

    if (existingVote) {
      throw new BadRequestException('Voter has already voted for this position');
    }

    // Check vote limit for position
    const currentVoteCount = await this.prisma.vote.count({
      where: {
        ballotId,
        positionId,
      },
    });

    if (position.voteLimit && currentVoteCount >= position.voteLimit) {
      throw new BadRequestException('Vote limit reached for this position');
    }

    // Generate vote ID and verification code
    const customId = await this.idGenerator.generateVoteId();
    const verificationCode = this.auditService.generateVerificationCode();
    const auditHash = this.auditService.generateAuditHash({
      voterId,
      ballotId,
      candidateId,
      timestamp: new Date(),
    });

    // Create vote in transaction
    return await this.prisma.$transaction(async (prisma) => {
      const vote = await prisma.vote.create({
        data: {
          id: customId,
          voterId,
          candidateId,
          ballotId,
          positionId,
          ipAddress: createVoteDto.ipAddress,
          userAgent: createVoteDto.userAgent,
          sessionId: createVoteDto.sessionId,
          verificationCode,
          auditHash,
        },
        include: {
          voter: true,
          candidate: true,
          position: true,
          ballot: true,
        },
      });

      // Update voter status
      await prisma.voter.update({
        where: { id: voterId },
        data: { hasVoted: true },
      });

      // TODO: Add audit logging

      return vote;
    });
  }

  async getVotesByBallot(ballotId: string) {
    return await this.prisma.vote.findMany({
      where: { ballotId },
      include: {
        voter: {
          select: {
            id: true,
            Voter_Name: true,
            Voter_Email: true,
            Voter_StudentId: true,
            department: {
              select: {
                Department_Name: true,
              },
            },
            course: {
              select: {
                Course_Name: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            Candidate_Name: true,
            Candidate_StudentId: true,
            photo: true,
            position: {
              select: {
                Position_Title: true,
                displayOrder: true,
              },
            },
            partyList: {
              select: {
                name: true,
              },
            },
          },
        },
        position: {
          select: {
            id: true,
            Position_Title: true,
            displayOrder: true,
          },
        },
      },
      orderBy: [
        { position: { displayOrder: 'asc' } },
        { createdAt: 'desc' },
      ],
    });
  }

  async getVotesByVoter(voterId: string) {
    return await this.prisma.vote.findMany({
      where: { voterId },
      include: {
        candidate: {
          select: {
            id: true,
            Candidate_Name: true,
            photo: true,
            position: {
              select: {
                Position_Title: true,
                displayOrder: true,
              },
            },
            partyList: {
              select: {
                name: true,
              },
            },
          },
        },
        position: {
          select: {
            id: true,
            Position_Title: true,
            displayOrder: true,
          },
        },
        ballot: {
          select: {
            id: true,
            Ballot_Title: true,
            Ballot_Status: true,
          },
        },
      },
      orderBy: [
        { position: { displayOrder: 'asc' } },
        { createdAt: 'desc' },
      ],
    });
  }

  async getVoteResults(ballotId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { ballotId },
      include: {
        candidate: {
          select: {
            id: true,
            Candidate_Name: true,
            photo: true,
            position: {
              select: {
                id: true,
                Position_Title: true,
                displayOrder: true,
              },
            },
            partyList: {
              select: {
                name: true,
              },
            },
          },
        },
        position: {
          select: {
            id: true,
            Position_Title: true,
            displayOrder: true,
          },
        },
      },
    });

    // Group votes by position and candidate
    const results = {};
    votes.forEach(vote => {
      const positionId = vote.position.id;
      const candidateId = vote.candidate.id;
      
      if (!results[positionId]) {
        results[positionId] = {
          position: vote.position,
          candidates: {},
        };
      }
      
      if (!results[positionId].candidates[candidateId]) {
        results[positionId].candidates[candidateId] = {
          candidate: vote.candidate,
          voteCount: 0,
        };
      }
      
      results[positionId].candidates[candidateId].voteCount++;
    });

    // Convert to array format and sort
    const formattedResults = Object.values(results).map(positionResult => ({
      position: 'Position Title', // TODO: Add position relation
      candidates: [], // TODO: Add candidates relation
    }));

    return formattedResults; // TODO: Add proper sorting
  }

  async getComprehensiveVoteAnalytics(ballotId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { ballotId },
      include: {
        voter: {
          select: {
            department: {
              select: {
                Department_Name: true,
              },
            },
            course: {
              select: {
                Course_Name: true,
              },
            },
          },
        },
        candidate: {
          select: {
            position: {
              select: {
                Position_Title: true,
                displayOrder: true,
              },
            },
            partyList: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate analytics
    const totalVotes = votes.length;
    const uniqueVoters = new Set(votes.map(v => v.voterId)).size;
    
    // Department breakdown
    const departmentVotes = {};
    votes.forEach(vote => {
      const deptName = vote.voter.department?.Department_Name || 'Unknown';
      if (!departmentVotes[deptName]) {
        departmentVotes[deptName] = 0;
      }
      departmentVotes[deptName]++;
    });

    // Position breakdown
    const positionVotes = {};
    votes.forEach(vote => {
      const positionTitle = vote.candidate.position.Position_Title;
      if (!positionVotes[positionTitle]) {
        positionVotes[positionTitle] = 0;
      }
      positionVotes[positionTitle]++;
    });

    // Party list breakdown
    const partyVotes = {};
    votes.forEach(vote => {
      const partyName = vote.candidate.partyList?.name || 'Independent';
      if (!partyVotes[partyName]) {
        partyVotes[partyName] = 0;
      }
      partyVotes[partyName]++;
    });

    return {
      totalVotes,
      uniqueVoters,
      departmentBreakdown: departmentVotes,
      positionBreakdown: positionVotes,
      partyBreakdown: partyVotes,
      timestamp: new Date(),
    };
  }

  async getDepartmentVotingResults(ballotId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { ballotId },
      include: {
        voter: {
          select: {
            department: {
              select: {
                Department_Name: true,
              },
            },
          },
        },
        candidate: {
          select: {
            Candidate_Name: true,
            position: {
              select: {
                Position_Title: true,
                displayOrder: true,
              },
            },
          },
        },
      },
    });

    // Group by department
    const departmentResults = {};
    votes.forEach(vote => {
      const deptName = vote.voter.department?.Department_Name || 'Unknown';
      if (!departmentResults[deptName]) {
        departmentResults[deptName] = {
          department: deptName,
          votes: [],
          totalVotes: 0,
        };
      }
      
      departmentResults[deptName].votes.push({
        candidate: vote.candidate.Candidate_Name,
        position: vote.candidate.position.Position_Title,
        positionOrder: vote.candidate.position.displayOrder,
      });
      departmentResults[deptName].totalVotes++;
    });

    return Object.values(departmentResults);
  }

  async deleteVote(id: string) {
    const vote = await this.prisma.vote.findUnique({
      where: { id },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    return await this.prisma.vote.delete({
      where: { id },
    });
  }

  async resetVoterStatus(voterId: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId }
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    return await this.prisma.voter.update({
      where: { id: voterId },
      data: {
        hasVoted: false,
      },
    });
  }

  async getVoterVotingStatus(voterId: string, ballotId: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    const ballot = await this.prisma.ballot.findUnique({
      where: { id: ballotId },
    });

    if (!ballot) {
      throw new NotFoundException('Ballot not found');
    }

    // Get voter's votes for this ballot
    const votes = await this.prisma.vote.findMany({
      where: {
        voterId,
        ballotId,
      },
      include: {
        position: {
          select: {
            id: true,
            Position_Title: true,
            displayOrder: true,
          },
        },
        candidate: {
          select: {
            id: true,
            Candidate_Name: true,
            photo: true,
            partyList: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get all positions in this ballot
    const ballotPositions = await this.prisma.ballotPosition.findMany({
      where: { BallotPosition_BallotId: ballotId },
      include: {
        position: {
          select: {
            id: true,
            Position_Title: true,
            displayOrder: true,
          },
        },
      },
    });

    const votedPositions = votes.map(v => v.position.id);
    const availablePositions = ballotPositions
      .filter(bp => !votedPositions.includes(bp.position.id))
      .map(bp => bp.position);

    return {
      voter: {
        id: voter.id,
        name: voter.Voter_Name,
        email: voter.Voter_Email,
        studentId: voter.Voter_StudentId,
        hasVoted: voter.hasVoted,
      },
      ballot: {
        id: ballot.id,
        title: ballot.Ballot_Title,
        status: ballot.Ballot_Status,
      },
      votes,
      availablePositions,
      canVote: ballot.Ballot_Status === 'ACTIVE' && !voter.hasVoted,
    };
  }

  async getRealTimeStats() {
    try {
      const activeVotes = await this.prisma.vote.findMany({
        select: {
          id: true,
          voterId: true,
          candidateId: true,
        }
      });

      const totalVoters = await this.prisma.voter.count();
      const totalVotes = activeVotes.length;
      const uniqueVoters = new Set(activeVotes.map(vote => vote.voterId)).size;
      const candidatesWithVotes = new Set(activeVotes.map(vote => vote.candidateId)).size;
      const totalPositions = await this.prisma.position.count();

      const votersWhoVoted = uniqueVoters;
      const voterTurnout = totalVoters > 0 ? Math.round((votersWhoVoted / totalVoters) * 100) : 0;

      return {
        totalVotes,
        totalVoters,
        votersWhoVoted,
        voterTurnout,
        candidatesWithVotes,
        totalPositions,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get real-time stats: ${error.message}`);
    }
  }

  async getVoteTimeline() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const votes = await this.prisma.vote.findMany({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        },
        select: {
          createdAt: true
        }
      });

      const timelineData = [];
      const hourMap = new Map();

      votes.forEach(vote => {
        const hour = vote.createdAt.getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        
        if (hourMap.has(hourKey)) {
          hourMap.set(hourKey, hourMap.get(hourKey) + 1);
        } else {
          hourMap.set(hourKey, 1);
        }
      });

      for (const [hour, voteCount] of hourMap) {
        timelineData.push({
          hour,
          voteCount,
        });
      }

      return timelineData.sort((a, b) => a.hour.localeCompare(b.hour));
    } catch (error) {
      throw new Error('Failed to get vote timeline');
    }
  }

  async getActiveBallotResults() {
    try {
      const activeBallotResults = await this.prisma.vote.groupBy({
        by: ['positionId', 'candidateId'],
        _count: {
          id: true
        }
      });

      const results = [];

      for (const result of activeBallotResults) {
        const position = await this.prisma.position.findUnique({
          where: { id: result.positionId },
          select: { Position_Title: true, voteLimit: true }
        });

        const candidate = await this.prisma.candidate.findUnique({
          where: { id: result.candidateId },
          select: { Candidate_Name: true, photo: true }
        });

        if (position && candidate) {
          results.push({
            positionId: result.positionId,
            positionName: position.Position_Title,
            voteLimit: position.voteLimit,
            candidateId: result.candidateId,
            candidateName: candidate.Candidate_Name,
            photoUrl: candidate.photo,
            voteCount: result._count.id
          });
        }
      }

      if (results.length > 0) {
        this.votingGateway.emitResultsUpdate('ballot', results);
      }

      return results;
    } catch (error) {
      console.error('Error getting active ballot results:', error);
      throw new Error('Failed to get active ballot results');
    }
  }
}