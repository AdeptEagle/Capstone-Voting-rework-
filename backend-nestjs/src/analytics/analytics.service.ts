import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalyticsData(ballotId?: string, timeRange?: string, userId?: string) {
    const whereClause = this.buildWhereClause(ballotId, timeRange);
    
    const [
      positionAnalytics,
      departmentAnalytics,
      partylistAnalytics,
      votingPatterns,
      timeAnalytics,
      summary
    ] = await Promise.all([
      this.getPositionAnalytics(whereClause),
      this.getDepartmentAnalytics(whereClause),
      this.getPartylistAnalytics(whereClause),
      this.getVotingPatterns(whereClause),
      this.getTimeAnalytics(whereClause),
      this.getSummaryAnalytics(whereClause)
    ]);

    // Add user-specific department voting data if userId is provided
    let userDepartmentVoting = null;
    if (userId) {
      userDepartmentVoting = await this.getUserDepartmentVoting(ballotId, userId);
    }

    return {
      positionAnalytics,
      departmentAnalytics,
      partylistAnalytics,
      votingPatterns,
      timeAnalytics,
      summary,
      userDepartmentVoting
    };
  }

  private buildWhereClause(ballotId?: string, timeRange?: string) {
    const where: any = {};

    if (ballotId && ballotId !== 'all') {
      where.ballotId = ballotId;
    }

    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      where.createdAt = {
        gte: startDate
      };
    }

    return where;
  }

  private async getPositionAnalytics(whereClause: any) {
    // If ballotId is specified, only get positions that are part of that ballot
    let positionFilter = {};
    if (whereClause.ballotId) {
      positionFilter = {
        ballotPositions: {
          some: {
            BallotPosition_BallotId: whereClause.ballotId
          }
        }
      };
    }

    const positions = await this.prisma.position.findMany({
      where: positionFilter,
      include: {
        candidates: {
          include: {
            votes: {
              where: whereClause
            },
            department: true
          }
        },
        votes: {
          where: whereClause
        }
      }
    });

    return positions
      .map(position => {
        const totalVotes = position.votes.length;
        const candidateCount = position.candidates.length;
        
        // Candidate vote breakdown for top list / bars
        const candidateVotes = position.candidates.map(candidate => ({
          candidateName: candidate.Candidate_Name,
          votes: candidate.votes.length,
          percentage: totalVotes > 0 ? (candidate.votes.length / totalVotes) * 100 : 0
        })).sort((a, b) => b.votes - a.votes);

        return {
          positionTitle: position.Position_Title,
          totalVotes,
          candidateCount,
          topCandidates: candidateVotes.slice(0, 3).map(c => ({
            candidateName: c.candidateName,
            votes: c.votes,
            percentage: Math.round(c.percentage * 10) / 10
          })),
          status: totalVotes > 0 ? 'Active' : 'No Votes'
        };
      })
      .filter(position => position.totalVotes > 0); // Only include positions that actually have votes
  }

  private async getDepartmentAnalytics(whereClause: any) {
    // Get all votes in the system and group by voter's department
    const votes = await this.prisma.vote.findMany({
      where: whereClause,
      include: {
        voter: {
          include: {
            department: true
          }
        },
        candidate: {
          include: {
            position: true
          }
        }
      }
    });

    // Group votes by the voter's department
    const departmentVotes = votes.reduce((acc, vote) => {
      const voterDept = vote.voter.department;
      if (!voterDept) {
        return acc; // Skip if voter has no department
      }
      
      const deptName = voterDept.Department_Name;
      
      if (!acc[deptName]) {
        acc[deptName] = {
          departmentName: deptName,
          votes: 0,
          uniqueVoters: new Set(),
          positions: new Set()
        };
      }
      
      acc[deptName].votes += 1;
      acc[deptName].uniqueVoters.add(vote.voterId);
      acc[deptName].positions.add(vote.candidate.position.Position_Title);
      return acc;
    }, {});

    // Get department information for registered voters
    const departments = await this.prisma.department.findMany({
      include: {
        voters: true
      }
    });

    // Convert to array and add department info
    const result = Object.values(departmentVotes)
      .map((dept: any) => {
        const department = departments.find(d => d.Department_Name === dept.departmentName);
        const registeredVoters = department ? department.voters.length : 0;
        const actualVoters = dept.uniqueVoters.size;
        
        // Calculate participation rate as percentage of registered voters who actually voted
        const participationRate = registeredVoters > 0 ? 
          (actualVoters / registeredVoters) * 100 : 0;
        
        // Calculate average votes per voter (total votes / unique voters)
        const avgVotesPerVoter = actualVoters > 0 ? dept.votes / actualVoters : 0;

        return {
          departmentName: dept.departmentName,
          registeredVoters,
          votesCast: dept.votes,
          participationRate: Math.round(participationRate * 100) / 100,
          avgVotesPerVoter: Math.round(avgVotesPerVoter * 100) / 100,
          topPosition: Array.from(dept.positions)[0] || 'N/A' // First position as top
        };
      })
      .filter(dept => dept.votesCast > 0); // Only include departments with votes

    return result;
  }

  private async getPartylistAnalytics(whereClause: any) {
    // If ballotId is specified, only get partylists that have candidates in that ballot
    let partylistFilter = {};
    if (whereClause.ballotId) {
      partylistFilter = {
        candidates: {
          some: {
            ballotCandidates: {
              some: {
                BallotCandidate_BallotId: whereClause.ballotId
              }
            }
          }
        }
      };
    }

    const partylists = await this.prisma.partyList.findMany({
      where: partylistFilter,
      include: {
        candidates: {
          include: {
            votes: {
              where: whereClause
            },
            position: true,
            ballotCandidates: whereClause.ballotId ? {
              where: {
                BallotCandidate_BallotId: whereClause.ballotId
              }
            } : true
          }
        }
      }
    });

    // Build a global map of position winners across ALL partylists
    // key: positionId -> { partylistId, votes, positionName }
    const globalPositionWinners: Record<string, { partylistId: string, votes: number, positionName: string }> = {};

    // First pass: collect candidates (filtered per ballot where applicable) and update global winners
    const collected = await Promise.all(partylists.map(async (partylist) => {
      // Filter candidates to only include those in the specific ballot
      const ballotCandidates = whereClause.ballotId 
        ? partylist.candidates.filter(candidate => 
            candidate.ballotCandidates?.some(bc => bc.BallotCandidate_BallotId === whereClause.ballotId)
          )
        : partylist.candidates;

      const totalCandidates = ballotCandidates.length;
      const totalVotes = ballotCandidates.reduce((total, candidate) => 
        total + candidate.votes.length, 0
      );
      
      // Update global position winners across all parties
      ballotCandidates.forEach(candidate => {
        const positionId = candidate.positionId as unknown as string;
        const candVotes = candidate.votes.length;
        if (!globalPositionWinners[positionId] || candVotes > globalPositionWinners[positionId].votes) {
          globalPositionWinners[positionId] = {
            partylistId: partylist.id,
            votes: candVotes,
            positionName: candidate.position.Position_Title
          };
        }
      });

      // Calculate vote share (total votes by this partylist / total votes in system)
      const allVotes = await this.prisma.vote.count({ where: whereClause });
      const voteShare = allVotes > 0 ? (totalVotes / allVotes) * 100 : 0;
      
      // Return interim data to compute success after global winners are known
      return {
        partylist,
        ballotCandidates,
        totalCandidates,
        totalVotes,
        voteShare
      };
    }));

    // Second pass: compute party-specific success using the global winners map
    const partylistResults = await Promise.all(collected.map(async (entry) => {
      const { partylist, ballotCandidates, totalCandidates, totalVotes, voteShare } = entry as any;

      const winningCandidates = Object.values(globalPositionWinners).filter(w => w.partylistId === partylist.id).length;
      const positionsContested = new Set(ballotCandidates.map((c: any) => c.positionId)).size;
      const successRate = positionsContested > 0 ? (winningCandidates / positionsContested) * 100 : 0;

      // Position performance - calculate vote share for each position this party contested
      const positionPerformance = await Promise.all(Array.from(new Set(ballotCandidates.map((c: any) => c.positionId))).map(async (positionId: any) => {
        // Get total votes for this position across all partylists
        const totalVotesForPosition = await this.prisma.vote.count({
          where: {
            ...whereClause,
            candidate: {
              positionId: positionId
            }
          }
        });
        
        // Calculate this partylist's vote share for this position
        const partylistVotesForPosition = ballotCandidates
          .filter((candidate: any) => candidate.positionId === positionId)
          .reduce((total: number, candidate: any) => total + candidate.votes.length, 0);
        
        return {
          positionName: ballotCandidates.find((c: any) => c.positionId === positionId)?.position?.Position_Title || 'N/A',
          performance: totalVotesForPosition > 0 ? (partylistVotesForPosition / totalVotesForPosition) * 100 : 0
        };
      }));

      return {
        partylistName: partylist.name,
        color: partylist.color || '#3498db',
        totalCandidates,
        winningCandidates, // kept for possible admin usage, not shown on user
        totalVotes,
        voteShare: Math.round(voteShare * 10) / 10,
        positionPerformance: positionPerformance.map(p => ({
          positionName: p.positionName,
          performance: Math.round(p.performance * 10) / 10
        }))
      };
    }));

    // Filter out partylists with no votes
    return partylistResults.filter(partylist => partylist.totalVotes > 0);
  }

  private async getVotingPatterns(whereClause: any) {
    const votes = await this.prisma.vote.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        userAgent: true
      }
    });

    // Analyze hourly patterns
    const hourlyVotes = votes.reduce((acc, vote) => {
      const hour = vote.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHours = Object.entries(hourlyVotes)
      .map(([hour, count]) => ({ hour: parseInt(hour), votes: count as number }))
      .sort((a, b) => (b.votes as number) - (a.votes as number))
      .slice(0, 5);

    // Analyze voting behavior
    const totalVotes = votes.length;
    const earlyVoters = votes.filter(vote => {
      const hour = vote.createdAt.getHours();
      return hour >= 6 && hour <= 10;
    }).length;

    const lastMinuteVoters = votes.filter(vote => {
      const hour = vote.createdAt.getHours();
      return hour >= 18 && hour <= 23;
    }).length;

    // Analyze device usage
    const mobileUsers = votes.filter(vote => 
      vote.userAgent && /mobile|android|iphone/i.test(vote.userAgent)
    ).length;

    const desktopUsers = totalVotes - mobileUsers;

    return {
      peakHours,
      earlyVoters: totalVotes > 0 ? Math.round((earlyVoters / totalVotes) * 100) : 0,
      lastMinuteVoters: totalVotes > 0 ? Math.round((lastMinuteVoters / totalVotes) * 100) : 0,
      mobileUsers: totalVotes > 0 ? Math.round((mobileUsers / totalVotes) * 100) : 0,
      desktopUsers: totalVotes > 0 ? Math.round((desktopUsers / totalVotes) * 100) : 0
    };
  }

  private async getTimeAnalytics(whereClause: any) {
    const votes = await this.prisma.vote.findMany({
      where: whereClause,
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (votes.length === 0) {
      return {
        firstVote: 'N/A',
        lastVote: 'N/A',
        peakHour: 'N/A',
        dailyAverage: 0,
        hourlyAverage: 0,
        weekendRatio: 0,
        votingDuration: 0,
        fastestHour: 'N/A',
        slowestHour: 'N/A'
      };
    }

    const firstVote = votes[0].createdAt;
    const lastVote = votes[votes.length - 1].createdAt;
    const votingDuration = Math.ceil((lastVote.getTime() - firstVote.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate hourly averages
    const hourlyVotes = votes.reduce((acc, vote) => {
      const hour = vote.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHour = Object.entries(hourlyVotes)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';

    const hourlyAverage = votes.length / 24;
    const dailyAverage = votes.length / Math.max(votingDuration, 1);

    // Calculate weekend vs weekday ratio
    const weekendVotes = votes.filter(vote => {
      const day = vote.createdAt.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;

    const weekendRatio = votes.length > 0 ? Math.round((weekendVotes / votes.length) * 100) : 0;

    // Find fastest and slowest hours
    const hourlyRates = Object.entries(hourlyVotes)
      .map(([hour, count]) => ({ hour: parseInt(hour), rate: count as number }))
      .sort((a, b) => b.rate - a.rate);

    const fastestHour = hourlyRates[0]?.hour || 'N/A';
    const slowestHour = hourlyRates[hourlyRates.length - 1]?.hour || 'N/A';

    return {
      firstVote: firstVote.toLocaleString(),
      lastVote: lastVote.toLocaleString(),
      peakHour: `${peakHour}:00`,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      hourlyAverage: Math.round(hourlyAverage * 100) / 100,
      weekendRatio,
      votingDuration,
      fastestHour: `${fastestHour}:00`,
      slowestHour: `${slowestHour}:00`
    };
  }

  private async getSummaryAnalytics(whereClause: any) {
    const [totalVotes, totalVoters, positions] = await Promise.all([
      this.prisma.vote.count({ where: whereClause }),
      this.prisma.voter.count(),
      this.prisma.position.findMany({
        include: {
          candidates: {
            include: {
              votes: {
                where: whereClause
              }
            }
          }
        }
      })
    ]);

    const participationRate = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

    // Find most competitive position
    const positionCompetitiveness = positions.map(position => {
      const candidateVotes = position.candidates.map(candidate => candidate.votes.length);
      const competitiveness = this.calculateCompetitiveness(
        candidateVotes.map((votes, index) => ({
          candidateName: position.candidates[index].Candidate_Name,
          votes,
          percentage: 0
        }))
      );
      return {
        positionTitle: position.Position_Title,
        competitiveness
      };
    });

    const mostCompetitivePosition = positionCompetitiveness
      .sort((a, b) => b.competitiveness - a.competitiveness)[0]?.positionTitle || 'N/A';

    return {
      totalVotes,
      totalVoters,
      participationRate: Math.round(participationRate * 100) / 100,
      mostCompetitivePosition,
      avgVotingTime: 5, // Placeholder - would need more detailed tracking
      systemUptime: 99.9, // Placeholder
      errorRate: 0.1, // Placeholder
      dataIntegrity: 100 // Placeholder
    };
  }

  private calculateCompetitiveness(candidateVotes: Array<{votes: number, percentage: number}>) {
    if (candidateVotes.length === 0) return 0;
    
    const totalVotes = candidateVotes.reduce((sum, candidate) => sum + candidate.votes, 0);
    if (totalVotes === 0) return 0;

    // Calculate Gini coefficient as a measure of inequality
    const sortedVotes = candidateVotes
      .map(c => c.votes)
      .sort((a, b) => a - b);
    
    const n = sortedVotes.length;
    let gini = 0;
    
    for (let i = 0; i < n; i++) {
      gini += (2 * (i + 1) - n - 1) * sortedVotes[i];
    }
    
    gini = gini / (n * totalVotes);
    
    // Convert to competitiveness (1 - gini coefficient)
    return Math.max(0, 1 - gini);
  }

  private async getUserDepartmentVoting(ballotId?: string, userId?: string) {
    if (!userId) return null;

    // Get the user's department
    const voter = await this.prisma.voter.findUnique({
      where: { id: userId },
      include: {
        department: true
      }
    });

    if (!voter || !voter.department) return null;

    // Get all votes by the user in the specific ballot
    const userVotes = await this.prisma.vote.findMany({
      where: {
        voterId: userId,
        ...(ballotId && ballotId !== 'all' ? { ballotId } : {})
      },
      include: {
        candidate: {
          include: {
            position: true
          }
        }
      }
    });

    // Return the user's department with their vote count
    return [{
      departmentName: voter.department.Department_Name,
      votes: userVotes.length,
      positionsVoted: new Set(userVotes.map(vote => vote.candidate.position.Position_Title)).size,
      positionsList: Array.from(new Set(userVotes.map(vote => vote.candidate.position.Position_Title)))
    }];
  }
}
