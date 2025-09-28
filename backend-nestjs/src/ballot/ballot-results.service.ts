import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BallotResultsService {
  constructor(private prisma: PrismaService) {}

  async getBallotsWithResults(userId?: string) {
    const ballots = await this.prisma.ballot.findMany({
      where: {
        Ballot_IsDeleted: false,
        Ballot_ShowResults: true,
        OR: [
          { Ballot_Status: 'ACTIVE' },
          { Ballot_Status: 'ENDED' },
          { Ballot_Status: 'PAUSED' },
        ],
      },
      include: {
        results: {
          include: {
            resultDetails: {
              include: {
                candidate: true,
                position: true,
              },
            },
          },
        },
        ballotPositions: {
          include: {
            position: true,
          },
        },
        _count: {
          select: {
            votes: true,
            userHistory: true,
          },
        },
      },
      orderBy: {
        Ballot_StartDate: 'desc',
      },
    });

    // If userId is provided, add user participation info
    if (userId) {
      const userHistory = await this.prisma.userBallotHistory.findMany({
        where: {
          UserBallotHistory_UserId: userId,
        },
        include: {
          ballot: true,
        },
      });

      const userHistoryMap = new Map(
        userHistory.map(history => [history.UserBallotHistory_BallotId, history])
      );

      return ballots.map(ballot => ({
        ...ballot,
        userVoted: userHistoryMap.has(ballot.id),
        userVoteCount: userHistoryMap.get(ballot.id)?.UserBallotHistory_VoteCount || 0,
        userLastAccessed: userHistoryMap.get(ballot.id)?.UserBallotHistory_LastAccessed,
      }));
    }

    return ballots;
  }

  async getBallotResults(ballotId: string) {
    const ballot = await this.prisma.ballot.findUnique({
      where: {
        id: ballotId,
        Ballot_IsDeleted: false,
      },
      include: {
        results: {
          include: {
            resultDetails: {
              include: {
                candidate: {
                  include: {
                    position: true,
                    department: true,
                    course: true,
                  },
                },
                position: true,
              },
              orderBy: [
                { BallotResultDetails_PositionId: 'asc' },
                { BallotResultDetails_Rank: 'asc' },
              ],
            },
          },
        },
        ballotPositions: {
          include: {
            position: true,
          },
          orderBy: {
            BallotPosition_DisplayOrder: 'asc',
          },
        },
        ballotCandidates: {
          include: {
            candidate: {
              include: {
                position: true,
                department: true,
                course: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            userHistory: true,
          },
        },
      },
    });

    if (!ballot) {
      throw new NotFoundException('Ballot not found');
    }

    // Check if results should be shown
    if (!ballot.Ballot_ShowResults) {
      throw new NotFoundException('Results are not available for this ballot');
    }

    // Check if results should be shown after a specific date
    if (ballot.Ballot_ShowResultsAfter && new Date() < ballot.Ballot_ShowResultsAfter) {
      throw new NotFoundException('Results will be available after the specified date');
    }

    // If results don't exist, have 0 votes, or actual vote count differs from stored results, calculate them
    const actualVoteCount = ballot._count.votes;
    const storedVoteCount = ballot.results?.BallotResults_TotalVotes || 0;
    
    if (!ballot.results || ballot.results.BallotResults_TotalVotes === 0 || actualVoteCount !== storedVoteCount) {
      console.log(`Recalculating results for ballot ${ballotId}:`);
      console.log(`  Actual votes: ${actualVoteCount}`);
      console.log(`  Stored votes: ${storedVoteCount}`);
      console.log(`  Results exist: ${!!ballot.results}`);
      
      try {
        await this.calculateBallotResults(ballotId);
        console.log('Results calculation completed for ballot:', ballotId);
      } catch (error) {
        console.error('Error calculating results for ballot:', ballotId, error);
        throw error;
      }
      
      // Fetch the ballot again with the newly calculated results
      return this.prisma.ballot.findUnique({
        where: { id: ballotId },
        include: {
          results: {
            include: {
              resultDetails: {
                include: {
                  candidate: {
                    include: {
                      position: true,
                      department: true,
                      course: true,
                    },
                  },
                  position: true,
                },
                orderBy: [
                  { BallotResultDetails_PositionId: 'asc' },
                  { BallotResultDetails_Rank: 'asc' },
                ],
              },
            },
          },
          ballotPositions: {
            include: {
              position: true,
            },
            orderBy: {
              BallotPosition_DisplayOrder: 'asc',
            },
          },
          ballotCandidates: {
            include: {
              candidate: true,
            },
          },
          _count: {
            select: {
              votes: true,
              userHistory: true,
            },
          },
        },
      });
    }

    return ballot;
  }

  async getLiveBallotResults(ballotId: string) {
    const ballot = await this.prisma.ballot.findUnique({
      where: {
        id: ballotId,
        Ballot_IsDeleted: false,
        Ballot_Status: 'ACTIVE',
        Ballot_ShowLiveResults: true,
      },
    });

    if (!ballot) {
      throw new NotFoundException('Live results not available for this ballot');
    }

    return this.getBallotResults(ballotId);
  }

  async refreshBallotResults(ballotId: string) {
    const ballot = await this.prisma.ballot.findUnique({
      where: {
        id: ballotId,
        Ballot_IsDeleted: false,
      },
      include: {
        votes: {
          include: {
            candidate: true,
            position: true,
          },
        },
        ballotPositions: {
          include: {
            position: true,
          },
        },
        ballotCandidates: {
          include: {
            candidate: true,
          },
        },
      },
    });

    if (!ballot) {
      throw new NotFoundException('Ballot not found');
    }

    return this.calculateBallotResults(ballotId);
  }

  async calculateBallotResults(ballotId: string) {
    console.log('🔍 Starting ballot results calculation for:', ballotId);
    
    const ballot = await this.prisma.ballot.findUnique({
      where: { id: ballotId },
      include: {
        votes: {
          include: {
            candidate: true,
            position: true,
          },
        },
        ballotPositions: {
          include: {
            position: true,
          },
        },
        ballotCandidates: {
          include: {
            candidate: true,
          },
        },
        _count: {
          select: {
            userHistory: true,
          },
        },
      },
    });

    if (!ballot) {
      throw new NotFoundException('Ballot not found');
    }
    
    console.log(`📊 Found ${ballot.votes.length} votes for ballot ${ballotId}`);
    console.log(`📊 Found ${ballot.ballotPositions.length} positions for ballot ${ballotId}`);
    console.log(`📊 Found ${ballot.ballotCandidates.length} candidates for ballot ${ballotId}`);

    // Calculate total votes and voters
    const totalVotes = ballot.votes.length;
    const uniqueVoters = new Set(ballot.votes.map(vote => vote.voterId)).size;
    const voterTurnout = ballot._count?.userHistory ? (uniqueVoters / ballot._count.userHistory) * 100 : 0;

    // Group votes by position and candidate
    const positionResults = new Map<string, Map<string, number>>();
    
    for (const vote of ballot.votes) {
      const positionId = vote.positionId;
      const candidateId = vote.candidateId;
      
      if (!positionResults.has(positionId)) {
        positionResults.set(positionId, new Map());
      }
      
      const candidateResults = positionResults.get(positionId)!;
      candidateResults.set(candidateId, (candidateResults.get(candidateId) || 0) + 1);
    }

    // Create result details
    const resultDetails: any[] = [];
    
    for (const [positionId, candidateVotes] of positionResults) {
      const positionVotes = Array.from(candidateVotes.values());
      const totalPositionVotes = positionVotes.reduce((sum: number, votes: number) => sum + votes, 0);
      
      // Sort candidates by vote count
      const sortedCandidates = Array.from(candidateVotes.entries())
        .map(([candidateId, voteCount]) => ({
          candidateId,
          voteCount,
          percentage: totalPositionVotes > 0 ? (voteCount / totalPositionVotes) * 100 : 0,
        }))
        .sort((a, b) => b.voteCount - a.voteCount);

      // Add rank
      sortedCandidates.forEach((candidate, index) => {
        resultDetails.push({
          BallotResultDetails_BallotId: ballotId,
          BallotResultDetails_PositionId: positionId,
          BallotResultDetails_CandidateId: candidate.candidateId,
          BallotResultDetails_VoteCount: candidate.voteCount,
          BallotResultDetails_Percentage: candidate.percentage,
          BallotResultDetails_Rank: index + 1,
          BallotResultDetails_LastUpdated: new Date(),
        });
      });
    }

    // Update or create ballot results
    const resultsId = this.generateId();
    
    return this.prisma.$transaction(async (tx) => {
      // Delete existing results
      await tx.ballotResultDetails.deleteMany({
        where: { BallotResultDetails_BallotId: ballotId },
      });
      
      await tx.ballotResults.deleteMany({
        where: { BallotResults_BallotId: ballotId },
      });

      // Create new results
      const ballotResults = await tx.ballotResults.create({
        data: {
          id: resultsId,
          BallotResults_BallotId: ballotId,
          BallotResults_TotalVotes: totalVotes,
          BallotResults_TotalVoters: uniqueVoters,
          BallotResults_VoterTurnout: voterTurnout,
          BallotResults_LastUpdated: new Date(),
          BallotResults_IsFinal: ballot.Ballot_Status === 'ENDED',
        },
      });

      // Create result details
      if (resultDetails.length > 0) {
        await tx.ballotResultDetails.createMany({
          data: resultDetails.map(detail => ({
            id: this.generateId(),
            ...detail,
          })),
        });
      }

      console.log('✅ Ballot results calculation completed successfully for:', ballotId);
      return ballotResults;
    });
  }

  private generateId(): string {
    const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${firstPart}-${secondPart}`;
  }
}
