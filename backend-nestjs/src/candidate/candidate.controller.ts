import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto, UpdateCandidateDto } from './dto';

@ApiTags('Candidate')
@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({ status: 200, description: 'List of all candidates' })
  async getAllCandidates(@Request() req) {
    const showAll = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN');
    return this.candidateService.getAllCandidates(showAll);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async createCandidate(
    @Body() createCandidateDto: CreateCandidateDto,
    @UploadedFile() photo?: any
  ) {
    // Check if photo URL is provided in the form data
    const photoUrl = (createCandidateDto as any).photo;
    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('/uploads/')) {
      // Pass the URL string to the service
      return this.candidateService.createCandidate(createCandidateDto, photoUrl);
    }
    // Pass the uploaded file to the service
    return this.candidateService.createCandidate(createCandidateDto, photo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({ status: 200, description: 'Candidate found' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async getCandidateById(@Param('id') id: string) {
    return this.candidateService.getCandidateById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update candidate' })
  @ApiResponse({ status: 200, description: 'Candidate updated successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async updateCandidate(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @UploadedFile() photo?: any
  ) {
    // Check if photo URL is provided in the form data
    const photoUrl = (updateCandidateDto as any).photo;
    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('/uploads/')) {
      // Pass the URL string to the service
      return this.candidateService.updateCandidate(id, updateCandidateDto, photoUrl);
    }
    // Pass the uploaded file to the service
    return this.candidateService.updateCandidate(id, updateCandidateDto, photo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete candidate' })
  @ApiResponse({ status: 200, description: 'Candidate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async deleteCandidate(@Param('id') id: string) {
    return this.candidateService.deleteCandidate(id);
  }
} 