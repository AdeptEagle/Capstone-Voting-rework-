import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { UpdateBallotDto } from './dto/update-ballot.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { BallotStatus } from '@prisma/client';
import { getPhilippineTime, isFuturePhilippineTime, toPhilippineTime } from '../utils/timezone.util';

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
        Ballot_AllowAbstain,
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
    console.log('🔍 Validating positions:', positionIds);
    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      throw new BadRequestException('At least one position must be selected');
    }

    // Validate candidates
    console.log('🔍 Validating candidates:', candidateIds);
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new BadRequestException('At least one candidate must be selected');
    }

    // Validate that selected candidates belong to selected positions
    const candidates = await this.prisma.candidate.findMany({
      where: { 
        id: { in: candidateIds },
        isDeleted: false,
      },
      select: { id: true, positionId: true }
    });

    console.log('🔍 Found candidates in DB:', candidates);
    console.log('🔍 Selected position IDs:', positionIds);

    const selectedPositionIds = new Set(positionIds);
    const candidatePositionIds = candidates.map(c => c.positionId);
    const validCandidates = candidatePositionIds.filter(posId => selectedPositionIds.has(posId));

    console.log('🔍 Candidate position IDs:', candidatePositionIds);
    console.log('🔍 Valid candidates:', validCandidates);

    if (validCandidates.length === 0) {
      throw new BadRequestException('Selected candidates must belong to the selected positions');
    }

    // Validate that each selected position has at least one candidate
    const positionsWithCandidates = new Set(candidatePositionIds);
    const positionsWithoutCandidates = positionIds.filter(posId => !positionsWithCandidates.has(posId));

    console.log('🔍 Positions with candidates:', Array.from(positionsWithCandidates));
    console.log('🔍 Positions without candidates:', positionsWithoutCandidates);

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
          Ballot_AllowAbstain: Ballot_AllowAbstain !== undefined ? Ballot_AllowAbstain : false,
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
                partyList: true,
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
                partyList: true,
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

    if (updateBallotDto.Ballot_AllowAbstain !== undefined) {
      updateData.Ballot_AllowAbstain = updateBallotDto.Ballot_AllowAbstain;
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
                partyList: true,
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
    console.log('🗑️ Delete ballot request:', { id, deletedBy });
    
    const ballot = await this.getBallotById(id);
    console.log('🗑️ Found ballot:', { 
      id: ballot.id, 
      status: ballot.Ballot_Status, 
      title: ballot.Ballot_Title 
    });

    // Check if ballot can be deleted
    if (ballot.Ballot_Status === BallotStatus.ACTIVE) {
      throw new ForbiddenException('Cannot delete active ballot');
    }
    
    // Allow deletion of ended ballots for future workflow changes
    // if (ballot.Ballot_Status === BallotStatus.ENDED) {
    //   throw new ForbiddenException('Cannot delete ended ballot');
    // }

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

    console.log('🔍 Pause ballot debug:', {
      ballotId: id,
      currentStatus: ballot.Ballot_Status,
      isActive: ballot.Ballot_IsActive,
      pausedBy: pausedBy
    });

    if (ballot.Ballot_Status !== BallotStatus.ACTIVE) {
      throw new BadRequestException(`Only active ballots can be paused. Current status: ${ballot.Ballot_Status}`);
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

  async cancelBallot(id: string, cancelledBy: string) {
    const ballot = await this.getBallotById(id);
    if (ballot.Ballot_Status === BallotStatus.ENDED) {
      throw new BadRequestException('Cannot cancel an already ended ballot');
    }

    return this.prisma.ballot.update({
      where: { id },
      data: {
        Ballot_Status: BallotStatus.CANCELLED,
        Ballot_IsActive: false,
      },
    });
  }

  async getAvailableBallotsForUser(userId: string) {
    const now = new Date();

    // Only return active ballots that users can vote on right now
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
                partyList: true,
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

  async getUpcomingBallotsForUser(userId: string) {
    const now = new Date();

    // Return upcoming ballots (scheduled/not-started) that users can see but not vote on yet
    return this.prisma.ballot.findMany({
      where: {
        Ballot_IsDeleted: false,
        Ballot_IsActive: false,
        Ballot_Status: { in: [BallotStatus.DRAFT, BallotStatus.SCHEDULED] },
        Ballot_StartDate: { gt: now },
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
                partyList: true,
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
        ballot: {
          Ballot_IsDeleted: false, // Filter out deleted ballots
        },
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

    async castBallotVote(castVoteDto: any, userId: string) {
      try {
        console.log('🗳️ ===== VOTE SUBMISSION START =====');
        console.log('🗳️ Casting ballot vote:', JSON.stringify(castVoteDto, null, 2));
        console.log('👤 User ID:', userId);
        console.log('⏰ Timestamp:', new Date().toISOString());

        // Validate required fields
        if (!castVoteDto.ballotId) {
          console.error('❌ Missing ballotId in request');
          throw new BadRequestException('Ballot ID is required');
        }
        if (!castVoteDto.votes || !Array.isArray(castVoteDto.votes) || castVoteDto.votes.length === 0) {
          console.error('❌ Invalid votes array:', castVoteDto.votes);
          throw new BadRequestException('Votes array is required and must not be empty');
        }

      const { ballotId, votes } = castVoteDto;
      console.log('🔍 Extracted ballotId:', ballotId);
      console.log('🔍 Extracted votes:', votes);

      // Validate ballot exists and is active
      console.log('🔍 Querying ballot from database...');
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
              candidate: {
                include: {
                  partyList: true
                }
              }
            }
          }
        }
      });

      if (!ballot) {
        console.error('❌ Ballot not found:', ballotId);
        throw new BadRequestException('Ballot not found');
      }

      console.log('📋 Ballot found:', {
        id: ballot.id,
        title: ballot.Ballot_Title,
        isActive: ballot.Ballot_IsActive,
        status: ballot.Ballot_Status,
        startDate: ballot.Ballot_StartDate,
        endDate: ballot.Ballot_EndDate,
        allowAbstain: ballot.Ballot_AllowAbstain
      });

      console.log('🔍 Ballot validation details:');
      console.log('  - Is Active:', ballot.Ballot_IsActive);
      console.log('  - Status:', ballot.Ballot_Status);
      console.log('  - Start Date:', ballot.Ballot_StartDate);
      console.log('  - End Date:', ballot.Ballot_EndDate);
      console.log('  - Allow Abstain:', ballot.Ballot_AllowAbstain);

      if (!ballot.Ballot_IsActive || ballot.Ballot_Status !== 'ACTIVE') {
        console.error('❌ Ballot is not active:', {
          isActive: ballot.Ballot_IsActive,
          status: ballot.Ballot_Status
        });
        throw new BadRequestException('Ballot is not active');
      }

      const now = new Date();
      console.log('🕐 Time check:', {
        now: now.toISOString(),
        startDate: ballot.Ballot_StartDate.toISOString(),
        endDate: ballot.Ballot_EndDate.toISOString(),
        isWithinPeriod: now >= ballot.Ballot_StartDate && now <= ballot.Ballot_EndDate
      });
      
      if (now < ballot.Ballot_StartDate || now > ballot.Ballot_EndDate) {
        console.error('❌ Ballot is not within voting period');
        throw new BadRequestException('Ballot is not within voting period');
      }

      // Check if user has already voted
      console.log('🔍 Checking user ballot history...');
      console.log('👤 User ID:', userId);
      console.log('🗳️ Ballot ID:', ballotId);
      
      const existingHistory = await this.prisma.userBallotHistory.findUnique({
        where: {
          UserBallotHistory_UserId_UserBallotHistory_BallotId: {
            UserBallotHistory_UserId: userId,
            UserBallotHistory_BallotId: ballotId
          }
        }
      });

      console.log('👤 Checking existing vote history:', {
        userId,
        ballotId,
        existingHistory: existingHistory ? {
          id: existingHistory.id,
          isCompleted: existingHistory.UserBallotHistory_IsCompleted,
          votedAt: existingHistory.UserBallotHistory_VotedAt,
          voteCount: existingHistory.UserBallotHistory_VoteCount
        } : null
      });

      if (existingHistory) {
        console.log('⚠️ User has already voted on this ballot!');
        console.log('  - Vote completed:', existingHistory.UserBallotHistory_IsCompleted);
        console.log('  - Vote count:', existingHistory.UserBallotHistory_VoteCount);
        console.log('  - Voted at:', existingHistory.UserBallotHistory_VotedAt);
        console.log('❌ BLOCKING: User cannot vote again on this ballot');
      } else {
        console.log('✅ User has NOT voted on this ballot yet - proceeding with vote');
      }
      
      if (existingHistory && existingHistory.UserBallotHistory_IsCompleted) {
        console.error('❌ User has already voted on this specific ballot:', {
          userId,
          ballotId,
          isCompleted: existingHistory.UserBallotHistory_IsCompleted,
          votedAt: existingHistory.UserBallotHistory_VotedAt
        });
        throw new ConflictException('User has already completed voting for this ballot');
      }

      // Validate votes - allow empty votes for abstaining ballots
      console.log('🔍 Validating votes...');
      console.log('  - Votes array:', votes);
      console.log('  - Votes length:', votes.length);
      console.log('  - Ballot allows abstain:', ballot.Ballot_AllowAbstain);
      
      if (!votes || !Array.isArray(votes)) {
        console.error('❌ Votes must be an array');
        throw new BadRequestException('Votes must be an array');
      }
      
      // Allow empty votes for abstaining ballots (but still only once per ballot)
      if (votes.length === 0 && !ballot.Ballot_AllowAbstain) {
        console.error('❌ No votes provided and ballot does not allow abstaining');
        throw new BadRequestException('No votes provided and ballot does not allow abstaining');
      }
      
      if (votes.length === 0 && ballot.Ballot_AllowAbstain) {
        console.log('🗳️ User is abstaining (no votes submitted) - this counts as their one vote for this ballot');
      }

      // Validate each vote
      console.log('🗳️ Validating votes:', votes);
      for (const vote of votes) {
        const { positionId, candidateId } = vote;
        console.log('🔍 Validating vote:', { positionId, candidateId });

        // Check if position is in this ballot
        const ballotPosition = ballot.ballotPositions.find(
          bp => bp.BallotPosition_PositionId === positionId
        );
        if (!ballotPosition) {
          console.error('❌ Position not in ballot:', {
            positionId,
            availablePositions: ballot.ballotPositions.map(bp => bp.BallotPosition_PositionId)
          });
          throw new BadRequestException(`Position ${positionId} is not in this ballot`);
        }

        // Check if candidate is in this ballot for this position
        const ballotCandidate = ballot.ballotCandidates.find(
          bc => bc.BallotCandidate_CandidateId === candidateId && 
                bc.BallotCandidate_PositionId === positionId
        );
        if (!ballotCandidate) {
          console.error('❌ Candidate not valid for position:', {
            candidateId,
            positionId,
            availableCandidates: ballot.ballotCandidates
              .filter(bc => bc.BallotCandidate_PositionId === positionId)
              .map(bc => bc.BallotCandidate_CandidateId)
          });
          throw new BadRequestException(`Candidate ${candidateId} is not valid for position ${positionId} in this ballot`);
        }
      }

      // Check if ballot is linked to an election (optional)
      const electionIdValue = (ballot as any).electionId as string | null | undefined;

      // Create votes using the existing Vote model with ballot context
      console.log('💾 Starting database transaction...');
      console.log('🔄 Starting database transaction...');
      return await this.prisma.$transaction(async (tx) => {
        console.log('✅ Database transaction started');
        const createdVotes = [];
        
        // Handle abstaining (no votes)
        if (votes.length === 0) {
          console.log('🗳️ Processing abstaining vote (no votes to create)');
        } else {
          // Process actual votes
          for (const vote of votes) {
          const { positionId, candidateId } = vote;
          console.log('🗳️ Creating vote for:', { positionId, candidateId });
          
          // Create vote record
          const voteData_create: any = {
            id: this.generateId(),
            // Relation connections (preferred over raw FK fields for required relations)
            voter: { connect: { id: userId } },
            candidate: { connect: { id: candidateId } },
            position: { connect: { id: positionId } },
            ballot: { connect: { id: ballotId } },
            // Metadata
            ipAddress: castVoteDto.ipAddress || null,
            userAgent: castVoteDto.userAgent || null,
            sessionId: castVoteDto.sessionId || null,
          };

          // Only add election connection if ballot has an election
          if (electionIdValue) {
            voteData_create.election = { connect: { id: electionIdValue } };
          }
          // If no election, we can omit the election field entirely since it's now optional

          const voteRecord = await tx.vote.create({
            data: voteData_create,
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

        console.log('✅ Vote submission completed successfully!');
        console.log('  - Total votes created:', totalVotes);
        console.log('  - Created votes:', createdVotes.length);
        console.log('  - Ballot ID:', ballot.id);
        console.log('  - User ID:', userId);
        
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
      console.error('❌ ===== VOTE SUBMISSION FAILED =====');
      console.error('❌ Error casting ballot vote:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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
              candidate: {
                include: {
                  partyList: true
                }
              }
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

  // Bulk Operations
  async bulkActivateBallots(ballotIds: string[], activatedBy: string) {
    const results = [];
    
    for (const ballotId of ballotIds) {
      try {
        const result = await this.activateBallot(ballotId, activatedBy);
        results.push({ ballotId, success: true, ballot: result });
      } catch (error) {
        results.push({ 
          ballotId, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return {
      totalProcessed: ballotIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkPauseBallots(ballotIds: string[], pausedBy: string) {
    const results = [];
    
    for (const ballotId of ballotIds) {
      try {
        const result = await this.pauseBallot(ballotId, pausedBy);
        results.push({ ballotId, success: true, ballot: result });
      } catch (error) {
        results.push({ 
          ballotId, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return {
      totalProcessed: ballotIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkEndBallots(ballotIds: string[], endedBy: string) {
    const results = [];
    
    for (const ballotId of ballotIds) {
      try {
        const result = await this.endBallot(ballotId, endedBy);
        results.push({ ballotId, success: true, ballot: result });
      } catch (error) {
        results.push({ 
          ballotId, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return {
      totalProcessed: ballotIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkDeleteBallots(ballotIds: string[], deletedBy: string) {
    const results = [];
    
    for (const ballotId of ballotIds) {
      try {
        const result = await this.deleteBallot(ballotId, deletedBy);
        results.push({ ballotId, success: true, ballot: result });
      } catch (error) {
        results.push({ 
          ballotId, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return {
      totalProcessed: ballotIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkUpdateBallotStatus(ballotIds: string[], status: BallotStatus, updatedBy: string) {
    const results = [];
    
    for (const ballotId of ballotIds) {
      try {
        let result;
        switch (status) {
          case BallotStatus.ACTIVE:
            result = await this.activateBallot(ballotId, updatedBy);
            break;
          case BallotStatus.PAUSED:
            result = await this.pauseBallot(ballotId, updatedBy);
            break;
          case BallotStatus.ENDED:
            result = await this.endBallot(ballotId, updatedBy);
            break;
          case BallotStatus.CANCELLED:
            result = await this.cancelBallot(ballotId, updatedBy);
            break;
          default:
            throw new BadRequestException(`Invalid status for bulk update: ${status}`);
        }
        results.push({ ballotId, success: true, ballot: result });
      } catch (error) {
        results.push({ 
          ballotId, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return {
      totalProcessed: ballotIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  // Create ballot from template (without candidates)
  async createBallotFromTemplate(ballotData: any, createdBy: string) {
    console.log('🔍 Ballot Service - createBallotFromTemplate called');
    console.log('📊 Ballot Data:', ballotData);
    console.log('👤 Created By:', createdBy);
    
    // Debug the received data
    console.log('📋 Ballot Data Debug:', {
      title: ballotData.Ballot_Title,
      description: ballotData.Ballot_Description,
      startDate: ballotData.Ballot_StartDate,
      endDate: ballotData.Ballot_EndDate,
      templateId: ballotData.templateId,
      requireAllPositions: ballotData.Ballot_RequireAllPositions,
      showResults: ballotData.Ballot_ShowResults,
      showLiveResults: ballotData.Ballot_ShowLiveResults
    });
    
    const {
      Ballot_Title,
      Ballot_Description,
      Ballot_StartDate,
      Ballot_EndDate,
      Ballot_RequireAllPositions,
      Ballot_ShowResults,
      Ballot_ShowResultsAfter,
      Ballot_ShowLiveResults,
      templateId
    } = ballotData;

    // Validate required fields
    if (!Ballot_Title || !Ballot_StartDate || !Ballot_EndDate) {
      throw new BadRequestException('Title, start date, and end date are required');
    }

    // Parse dates as Philippine time (UTC+8)
    // The frontend sends dates in Philippine time format, so we need to treat them as local time
    const startDate = new Date(Ballot_StartDate);
    const endDate = new Date(Ballot_EndDate);

    console.log('🕐 Date Validation Debug:', {
      originalStartDate: Ballot_StartDate,
      originalEndDate: Ballot_EndDate,
      parsedStartDate: startDate.toISOString(),
      parsedEndDate: endDate.toISOString(),
      startDatePhilippine: toPhilippineTime(startDate).toISOString(),
      currentPhilippineTime: getPhilippineTime().toISOString(),
      isStartDateValid: isFuturePhilippineTime(toPhilippineTime(startDate), 1)
    });

    // Validate dates
    if (startDate >= endDate) {
      console.log('❌ Date validation failed: Start date >= End date');
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate start date is in the future using Philippine time
    // Convert the parsed date to Philippine time for comparison
    const startDatePhilippine = toPhilippineTime(startDate);
    if (!isFuturePhilippineTime(startDatePhilippine, 1)) {
      const philippineTime = getPhilippineTime();
      console.log('❌ Date validation failed: Start date not in future');
      throw new BadRequestException(`Start date must be at least 1 minute in the future. Current Philippine time: ${philippineTime.toISOString()}, Start time: ${startDatePhilippine.toISOString()}`);
    }
    
    console.log('✅ Date validation passed');

    // Get template data if templateId is provided
    let templateData = null;
    if (templateId) {
      const template = await this.prisma.ballotTemplate.findUnique({
        where: { id: templateId }
      });
      
      if (!template) {
        throw new BadRequestException('Template not found');
      }
      
      templateData = template.BallotTemplate_Data as any;
      console.log('📋 Template Data:', templateData);
    }

    // Create the ballot with positions from template
    console.log('🏗️ Creating ballot with data:', {
      title: Ballot_Title,
      description: Ballot_Description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      showResultsAfter: Ballot_ShowResultsAfter ? new Date(Ballot_ShowResultsAfter).toISOString() : null,
      requireAllPositions: Ballot_RequireAllPositions,
      showResults: Ballot_ShowResults,
      showLiveResults: Ballot_ShowLiveResults,
      createdBy: createdBy,
      hasTemplate: !!templateData
    });
    
    return this.prisma.$transaction(async (tx) => {
      // Create ballot
      const ballot = await tx.ballot.create({
        data: {
          id: this.generateId(),
          Ballot_Title,
          Ballot_Description: Ballot_Description || '',
          Ballot_StartDate: startDate,
          Ballot_EndDate: endDate,
          Ballot_RequireAllPositions: Ballot_RequireAllPositions !== false,
          Ballot_ShowResults: Ballot_ShowResults !== false,
          Ballot_ShowResultsAfter: Ballot_ShowResultsAfter ? new Date(Ballot_ShowResultsAfter) : null,
          Ballot_ShowLiveResults: Ballot_ShowLiveResults !== false,
          Ballot_AllowAbstain: ballotData.Ballot_AllowAbstain !== undefined ? ballotData.Ballot_AllowAbstain : false,
          Ballot_Status: BallotStatus.DRAFT,
          Ballot_IsActive: false,
          Ballot_CreatedBy: createdBy,
        },
      });

      // Create positions from template if template data exists
      if (templateData && templateData.positions && Array.isArray(templateData.positions)) {
        console.log('📋 Processing positions from template:', templateData.positions.length);
        
        const processedPositions = await Promise.all(
          templateData.positions.map(async (positionData: any) => {
            // Check if position already exists
            let position = await tx.position.findFirst({
              where: {
                Position_Title: positionData.positionTitle,
                voteLimit: positionData.voteLimit || 1
              }
            });

            // Create position only if it doesn't exist
            if (!position) {
              console.log(`🆕 Creating new position: ${positionData.positionTitle}`);
              position = await tx.position.create({
                data: {
                  id: this.generateId(),
                  Position_Title: positionData.positionTitle,
                  Position_Description: `Position for ${positionData.positionTitle}`,
                  voteLimit: positionData.voteLimit || 1,
                  displayOrder: positionData.displayOrder || 1,
                },
              });
            } else {
              console.log(`♻️ Reusing existing position: ${positionData.positionTitle}`);
            }

            // Link position to ballot
            await tx.ballotPosition.create({
              data: {
                id: this.generateId(),
                BallotPosition_BallotId: ballot.id,
                BallotPosition_PositionId: position.id,
                BallotPosition_DisplayOrder: positionData.displayOrder || 1,
                BallotPosition_IsRequired: positionData.isRequired !== false,
              },
            });

            return position;
          })
        );

        console.log(`✅ Processed ${processedPositions.length} positions from template`);
      }
      
      console.log('✅ Ballot created successfully:', ballot.id);
      return ballot;
    });
  }

  async checkAndAutoStartBallots() {
    try {
      console.log('🔍 Checking for ballots that should start...');
      
      const now = new Date();
      const ballotsToStart = await this.prisma.ballot.findMany({
        where: {
          Ballot_Status: { in: ['DRAFT', 'SCHEDULED'] },
          Ballot_IsActive: false,
          Ballot_StartDate: { lte: now },
          Ballot_EndDate: { gt: now }, // Don't start ballots that have already ended
          Ballot_IsDeleted: false,
        },
      });

      console.log(`📊 Found ${ballotsToStart.length} ballots ready to start`);

      const autoStartedBallots = [];

      for (const ballot of ballotsToStart) {
        try {
          console.log(`🔄 Auto-starting ballot: ${ballot.Ballot_Title} (${ballot.id})`);
          
          const updatedBallot = await this.prisma.ballot.update({
            where: { id: ballot.id },
            data: {
              Ballot_Status: BallotStatus.ACTIVE,
              Ballot_IsActive: true,
              Ballot_StartDate: now, // Update start date to now
            }
          });

          autoStartedBallots.push(updatedBallot);
          console.log(`✅ Auto-started ballot: ${ballot.Ballot_Title}`);
        } catch (error) {
          console.error(`❌ Error auto-starting ballot ${ballot.id}:`, error);
        }
      }

      return {
        autoStartedBallots,
        totalChecked: ballotsToStart.length
      };
    } catch (error) {
      console.error('❌ Error in checkAndAutoStartBallots:', error);
      return {
        autoStartedBallots: [],
        totalChecked: 0
      };
    }
  }

  async checkAndAutoEndBallots() {
    try {
      console.log('🔍 Checking for expired ballots...');
      
      const now = new Date();
      const expiredBallots = await this.prisma.ballot.findMany({
        where: {
          Ballot_Status: 'ACTIVE',
          Ballot_EndDate: {
            lt: now
          },
          Ballot_IsDeleted: false
        },
        include: {
          _count: {
            select: {
              votes: true,
              userHistory: true
            }
          }
        }
      });

      console.log(`📊 Found ${expiredBallots.length} expired ballots`);

      const autoEndedBallots = [];

      for (const ballot of expiredBallots) {
        try {
          console.log(`🔄 Auto-ending ballot: ${ballot.Ballot_Title} (${ballot.id})`);
          
          const updatedBallot = await this.prisma.ballot.update({
            where: { id: ballot.id },
            data: {
              Ballot_Status: BallotStatus.ENDED,
              Ballot_IsActive: false
            }
          });

          autoEndedBallots.push(updatedBallot);
          console.log(`✅ Auto-ended ballot: ${ballot.Ballot_Title}`);
        } catch (error) {
          console.error(`❌ Error auto-ending ballot ${ballot.id}:`, error);
        }
      }

      return {
        autoEndedBallots,
        totalChecked: expiredBallots.length
      };
    } catch (error) {
      console.error('❌ Error checking for expired ballots:', error);
      throw error;
    }
  }
}
