import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VoterService } from './voter.service';
import { CreateVoterDto, UpdateVoterDto } from './dto';

@ApiTags('Voter')
@Controller('voters')
export class VoterController {
  constructor(private readonly voterService: VoterService) {}

  @Get()
  @ApiOperation({ summary: 'Get all voters' })
  @ApiResponse({ status: 200, description: 'List of all voters' })
  async getAllVoters() {
    return this.voterService.getAllVoters();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new voter' })
  @ApiResponse({ status: 201, description: 'Voter created successfully' })
  @ApiResponse({ status: 409, description: 'Voter already exists' })
  async createVoter(@Body() createVoterDto: CreateVoterDto) {
    return this.voterService.createVoter(createVoterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get voter by ID' })
  @ApiResponse({ status: 200, description: 'Voter found' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async getVoterById(@Param('id') id: string) {
    return this.voterService.getVoterById(id);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get voter by student ID' })
  @ApiResponse({ status: 200, description: 'Voter found' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async getVoterByStudentId(@Param('studentId') studentId: string) {
    return this.voterService.getVoterByStudentId(studentId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update voter' })
  @ApiResponse({ status: 200, description: 'Voter updated successfully' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async updateVoter(@Param('id') id: string, @Body() updateVoterDto: UpdateVoterDto) {
    return this.voterService.updateVoter(id, updateVoterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete voter' })
  @ApiResponse({ status: 200, description: 'Voter deleted successfully' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async deleteVoter(@Param('id') id: string) {
    return this.voterService.deleteVoter(id);
  }

  @Put(':id/mark-voted')
  @ApiOperation({ summary: 'Mark voter as voted' })
  @ApiResponse({ status: 200, description: 'Voter marked as voted' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async markVoterAsVoted(@Param('id') id: string) {
    return this.voterService.markVoterAsVoted(id);
  }

  @Put(':id/reset-vote-status')
  @ApiOperation({ summary: 'Reset voter vote status' })
  @ApiResponse({ status: 200, description: 'Voter vote status reset' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async resetVoterVoteStatus(@Param('id') id: string) {
    return this.voterService.resetVoterVoteStatus(id);
  }

  @Get(':id/password')
  @ApiOperation({ summary: 'Get voter password (Admin only)' })
  @ApiResponse({ status: 200, description: 'Voter password retrieved' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getVoterPassword(@Param('id') id: string) {
    return this.voterService.getVoterPassword(id);
  }

  @Put(':id/reset-password')
  @ApiOperation({ summary: 'Reset voter password to student ID' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async resetVoterPassword(@Param('id') id: string) {
    return this.voterService.resetVoterPassword(id);
  }
} 