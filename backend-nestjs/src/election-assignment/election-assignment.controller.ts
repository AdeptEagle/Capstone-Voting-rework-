import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ElectionAssignmentService } from './election-assignment.service';
import { 
  CreateElectionAssignmentDto, 
  UpdateElectionAssignmentDto,
  AssignPositionDto,
  AssignCandidateDto
} from './dto';

@ApiTags('Ballot Assignment')
@Controller('ballot-assignments')
export class ElectionAssignmentController {
  constructor(
    private readonly electionAssignmentService: ElectionAssignmentService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all ballot assignments' })
  @ApiQuery({ name: 'ballotId', required: false, description: 'Filter by ballot ID' })
  @ApiQuery({ name: 'candidateId', required: false, description: 'Filter by candidate ID' })
  @ApiResponse({ status: 200, description: 'List of all ballot assignments' })
  async getAllBallotAssignments(
    @Query('ballotId') ballotId?: string,
    @Query('candidateId') candidateId?: string,
  ) {
    return this.electionAssignmentService.getAllElectionAssignments(ballotId, candidateId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new election assignment' })
  @ApiResponse({ status: 201, description: 'Election assignment created successfully' })
  async createElectionAssignment(
    @Body() createElectionAssignmentDto: CreateElectionAssignmentDto,
  ) {
    return this.electionAssignmentService.createElectionAssignment(createElectionAssignmentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get election assignment by ID' })
  @ApiResponse({ status: 200, description: 'Election assignment found' })
  @ApiResponse({ status: 404, description: 'Election assignment not found' })
  async getElectionAssignmentById(@Param('id') id: string) {
    return this.electionAssignmentService.getElectionAssignmentById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update election assignment' })
  @ApiResponse({ status: 200, description: 'Election assignment updated successfully' })
  @ApiResponse({ status: 404, description: 'Election assignment not found' })
  async updateElectionAssignment(
    @Param('id') id: string,
    @Body() updateElectionAssignmentDto: UpdateElectionAssignmentDto,
  ) {
    return this.electionAssignmentService.updateElectionAssignment(id, updateElectionAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete election assignment' })
  @ApiResponse({ status: 200, description: 'Election assignment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Election assignment not found' })
  async deleteElectionAssignment(@Param('id') id: string) {
    return this.electionAssignmentService.deleteElectionAssignment(id);
  }

  @Get('ballot/:ballotId/candidates')
  @ApiOperation({ summary: 'Get all candidates for a specific ballot' })
  @ApiResponse({ status: 200, description: 'Candidates for ballot retrieved successfully' })
  async getCandidatesForBallot(@Param('ballotId') ballotId: string) {
    return this.electionAssignmentService.getCandidatesForElection(ballotId);
  }

  @Get('candidate/:candidateId/ballots')
  @ApiOperation({ summary: 'Get all ballots for a specific candidate' })
  @ApiResponse({ status: 200, description: 'Ballots for candidate retrieved successfully' })
  async getBallotsForCandidate(@Param('candidateId') candidateId: string) {
    return this.electionAssignmentService.getElectionsForCandidate(candidateId);
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign candidates to ballots' })
  @ApiResponse({ status: 201, description: 'Bulk assignment completed successfully' })
  async bulkAssignCandidates(@Body() assignments: CreateElectionAssignmentDto[]) {
    return this.electionAssignmentService.bulkAssignCandidates(assignments);
  }

  @Delete('ballot/:ballotId/candidate/:candidateId')
  @ApiOperation({ summary: 'Remove candidate from ballot' })
  @ApiResponse({ status: 200, description: 'Candidate removed from ballot successfully' })
  async removeCandidateFromBallot(
    @Param('ballotId') ballotId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.electionAssignmentService.removeCandidateFromElection(ballotId, candidateId);
  }

  // ===== ADVANCED ELECTION ASSIGNMENT FEATURES =====

  @Get('ballot/:ballotId/positions')
  @ApiOperation({ summary: 'Get all positions assigned to a ballot' })
  @ApiResponse({ status: 200, description: 'Ballot positions retrieved successfully' })
  async getBallotPositions(@Param('ballotId') ballotId: string) {
    return this.electionAssignmentService.getElectionPositions(ballotId);
  }

  @Get('ballot/:ballotId/unassigned-positions')
  @ApiOperation({ summary: 'Get all positions NOT assigned to a ballot' })
  @ApiResponse({ status: 200, description: 'Unassigned positions retrieved successfully' })
  async getUnassignedPositions(@Param('ballotId') ballotId: string) {
    return this.electionAssignmentService.getUnassignedPositions(ballotId);
  }

  @Get('ballot/:ballotId/position-status')
  @ApiOperation({ summary: 'Get assignment status for positions in a ballot' })
  @ApiResponse({ status: 200, description: 'Position assignment status retrieved successfully' })
  async getPositionAssignmentStatus(@Param('ballotId') ballotId: string) {
    return this.electionAssignmentService.getPositionAssignmentStatus(ballotId);
  }

  @Post('ballot/:ballotId/assign-position/:positionId')
  @ApiOperation({ summary: 'Assign a position to a ballot' })
  @ApiResponse({ status: 201, description: 'Position assigned to ballot successfully' })
  async assignPositionToBallot(
    @Param('ballotId') ballotId: string,
    @Param('positionId') positionId: string,
  ) {
    return this.electionAssignmentService.assignPositionToElection(ballotId, positionId);
  }

  @Delete('ballot/:ballotId/position/:positionId')
  @ApiOperation({ summary: 'Remove position from ballot' })
  @ApiResponse({ status: 200, description: 'Position removed from ballot successfully' })
  async removePositionFromBallot(
    @Param('ballotId') ballotId: string,
    @Param('positionId') positionId: string,
  ) {
    return this.electionAssignmentService.removePositionFromElection(ballotId, positionId);
  }

  @Get('ballot/:ballotId/unassigned-candidates')
  @ApiOperation({ summary: 'Get all candidates NOT assigned to a ballot' })
  @ApiResponse({ status: 200, description: 'Unassigned candidates retrieved successfully' })
  async getUnassignedCandidates(@Param('ballotId') ballotId: string) {
    return this.electionAssignmentService.getUnassignedCandidates(ballotId);
  }

  @Get('ballot/:ballotId/candidate-status')
  @ApiOperation({ summary: 'Get assignment status for candidates in a ballot' })
  @ApiResponse({ status: 200, description: 'Candidate assignment status retrieved successfully' })
  async getCandidateAssignmentStatus(@Param('ballotId') ballotId: string) {
    return this.electionAssignmentService.getCandidateAssignmentStatus(ballotId);
  }

  @Post('ballot/:ballotId/assign-candidate/:candidateId')
  @ApiOperation({ summary: 'Assign a candidate to a ballot' })
  @ApiResponse({ status: 201, description: 'Candidate assigned to ballot successfully' })
  async assignCandidateToBallot(
    @Param('ballotId') ballotId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.electionAssignmentService.assignCandidateToElection(ballotId, candidateId);
  }

  @Get('ballot/:ballotId/complete')
  @ApiOperation({ summary: 'Get complete ballot details' })
  @ApiResponse({ status: 200, description: 'Ballot retrieved successfully' })
  async getBallotDetails(@Param('ballotId') ballotId: string) {
    return this.electionAssignmentService.getElectionBallot(ballotId);
  }
} 