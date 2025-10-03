import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto, UpdateCandidateDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Candidate')
@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService
  ) {}

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
    console.log('📸 Controller - Create - Photo received:', photo);
    console.log('📸 Controller - Create - Photo type:', typeof photo);
    console.log('📸 Controller - Create - Photo properties:', photo ? Object.keys(photo) : 'No photo');
    console.log('📸 Controller - Create - CreateCandidateDto:', createCandidateDto);
    
    // Check if photo URL is provided in the form data
    const photoUrl = (createCandidateDto as any).photo;
    if (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('https://res.cloudinary.com/'))) {
      console.log('📸 Controller - Create - Using existing photo URL:', photoUrl);
      // Pass the URL string to the service
      return this.candidateService.createCandidate(createCandidateDto, photoUrl);
    }
    console.log('📸 Controller - Create - Using uploaded file:', photo);
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
    console.log('📸 Controller - Photo received:', photo);
    console.log('📸 Controller - Photo type:', typeof photo);
    console.log('📸 Controller - Photo properties:', photo ? Object.keys(photo) : 'No photo');
    console.log('📸 Controller - UpdateCandidateDto:', updateCandidateDto);
    
    // Check if photo URL is provided in the form data
    const photoUrl = (updateCandidateDto as any).photo;
    if (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('https://res.cloudinary.com/'))) {
      console.log('📸 Controller - Using existing photo URL:', photoUrl);
      // Pass the URL string to the service
      return this.candidateService.updateCandidate(id, updateCandidateDto, photoUrl);
    }
    console.log('📸 Controller - Using uploaded file:', photo);
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