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

@ApiTags('Election Assignment')
@Controller('election-assignments')
export class ElectionAssignmentController {
  constructor(
    private readonly electionAssignmentService: ElectionAssignmentService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all election assignments' })
  @ApiQuery({ name: 'electionId', required: false, description: 'Filter by election ID' })
  @ApiQuery({ name: 'candidateId', required: false, description: 'Filter by candidate ID' })
  @ApiResponse({ status: 200, description: 'List of all election assignments' })
  async getAllElectionAssignments(
    @Query('electionId') electionId?: string,
    @Query('candidateId') candidateId?: string,
  ) {
    return this.electionAssignmentService.getAllElectionAssignments(electionId, candidateId);
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

  @Get('election/:electionId/candidates')
  @ApiOperation({ summary: 'Get all candidates for a specific election' })
  @ApiResponse({ status: 200, description: 'Candidates for election retrieved successfully' })
  async getCandidatesForElection(@Param('electionId') electionId: string) {
    return this.electionAssignmentService.getCandidatesForElection(electionId);
  }

  @Get('candidate/:candidateId/elections')
  @ApiOperation({ summary: 'Get all elections for a specific candidate' })
  @ApiResponse({ status: 200, description: 'Elections for candidate retrieved successfully' })
  async getElectionsForCandidate(@Param('candidateId') candidateId: string) {
    return this.electionAssignmentService.getElectionsForCandidate(candidateId);
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign candidates to elections' })
  @ApiResponse({ status: 201, description: 'Bulk assignment completed successfully' })
  async bulkAssignCandidates(@Body() assignments: CreateElectionAssignmentDto[]) {
    return this.electionAssignmentService.bulkAssignCandidates(assignments);
  }

  @Delete('election/:electionId/candidate/:candidateId')
  @ApiOperation({ summary: 'Remove candidate from election' })
  @ApiResponse({ status: 200, description: 'Candidate removed from election successfully' })
  async removeCandidateFromElection(
    @Param('electionId') electionId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.electionAssignmentService.removeCandidateFromElection(electionId, candidateId);
  }

  // ===== ADVANCED ELECTION ASSIGNMENT FEATURES =====

  @Get('election/:electionId/positions')
  @ApiOperation({ summary: 'Get all positions assigned to an election' })
  @ApiResponse({ status: 200, description: 'Election positions retrieved successfully' })
  async getElectionPositions(@Param('electionId') electionId: string) {
    return this.electionAssignmentService.getElectionPositions(electionId);
  }

  @Get('election/:electionId/unassigned-positions')
  @ApiOperation({ summary: 'Get all positions NOT assigned to an election' })
  @ApiResponse({ status: 200, description: 'Unassigned positions retrieved successfully' })
  async getUnassignedPositions(@Param('electionId') electionId: string) {
    return this.electionAssignmentService.getUnassignedPositions(electionId);
  }

  @Get('election/:electionId/position-status')
  @ApiOperation({ summary: 'Get assignment status for positions in an election' })
  @ApiResponse({ status: 200, description: 'Position assignment status retrieved successfully' })
  async getPositionAssignmentStatus(@Param('electionId') electionId: string) {
    return this.electionAssignmentService.getPositionAssignmentStatus(electionId);
  }

  @Post('election/:electionId/assign-position/:positionId')
  @ApiOperation({ summary: 'Assign a position to an election' })
  @ApiResponse({ status: 201, description: 'Position assigned to election successfully' })
  async assignPositionToElection(
    @Param('electionId') electionId: string,
    @Param('positionId') positionId: string,
  ) {
    return this.electionAssignmentService.assignPositionToElection(electionId, positionId);
  }

  @Delete('election/:electionId/position/:positionId')
  @ApiOperation({ summary: 'Remove position from election' })
  @ApiResponse({ status: 200, description: 'Position removed from election successfully' })
  async removePositionFromElection(
    @Param('electionId') electionId: string,
    @Param('positionId') positionId: string,
  ) {
    return this.electionAssignmentService.removePositionFromElection(electionId, positionId);
  }

  @Get('election/:electionId/unassigned-candidates')
  @ApiOperation({ summary: 'Get all candidates NOT assigned to an election' })
  @ApiResponse({ status: 200, description: 'Unassigned candidates retrieved successfully' })
  async getUnassignedCandidates(@Param('electionId') electionId: string) {
    return this.electionAssignmentService.getUnassignedCandidates(electionId);
  }

  @Get('election/:electionId/candidate-status')
  @ApiOperation({ summary: 'Get assignment status for candidates in an election' })
  @ApiResponse({ status: 200, description: 'Candidate assignment status retrieved successfully' })
  async getCandidateAssignmentStatus(@Param('electionId') electionId: string) {
    return this.electionAssignmentService.getCandidateAssignmentStatus(electionId);
  }

  @Post('election/:electionId/assign-candidate/:candidateId')
  @ApiOperation({ summary: 'Assign a candidate to an election' })
  @ApiResponse({ status: 201, description: 'Candidate assigned to election successfully' })
  async assignCandidateToElection(
    @Param('electionId') electionId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.electionAssignmentService.assignCandidateToElection(electionId, candidateId);
  }

  @Get('election/:electionId/ballot')
  @ApiOperation({ summary: 'Get complete ballot for an election' })
  @ApiResponse({ status: 200, description: 'Ballot retrieved successfully' })
  async getElectionBallot(@Param('electionId') electionId: string) {
    return this.electionAssignmentService.getElectionBallot(electionId);
  }
} 