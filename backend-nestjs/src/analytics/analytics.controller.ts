import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(
    @Request() req,
    @Query('ballotId') ballotId?: string,
    @Query('timeRange') timeRange?: string
  ) {
    const userId = req.user?.id;
    return this.analyticsService.getAnalyticsData(ballotId, timeRange, userId);
  }

  @Get('positions')
  async getPositionAnalytics(
    @Query('ballotId') ballotId?: string,
    @Query('timeRange') timeRange?: string
  ) {
    const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
    return data.positionAnalytics;
  }

  @Get('departments')
  async getDepartmentAnalytics(
    @Query('ballotId') ballotId?: string,
    @Query('timeRange') timeRange?: string
  ) {
    const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
    return data.departmentAnalytics;
  }

  @Get('partylists')
  async getPartylistAnalytics(
    @Query('ballotId') ballotId?: string,
    @Query('timeRange') timeRange?: string
  ) {
    const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
    return data.partylistAnalytics;
  }

  @Get('patterns')
  async getVotingPatterns(
    @Query('ballotId') ballotId?: string,
    @Query('timeRange') timeRange?: string
  ) {
    const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
    return data.votingPatterns;
  }

  @Get('time')
  async getTimeAnalytics(
    @Query('ballotId') ballotId?: string,
    @Query('timeRange') timeRange?: string
  ) {
    const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
    return data.timeAnalytics;
  }

  @Get('summary')
  async getSummaryAnalytics(
    @Query('ballotId') ballotId?: string,
    @Query('timeRange') timeRange?: string
  ) {
    const data = await this.analyticsService.getAnalyticsData(ballotId, timeRange);
    return data.summary;
  }
}
