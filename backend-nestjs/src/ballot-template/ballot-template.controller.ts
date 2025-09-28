import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BallotTemplateService } from './ballot-template.service';
import { CreateBallotTemplateDto } from './dto/create-ballot-template.dto';
import { UpdateBallotTemplateDto } from './dto/update-ballot-template.dto';
import { CreateBallotFromTemplateDto } from './dto/create-ballot-from-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ballot-templates')
@UseGuards(JwtAuthGuard)
export class BallotTemplateController {
  constructor(private readonly ballotTemplateService: BallotTemplateService) {}

  @Post()
  async createTemplate(@Body() createTemplateDto: CreateBallotTemplateDto, @Request() req) {
    return this.ballotTemplateService.createTemplate(createTemplateDto, req.user.id);
  }

  @Get()
  async getAllTemplates(
    @Query('includePublic') includePublic?: string,
    @Request() req?: any,
  ) {
    const includePublicBool = includePublic === 'true';
    return this.ballotTemplateService.getAllTemplates(includePublicBool, req.user?.id);
  }

  @Get(':id')
  async getTemplateById(@Param('id') id: string) {
    return this.ballotTemplateService.getTemplateById(id);
  }

  @Put(':id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateBallotTemplateDto,
    @Request() req,
  ) {
    return this.ballotTemplateService.updateTemplate(id, updateTemplateDto, req.user.id);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string, @Request() req) {
    return this.ballotTemplateService.deleteTemplate(id, req.user.id);
  }

  @Post(':id/clone')
  async cloneTemplate(
    @Param('id') id: string,
    @Body('name') newName: string,
    @Request() req,
  ) {
    return this.ballotTemplateService.cloneTemplate(id, newName, req.user.id);
  }

  @Post(':id/create-ballot')
  async createBallotFromTemplate(
    @Param('id') id: string,
    @Body() createBallotDto: CreateBallotFromTemplateDto,
    @Request() req,
  ) {
    console.log('🎯 Controller - createBallotFromTemplate called');
    console.log('📋 Template ID:', id);
    console.log('📝 DTO:', createBallotDto);
    console.log('👤 User ID:', req.user?.id);
    
    try {
      const result = await this.ballotTemplateService.createBallotFromTemplate(id, createBallotDto, req.user.id);
      console.log('✅ Controller - Ballot created successfully');
      return result;
    } catch (error) {
      console.error('❌ Controller - Error creating ballot:', error);
      throw error;
    }
  }
}
