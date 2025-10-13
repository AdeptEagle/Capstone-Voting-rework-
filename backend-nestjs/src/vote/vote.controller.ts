import { Controller, Get, Post, Delete, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto';

@ApiTags('Vote')
@Controller('votes')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Get()
  @ApiOperation({ summary: 'Get all votes' })
  @ApiResponse({ status: 200, description: 'List of all votes' })
  async getAllVotes() {
    return this.voteService.getAllVotes();
  }

  @Post()
  @ApiOperation({ summary: 'Cast a vote (DEPRECATED - Use ballot system instead)' })
  @ApiResponse({ status: 201, description: 'Vote cast successfully' })
  @ApiResponse({ status: 409, description: 'Voter has already voted' })
  @ApiResponse({ status: 400, description: 'Invalid vote data' })
  async createVote(@Body() createVoteDto: CreateVoteDto) {
    console.warn('⚠️ DEPRECATED: POST /votes is deprecated. Use POST /ballots/cast-vote instead.');
    return this.voteService.createVote(createVoteDto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm vote before casting' })
  @ApiResponse({ status: 200, description: 'Vote confirmation details' })
  @ApiResponse({ status: 409, description: 'Voter has already voted' })
  @ApiResponse({ status: 400, description: 'Invalid vote data' })
  async confirmVote(@Body() createVoteDto: CreateVoteDto) {
    return this.voteService.confirmVote(createVoteDto);
  }

  // Specific routes must come before parameterized routes
  @Get('active-results')
  @ApiOperation({ summary: 'Get results for currently active elections' })
  @ApiResponse({ status: 200, description: 'Active election results' })
  async getActiveElectionResults() {
    return this.voteService.getActiveElectionResults();
  }

  @Get('real-time-stats')
  @ApiOperation({ summary: 'Get real-time voting statistics' })
  @ApiResponse({ status: 200, description: 'Real-time voting statistics' })
  async getRealTimeStats() {
    return this.voteService.getRealTimeStats();
  }

  @Get('vote-timeline')
  @ApiOperation({ summary: 'Get vote timeline for the last 24 hours' })
  @ApiResponse({ status: 200, description: 'Vote timeline data' })
  async getVoteTimeline() {
    return this.voteService.getVoteTimeline();
  }

  @Get('voter/:voterId/ballot/:ballotId/status')
  @ApiOperation({ summary: 'Get voter voting status for specific ballot (DEPRECATED - Use ballot system instead)' })
  @ApiResponse({ status: 200, description: 'Voter voting status' })
  @ApiResponse({ status: 404, description: 'Voter or ballot not found' })
  async getVoterVotingStatus(@Param('voterId') voterId: string, @Param('ballotId') ballotId: string) {
    console.warn('⚠️ DEPRECATED: Election-based voting status is deprecated. Use ballot system instead.');
    return this.voteService.getVoterVotingStatus(voterId, ballotId);
  }

  @Get('ballot/:ballotId')
  @ApiOperation({ summary: 'Get votes by ballot (DEPRECATED - Use ballot system instead)' })
  @ApiResponse({ status: 200, description: 'Votes for ballot' })
  async getVotesByBallot(@Param('ballotId') ballotId: string) {
    console.warn('⚠️ DEPRECATED: Election-based vote retrieval is deprecated. Use ballot system instead.');
    return this.voteService.getVotesByElection(ballotId);
  }

  @Get('voter/:voterId')
  @ApiOperation({ summary: 'Get votes by voter' })
  @ApiResponse({ status: 200, description: 'Votes by voter' })
  async getVotesByVoter(@Param('voterId') voterId: string) {
    return this.voteService.getVotesByVoter(voterId);
  }

  @Get('results/:ballotId')
  @ApiOperation({ summary: 'Get vote results for ballot (DEPRECATED - Use ballot system instead)' })
  @ApiResponse({ status: 200, description: 'Vote results' })
  async getVoteResults(@Param('ballotId') ballotId: string) {
    console.warn('⚠️ DEPRECATED: Election-based results are deprecated. Use ballot system instead.');
    return this.voteService.getVoteResults(ballotId);
  }

  @Get('analytics/:ballotId')
  @ApiOperation({ summary: 'Get comprehensive vote analytics for ballot (DEPRECATED - Use ballot system instead)' })
  @ApiResponse({ status: 200, description: 'Comprehensive vote analytics' })
  async getComprehensiveVoteAnalytics(@Param('ballotId') ballotId: string) {
    console.warn('⚠️ DEPRECATED: Election-based analytics are deprecated. Use ballot system instead.');
    return this.voteService.getComprehensiveVoteAnalytics(ballotId);
  }

  @Get('results/:ballotId/departments')
  @ApiOperation({ summary: 'Get department-based voting results for ballot (DEPRECATED - Use ballot system instead)' })
  @ApiResponse({ status: 200, description: 'Department-based voting results' })
  async getDepartmentVotingResults(@Param('ballotId') ballotId: string) {
    console.warn('⚠️ DEPRECATED: Election-based department results are deprecated. Use ballot system instead.');
    return this.voteService.getDepartmentVotingResults(ballotId);
  }

  // Parameterized routes come after specific routes
  @Get(':id')
  @ApiOperation({ summary: 'Get vote by ID' })
  @ApiResponse({ status: 200, description: 'Vote found' })
  @ApiResponse({ status: 404, description: 'Vote not found' })
  async getVoteById(@Param('id') id: string) {
    return this.voteService.getVoteById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vote' })
  @ApiResponse({ status: 200, description: 'Vote deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vote not found' })
  async deleteVote(@Param('id') id: string) {
    return this.voteService.deleteVote(id);
  }

  @Put('reset-voter/:voterId')
  @ApiOperation({ summary: 'Reset voter voting status' })
  @ApiResponse({ status: 200, description: 'Voter status reset successfully' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async resetVoterStatus(@Param('voterId') voterId: string) {
    return this.voteService.resetVoterStatus(voterId);
  }
} 