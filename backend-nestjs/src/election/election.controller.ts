import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ElectionService } from './election.service';
import { CreateElectionDto, UpdateElectionDto, AddPositionDto, AddCandidateDto } from './dto';

@ApiTags('Election')
@Controller('elections')
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all elections' })
  @ApiResponse({ status: 200, description: 'List of all elections' })
  async getAllElections() {
    return this.electionService.getAllElections();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active elections' })
  @ApiResponse({ status: 200, description: 'List of active elections' })
  async getActiveElections() {
    return this.electionService.getActiveElections();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new election' })
  @ApiResponse({ status: 201, description: 'Election created successfully' })
  @ApiResponse({ status: 409, description: 'Election already exists' })
  async createElection(@Body() createElectionDto: CreateElectionDto, @Request() req: any) {
    // For now, use a default admin ID. In production, get from JWT token
    const adminId = 'ADMIN-1'; // This should come from req.user.id when auth is implemented
    return this.electionService.createElection(createElectionDto, adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get election by ID' })
  @ApiResponse({ status: 200, description: 'Election found' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getElectionById(@Param('id') id: string) {
    return this.electionService.getElectionById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update election' })
  @ApiResponse({ status: 200, description: 'Election updated successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async updateElection(@Param('id') id: string, @Body() updateElectionDto: UpdateElectionDto) {
    return this.electionService.updateElection(id, updateElectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete election' })
  @ApiResponse({ status: 200, description: 'Election deleted successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async deleteElection(@Param('id') id: string) {
    return this.electionService.deleteElection(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate election' })
  @ApiResponse({ status: 200, description: 'Election activated successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async activateElection(@Param('id') id: string) {
    return this.electionService.activateElection(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate election' })
  @ApiResponse({ status: 200, description: 'Election deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async deactivateElection(@Param('id') id: string) {
    return this.electionService.deactivateElection(id);
  }

  // ===== COMPREHENSIVE BALLOT LIFECYCLE MANAGEMENT =====

  @Put(':id/start-ballot')
  @ApiOperation({ summary: 'Start ballot - Begin voting process' })
  @ApiResponse({ status: 200, description: 'Ballot started successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  @ApiResponse({ status: 409, description: 'Cannot start ballot - validation failed' })
  async startBallot(@Param('id') id: string) {
    return this.electionService.startBallot(id);
  }

  @Put(':id/pause-ballot')
  @ApiOperation({ summary: 'Pause ballot - Temporarily stop voting' })
  @ApiResponse({ status: 200, description: 'Ballot paused successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  @ApiResponse({ status: 409, description: 'Cannot pause ballot - not active' })
  async pauseBallot(@Param('id') id: string) {
    return this.electionService.pauseBallot(id);
  }

  @Put(':id/resume-ballot')
  @ApiOperation({ summary: 'Resume ballot - Continue paused voting' })
  @ApiResponse({ status: 200, description: 'Ballot resumed successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  @ApiResponse({ status: 409, description: 'Cannot resume ballot - not paused' })
  async resumeBallot(@Param('id') id: string) {
    return this.electionService.resumeBallot(id);
  }

  @Put(':id/end-ballot')
  @ApiOperation({ summary: 'End ballot - Finalize and save results' })
  @ApiResponse({ status: 200, description: 'Ballot ended successfully with final results' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  @ApiResponse({ status: 409, description: 'Cannot end ballot - validation failed' })
  async endBallot(@Param('id') id: string) {
    return this.electionService.endBallot(id);
  }

  @Get(':id/ballot-status')
  @ApiOperation({ summary: 'Get ballot status and lifecycle information' })
  @ApiResponse({ status: 200, description: 'Ballot status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getBallotStatus(@Param('id') id: string) {
    return this.electionService.getBallotStatus(id);
  }

  // ===== AUTOMATIC VOTE LOCKOUT ENDPOINTS =====

  @Post('auto-end-check')
  @ApiOperation({ summary: 'Check and auto-end expired elections' })
  @ApiResponse({ status: 200, description: 'Auto-end check completed successfully' })
  async checkAndAutoEndElections() {
    return this.electionService.checkAndAutoEndElections();
  }

  @Get(':id/time-status')
  @ApiOperation({ summary: 'Get election time status and voting window information' })
  @ApiResponse({ status: 200, description: 'Time status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getElectionTimeStatus(@Param('id') id: string) {
    return this.electionService.getElectionTimeStatus(id);
  }

  @Post('schedule-auto-end')
  @ApiOperation({ summary: 'Schedule automatic end check (for cron jobs)' })
  @ApiResponse({ status: 200, description: 'Auto-end check scheduled successfully' })
  async scheduleAutoEndCheck() {
    return this.electionService.scheduleAutoEndCheck();
  }

  @Post(':id/positions')
  @ApiOperation({ summary: 'Add position to election' })
  @ApiResponse({ status: 201, description: 'Position added to election successfully' })
  @ApiResponse({ status: 404, description: 'Election or position not found' })
  @ApiResponse({ status: 409, description: 'Position already added to election' })
  async addPositionToElection(@Param('id') id: string, @Body() addPositionDto: AddPositionDto) {
    return this.electionService.addPositionToElection(id, addPositionDto);
  }

  @Post(':id/candidates')
  @ApiOperation({ summary: 'Add candidate to election' })
  @ApiResponse({ status: 201, description: 'Candidate added to election successfully' })
  @ApiResponse({ status: 404, description: 'Election or candidate not found' })
  @ApiResponse({ status: 409, description: 'Candidate already added to election' })
  async addCandidateToElection(@Param('id') id: string, @Body() addCandidateDto: AddCandidateDto) {
    return this.electionService.addCandidateToElection(id, addCandidateDto);
  }

  @Delete(':id/positions/:positionId')
  @ApiOperation({ summary: 'Remove position from election' })
  @ApiResponse({ status: 200, description: 'Position removed from election successfully' })
  @ApiResponse({ status: 404, description: 'Position not found in election' })
  async removePositionFromElection(@Param('id') id: string, @Param('positionId') positionId: string) {
    return this.electionService.removePositionFromElection(id, positionId);
  }

  @Delete(':id/candidates/:candidateId')
  @ApiOperation({ summary: 'Remove candidate from election' })
  @ApiResponse({ status: 200, description: 'Candidate removed from election successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found in election' })
  async removeCandidateFromElection(@Param('id') id: string, @Param('candidateId') candidateId: string) {
    return this.electionService.removeCandidateFromElection(id, candidateId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get election history - comprehensive data for ended elections' })
  @ApiResponse({ status: 200, description: 'Election history retrieved successfully' })
  async getElectionHistory() {
    return this.electionService.getElectionHistory();
  }
} 