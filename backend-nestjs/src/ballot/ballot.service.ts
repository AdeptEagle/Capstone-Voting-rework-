import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { UpdateBallotDto } from './dto/update-ballot.dto';
import { BallotStatus } from '@prisma/client';
// import { TimezoneUtil } from '../utils/timezone.util';

@Injectable()
export class BallotService {
  constructor(private prisma: PrismaService) {}

  async createBallot(createBallotDto: CreateBallotDto, createdBy: string) {
    try {
      console.log('🆕 Creating ballot with data:', createBallotDto);
      console.log('👤 Created by user ID:', createdBy);
      
      const {
        Ballot_Title,
        Ballot_Description,
        Ballot_StartDate,
        Ballot_EndDate,
        // Vote limits are managed per position, these are deprecated
        Ballot_RequireAllPositions,
        Ballot_ShowResults,
        Ballot_ShowResultsAfter,
        Ballot_ShowLiveResults,
        positionIds,
        candidateIds
      } = createBallotDto;

    // Validate dates with proper error handling
    console.log('🕐 Date validation input:');
    console.log('Raw Start Date:', Ballot_StartDate);
    console.log('Raw End Date:', Ballot_EndDate);
    
    const startDate = new Date(Ballot_StartDate);
    const endDate = new Date(Ballot_EndDate);
    const now = new Date();
    
    // Check if dates are valid
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException(`Invalid start date format: ${Ballot_StartDate}`);
    }
    if (isNaN(endDate.getTime())) {
      throw new BadRequestException(`Invalid end date format: ${Ballot_EndDate}`);
    }
    
    console.log('🕐 Date validation (Parsed):');
    console.log('Start date:', startDate.toISOString());
    console.log('End date:', endDate.toISOString());
    console.log('Current time:', now.toISOString());
    
    if (startDate >= endDate) {
      throw new BadRequestException(`Start date (${startDate.toISOString()}) must be before end date (${endDate.toISOString()})`);
    }

    // Allow start date to be up to 1 hour in the past to account for timezone differences
    const bufferTime = new Date(now.getTime() - (60 * 60 * 1000));
    if (startDate < bufferTime) {
      throw new BadRequestException(`Start date cannot be more than 1 hour in the past. Current time: ${now.toISOString()}, Start time: ${startDate.toISOString()}`);
    }

    // Validate positions
    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      throw new BadRequestException('At least one position must be selected');
    }

    // Validate candidates
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new BadRequestException('At least one candidate must be selected');
    }

    // Validate that selected candidates belong to selected positions
    const candidates = await this.prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, positionId: true }
    });

    const selectedPositionIds = new Set(positionIds);
    const candidatePositionIds = candidates.map(c => c.positionId);
    const validCandidates = candidatePositionIds.filter(posId => selectedPositionIds.has(posId));

    if (validCandidates.length === 0) {
      throw new BadRequestException('Selected candidates must belong to the selected positions');
    }

    // Validate that each selected position has at least one candidate
    const positionsWithCandidates = new Set(candidatePositionIds);
    const positionsWithoutCandidates = positionIds.filter(posId => !positionsWithCandidates.has(posId));

    if (positionsWithoutCandidates.length > 0) {
      throw new BadRequestException('Each selected position must have at least one candidate');
    }

    // Generate unique ID
    const id = this.generateId();

    return this.prisma.$transaction(async (tx) => {
      // Create ballot
      const ballot = await tx.ballot.create({
        data: {
          id,
          Ballot_Title,
          Ballot_Description,
          Ballot_StartDate: startDate,
          Ballot_EndDate: endDate,
          Ballot_Status: BallotStatus.DRAFT,
          Ballot_IsActive: false,
          Ballot_MaxVotesPerUser: 1, // Default, vote limits are per position
          Ballot_AllowMultipleVotes: false, // Default, managed per position
          Ballot_RequireAllPositions: Ballot_RequireAllPositions || true,
          Ballot_ShowResults: Ballot_ShowResults !== undefined ? Ballot_ShowResults : true,
          Ballot_ShowResultsAfter: Ballot_ShowResultsAfter ? new Date(Ballot_ShowResultsAfter) : null,
          Ballot_ShowLiveResults: Ballot_ShowLiveResults !== undefined ? Ballot_ShowLiveResults : true,
          Ballot_CreatedBy: createdBy,
        },
      });

      // Add positions to ballot
      if (positionIds && positionIds.length > 0) {
        await Promise.all(
          positionIds.map((positionId, index) =>
            tx.ballotPosition.create({
              data: {
                id: this.generateId(),
                BallotPosition_BallotId: ballot.id,
                BallotPosition_PositionId: positionId,
                BallotPosition_DisplayOrder: index,
                BallotPosition_IsRequired: true,
              },
            })
          )
        );
      }

      // Add candidates to ballot (after positions are created)
      if (candidateIds && candidateIds.length > 0) {
        for (const candidateId of candidateIds) {
          // Get the candidate's position ID first
          const candidate = await tx.candidate.findUnique({
            where: { id: candidateId },
            select: { positionId: true }
          });

          if (candidate) {
            await tx.ballotCandidate.create({
              data: {
                id: this.generateId(),
                BallotCandidate_BallotId: ballot.id,
                BallotCandidate_CandidateId: candidateId,
                BallotCandidate_PositionId: candidate.positionId,
                BallotCandidate_IsActive: true,
              },
            });
          }
        }
      }

      return ballot;
    });
    } catch (error) {
      console.error('❌ Error creating ballot:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      if (error instanceof BadRequestException) {
        throw error; // Re-throw validation errors as-is
      }
      
      throw new BadRequestException('Failed to create ballot: ' + (error.message || 'Unknown error'));
    }
  }

  async getBallots(filters?: {
    status?: BallotStatus;
    isActive?: boolean;
    createdBy?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.Ballot_Status = filters.status;
    }

    if (filters?.isActive !== undefined) {
      where.Ballot_IsActive = filters.isActive;
    }

    if (filters?.createdBy) {
      where.Ballot_CreatedBy = filters.createdBy;
    }

    return this.prisma.ballot.findMany({
      where: {
        ...where,
        Ballot_IsDeleted: false,
      },
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
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
        results: true,
        _count: {
          select: {
            votes: true,
            userHistory: true,
          },
        },
      },
      orderBy: {
        Ballot_CreatedAt: 'desc',
      },
    });
  }

  async getBallotById(id: string) {
    const ballot = await this.prisma.ballot.findUnique({
      where: { 
        id,
        Ballot_IsDeleted: false,
      },
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
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

    return ballot;
  }

  async updateBallot(id: string, updateBallotDto: UpdateBallotDto, updatedBy: string) {
    const ballot = await this.getBallotById(id);

    // Check if ballot can be updated
    if (ballot.Ballot_Status === BallotStatus.ACTIVE) {
      throw new ForbiddenException('Cannot update active ballot');
    }
    
    if (ballot.Ballot_Status === BallotStatus.ENDED) {
      throw new ForbiddenException('Cannot update ended ballot');
    }

    const updateData: any = {};

    if (updateBallotDto.Ballot_Title) {
      updateData.Ballot_Title = updateBallotDto.Ballot_Title;
    }

    if (updateBallotDto.Ballot_Description !== undefined) {
      updateData.Ballot_Description = updateBallotDto.Ballot_Description;
    }

    if (updateBallotDto.Ballot_StartDate) {
      updateData.Ballot_StartDate = new Date(updateBallotDto.Ballot_StartDate);
    }

    if (updateBallotDto.Ballot_EndDate) {
      updateData.Ballot_EndDate = new Date(updateBallotDto.Ballot_EndDate);
    }

    // Vote limits are managed per position, not per ballot
    // These fields are deprecated and not exposed in the UI

    if (updateBallotDto.Ballot_RequireAllPositions !== undefined) {
      updateData.Ballot_RequireAllPositions = updateBallotDto.Ballot_RequireAllPositions;
    }

    if (updateBallotDto.Ballot_ShowResults !== undefined) {
      updateData.Ballot_ShowResults = updateBallotDto.Ballot_ShowResults;
    }

    if (updateBallotDto.Ballot_ShowResultsAfter !== undefined) {
      updateData.Ballot_ShowResultsAfter = updateBallotDto.Ballot_ShowResultsAfter ? new Date(updateBallotDto.Ballot_ShowResultsAfter) : null;
    }

    if (updateBallotDto.Ballot_ShowLiveResults !== undefined) {
      updateData.Ballot_ShowLiveResults = updateBallotDto.Ballot_ShowLiveResults;
    }

    return this.prisma.ballot.update({
      where: { id },
      data: updateData,
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
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
        results: true,
        _count: {
          select: {
            votes: true,
            userHistory: true,
          },
        },
      },
    });
  }

  async deleteBallot(id: string, deletedBy: string) {
    const ballot = await this.getBallotById(id);

    // Check if ballot can be deleted
    if (ballot.Ballot_Status === BallotStatus.ACTIVE) {
      throw new ForbiddenException('Cannot delete active ballot');
    }
    
    if (ballot.Ballot_Status === BallotStatus.ENDED) {
      throw new ForbiddenException('Cannot delete ended ballot');
    }

    return this.prisma.ballot.update({
      where: { id },
      data: {
        Ballot_IsDeleted: true,
        Ballot_DeletedAt: new Date(),
      },
    });
  }

  async activateBallot(id: string, activatedBy: string) {
    const ballot = await this.getBallotById(id);

    if (ballot.Ballot_Status !== BallotStatus.DRAFT && ballot.Ballot_Status !== BallotStatus.SCHEDULED && ballot.Ballot_Status !== BallotStatus.PAUSED) {
      throw new BadRequestException('Only draft, scheduled, or paused ballots can be activated');
    }

    const now = new Date();
    if (new Date(ballot.Ballot_EndDate) <= now) {
      throw new BadRequestException('Cannot activate ballot with end date in the past');
    }

    // For paused ballots, preserve the original start date
    // For draft/scheduled ballots, set start date to now
    const updateData: any = {
      Ballot_Status: BallotStatus.ACTIVE,
      Ballot_IsActive: true,
    };

    if (ballot.Ballot_Status === BallotStatus.PAUSED) {
      // For paused ballots, don't change the start date
    } else {
      // For draft/scheduled ballots, set start date to now
      updateData.Ballot_StartDate = now;
    }

    return this.prisma.ballot.update({
      where: { id },
      data: updateData,
    });
  }

  async pauseBallot(id: string, pausedBy: string) {
    const ballot = await this.getBallotById(id);

    if (ballot.Ballot_Status !== BallotStatus.ACTIVE) {
      throw new BadRequestException('Only active ballots can be paused');
    }

    return this.prisma.ballot.update({
      where: { id },
      data: {
        Ballot_Status: BallotStatus.PAUSED,
        Ballot_IsActive: false,
      },
    });
  }

  async endBallot(id: string, endedBy: string) {
    const ballot = await this.getBallotById(id);

    if (ballot.Ballot_Status !== BallotStatus.ACTIVE && ballot.Ballot_Status !== BallotStatus.PAUSED) {
      throw new BadRequestException('Only active or paused ballots can be ended');
    }

    return this.prisma.ballot.update({
      where: { id },
      data: {
        Ballot_Status: BallotStatus.ENDED,
        Ballot_IsActive: false,
        Ballot_EndDate: new Date(), // Set end date to now
      },
    });
  }

  async getAvailableBallotsForUser(userId: string) {
    const now = new Date();

    return this.prisma.ballot.findMany({
      where: {
        Ballot_IsDeleted: false,
        Ballot_IsActive: true,
        Ballot_Status: BallotStatus.ACTIVE,
        Ballot_StartDate: { lte: now },
        Ballot_EndDate: { gte: now },
      },
      include: {
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
        userHistory: {
          where: {
            UserBallotHistory_UserId: userId,
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
        Ballot_StartDate: 'asc',
      },
    });
  }

  async getUserBallotHistory(userId: string) {
    return this.prisma.userBallotHistory.findMany({
      where: {
        UserBallotHistory_UserId: userId,
      },
      include: {
        ballot: {
          include: {
            ballotPositions: {
              include: {
                position: true,
              },
            },
            results: true,
          },
        },
      },
      orderBy: {
        UserBallotHistory_LastAccessed: 'desc',
      },
    });
  }

  async castBallotVote(voteData: any, userId: string) {
    try {
      console.log('🗳️ Casting ballot vote:', voteData);
      console.log('👤 User ID:', userId);

      const { ballotId, votes } = voteData;

      // Validate ballot exists and is active
      const ballot = await this.prisma.ballot.findUnique({
        where: { 
          id: ballotId,
          Ballot_IsDeleted: false 
        },
        include: {
          ballotPositions: {
            include: {
              position: true
            }
          },
          ballotCandidates: {
            include: {
              candidate: true
            }
          }
        }
      });

      if (!ballot) {
        throw new BadRequestException('Ballot not found');
      }

      if (!ballot.Ballot_IsActive || ballot.Ballot_Status !== 'ACTIVE') {
        throw new BadRequestException('Ballot is not active');
      }

      const now = new Date();
      if (now < ballot.Ballot_StartDate || now > ballot.Ballot_EndDate) {
        throw new BadRequestException('Ballot is not within voting period');
      }

      // Check if user has already voted
      const existingHistory = await this.prisma.userBallotHistory.findUnique({
        where: {
          UserBallotHistory_UserId_UserBallotHistory_BallotId: {
            UserBallotHistory_UserId: userId,
            UserBallotHistory_BallotId: ballotId
          }
        }
      });

      if (existingHistory && existingHistory.UserBallotHistory_IsCompleted) {
        throw new ConflictException('User has already completed voting for this ballot');
      }

      // Validate votes
      if (!votes || !Array.isArray(votes) || votes.length === 0) {
        throw new BadRequestException('No votes provided');
      }

      // Validate each vote
      for (const vote of votes) {
        const { positionId, candidateId } = vote;

        // Check if position is in this ballot
        const ballotPosition = ballot.ballotPositions.find(
          bp => bp.BallotPosition_PositionId === positionId
        );
        if (!ballotPosition) {
          throw new BadRequestException(`Position ${positionId} is not in this ballot`);
        }

        // Check if candidate is in this ballot for this position
        const ballotCandidate = ballot.ballotCandidates.find(
          bc => bc.BallotCandidate_CandidateId === candidateId && 
                bc.BallotCandidate_PositionId === positionId
        );
        if (!ballotCandidate) {
          throw new BadRequestException(`Candidate ${candidateId} is not valid for position ${positionId} in this ballot`);
        }
      }

      // Create votes using the existing Vote model with ballot context
      return await this.prisma.$transaction(async (tx) => {
        const createdVotes = [];
        
        for (const vote of votes) {
          const { positionId, candidateId } = vote;
          
          // Create vote record
          const voteRecord = await tx.vote.create({
            data: {
              id: this.generateId(),
              voterId: userId,
              candidateId: candidateId,
              electionId: 'ELEC-12', // Use a valid election ID for compatibility
              positionId: positionId,
              ballotId: ballotId, // Use ballotId to make votes unique per ballot
              ipAddress: voteData.ipAddress || null,
              userAgent: voteData.userAgent || null,
              sessionId: voteData.sessionId || null,
            },
            include: {
              voter: {
                select: {
                  id: true,
                  Voter_Name: true,
                  Voter_StudentId: true,
                }
              },
              candidate: {
                select: {
                  id: true,
                  Candidate_Name: true,
                  Candidate_StudentId: true,
                }
              },
              position: {
                select: {
                  id: true,
                  Position_Title: true,
                }
              }
            }
          });
          
          createdVotes.push(voteRecord);
        }

        // Update or create user ballot history
        const totalVotes = createdVotes.length;
        await tx.userBallotHistory.upsert({
          where: {
            UserBallotHistory_UserId_UserBallotHistory_BallotId: {
              UserBallotHistory_UserId: userId,
              UserBallotHistory_BallotId: ballotId
            }
          },
          update: {
            UserBallotHistory_VotedAt: new Date(),
            UserBallotHistory_VoteCount: totalVotes,
            UserBallotHistory_IsCompleted: true,
            UserBallotHistory_LastAccessed: new Date(),
          },
          create: {
            id: this.generateId(),
            UserBallotHistory_UserId: userId,
            UserBallotHistory_BallotId: ballotId,
            UserBallotHistory_VotedAt: new Date(),
            UserBallotHistory_VoteCount: totalVotes,
            UserBallotHistory_IsCompleted: true,
            UserBallotHistory_LastAccessed: new Date(),
          }
        });

        return {
          message: 'Vote cast successfully!',
          votes: createdVotes,
          totalVotes: totalVotes,
          ballot: {
            id: ballot.id,
            title: ballot.Ballot_Title,
            status: ballot.Ballot_Status
          }
        };
      });

    } catch (error) {
      console.error('❌ Error casting ballot vote:', error);
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to cast vote: ' + (error.message || 'Unknown error'));
    }
  }

  async getBallotResults(ballotId: string) {
    try {
      console.log('📊 Fetching results for ballot:', ballotId);

      // Get ballot with positions and candidates
      const ballot = await this.prisma.ballot.findUnique({
        where: { id: ballotId },
        include: {
          ballotPositions: {
            include: {
              position: true
            }
          },
          ballotCandidates: {
            include: {
              candidate: true
            }
          }
        }
      });

      if (!ballot) {
        throw new NotFoundException('Ballot not found');
      }

      // Get vote counts for each position
      const results = [];
      
      for (const ballotPosition of ballot.ballotPositions) {
        const positionId = ballotPosition.BallotPosition_PositionId;
        
        // Get all candidates for this position in this ballot
        const candidates = ballot.ballotCandidates.filter(
          bc => bc.BallotCandidate_PositionId === positionId
        );

        // Get vote counts for each candidate
        const candidateResults = [];
        let totalVotes = 0;

        for (const candidate of candidates) {
          const voteCount = await this.prisma.vote.count({
            where: {
              ballotId: ballotId,
              positionId: positionId,
              candidateId: candidate.BallotCandidate_CandidateId
            }
          });

          candidateResults.push({
            candidateId: candidate.BallotCandidate_CandidateId,
            candidateName: candidate.candidate.Candidate_Name,
            candidateStudentId: candidate.candidate.Candidate_StudentId,
            voteCount: voteCount
          });

          totalVotes += voteCount;
        }

        results.push({
          positionId: positionId,
          positionTitle: ballotPosition.position.Position_Title,
          totalVotes: totalVotes,
          candidates: candidateResults.sort((a, b) => b.voteCount - a.voteCount)
        });
      }

      // Get total participation
      const totalParticipants = await this.prisma.userBallotHistory.count({
        where: {
          UserBallotHistory_BallotId: ballotId,
          UserBallotHistory_IsCompleted: true
        }
      });

      return {
        ballot: {
          id: ballot.id,
          title: ballot.Ballot_Title,
          description: ballot.Ballot_Description,
          status: ballot.Ballot_Status,
          isActive: ballot.Ballot_IsActive,
          startDate: ballot.Ballot_StartDate,
          endDate: ballot.Ballot_EndDate
        },
        results: results,
        totalParticipants: totalParticipants,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Error fetching ballot results:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch ballot results: ' + (error.message || 'Unknown error'));
    }
  }

  private generateId(): string {
    const firstPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secondPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${firstPart}-${secondPart}`;
  }
}
