import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBallotTemplateDto } from './dto/create-ballot-template.dto';
import { UpdateBallotTemplateDto } from './dto/update-ballot-template.dto';
import { CreateBallotFromTemplateDto } from './dto/create-ballot-from-template.dto';
import { BallotService } from '../ballot/ballot.service';

@Injectable()
export class BallotTemplateService {
  constructor(
    private prisma: PrismaService,
    private ballotService: BallotService,
  ) {}

  async createTemplate(createTemplateDto: CreateBallotTemplateDto, createdBy: string) {
    const { name, description, templateData, isPublic } = createTemplateDto;

    // Validate template data structure
    this.validateTemplateData(templateData);

    return this.prisma.ballotTemplate.create({
      data: {
        id: this.generateId(),
        BallotTemplate_Name: name,
        BallotTemplate_Description: description,
        BallotTemplate_Data: templateData,
        BallotTemplate_IsPublic: isPublic || false,
        BallotTemplate_CreatedBy: createdBy,
      },
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
      },
    });
  }

  async getAllTemplates(includePublic: boolean = true, createdBy?: string) {
    const where: any = {
      BallotTemplate_IsDeleted: false,
    };

    if (!includePublic && createdBy) {
      where.BallotTemplate_CreatedBy = createdBy;
    } else if (includePublic && createdBy) {
      where.OR = [
        { BallotTemplate_CreatedBy: createdBy },
        { BallotTemplate_IsPublic: true },
      ];
    } else if (!includePublic) {
      where.BallotTemplate_IsPublic = false;
    }

    return this.prisma.ballotTemplate.findMany({
      where,
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
      },
      orderBy: {
        BallotTemplate_CreatedAt: 'desc',
      },
    });
  }

  async getTemplateById(id: string) {
    const template = await this.prisma.ballotTemplate.findFirst({
      where: {
        id,
        BallotTemplate_IsDeleted: false,
      },
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Ballot template not found');
    }

    return template;
  }

  async updateTemplate(id: string, updateTemplateDto: UpdateBallotTemplateDto, updatedBy: string) {
    const template = await this.getTemplateById(id);

    // Check if user has permission to update
    if (template.BallotTemplate_CreatedBy !== updatedBy) {
      throw new BadRequestException('You can only update your own templates');
    }

    const { name, description, templateData, isPublic } = updateTemplateDto;

    if (templateData) {
      this.validateTemplateData(templateData);
    }

    return this.prisma.ballotTemplate.update({
      where: { id },
      data: {
        ...(name && { BallotTemplate_Name: name }),
        ...(description !== undefined && { BallotTemplate_Description: description }),
        ...(templateData && { BallotTemplate_Data: templateData }),
        ...(isPublic !== undefined && { BallotTemplate_IsPublic: isPublic }),
      },
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
      },
    });
  }

  async deleteTemplate(id: string, deletedBy: string) {
    const template = await this.getTemplateById(id);

    // Check if user has permission to delete
    if (template.BallotTemplate_CreatedBy !== deletedBy) {
      throw new BadRequestException('You can only delete your own templates');
    }

    return this.prisma.ballotTemplate.update({
      where: { id },
      data: {
        BallotTemplate_IsDeleted: true,
        BallotTemplate_DeletedAt: new Date(),
      },
    });
  }

  async createBallotFromTemplate(templateId: string, createBallotDto: CreateBallotFromTemplateDto, createdBy: string) {
    console.log('🔍 Template Service - createBallotFromTemplate called');
    console.log('📋 Template ID:', templateId);
    console.log('📝 Create Ballot DTO:', createBallotDto);
    console.log('👤 Created By:', createdBy);
    
    // Debug database state
    console.log('🗄️ Database State Debug:');
    
    // Check departments
    const departments = await this.prisma.department.findMany({
      where: { isDeleted: false },
      select: { id: true, Department_Name: true, _count: { select: { courses: true } } }
    });
    console.log('🏢 Departments:', departments);
    
    // Check courses
    const courses = await this.prisma.course.findMany({
      where: { isDeleted: false },
      select: { id: true, Course_Name: true, Course_Code: true, departmentId: true, _count: { select: { candidates: true } } }
    });
    console.log('📚 Courses:', courses);
    
    // Check positions
    const positions = await this.prisma.position.findMany({
      select: { id: true, Position_Title: true, _count: { select: { candidates: true } } }
    });
    console.log('💼 Positions:', positions);
    
    // Check candidates
    const candidates = await this.prisma.candidate.findMany({
      where: { isDeleted: false },
      select: { id: true, Candidate_Name: true, positionId: true, departmentId: true, courseId: true }
    });
    console.log('👥 Candidates:', candidates);
    
    if (!createdBy) {
      throw new Error('User ID is required');
    }
    
    const template = await this.getTemplateById(templateId);
    const templateData = template.BallotTemplate_Data as any;
    
    console.log('📊 Template Data:', templateData);

    // Extract ballot configuration from template
    const ballotConfig = {
      Ballot_Title: createBallotDto.title || templateData.title,
      Ballot_Description: createBallotDto.description || templateData.description,
      Ballot_StartDate: createBallotDto.startDate,
      Ballot_EndDate: createBallotDto.endDate,
      Ballot_RequireAllPositions: templateData.requireAllPositions !== false,
      Ballot_ShowResults: templateData.showResults !== false,
      Ballot_ShowResultsAfter: createBallotDto.showResultsAfter,
      Ballot_ShowLiveResults: templateData.showLiveResults !== false,
      templateId: templateId, // Pass template ID to create positions from template
      candidateIds: createBallotDto.candidateIds || [], // Use provided candidates or empty array
    };

    // Create the ballot using template-specific method
    const ballot = await this.ballotService.createBallotFromTemplate(ballotConfig, createdBy);

    // Positions are now automatically created in the ballot service
    console.log('✅ Positions will be created automatically from template data');

    // Add selected candidates to the ballot if provided
    if (createBallotDto.candidateIds && createBallotDto.candidateIds.length > 0) {
      console.log('🎯 Adding candidates to ballot:', createBallotDto.candidateIds);
      console.log('👥 Candidate count:', createBallotDto.candidateIds.length);
      
      // Debug candidate data
      const candidateDetails = await this.prisma.candidate.findMany({
        where: { 
          id: { in: createBallotDto.candidateIds },
          isDeleted: false,
        },
        select: { id: true, Candidate_Name: true, positionId: true, position: { select: { Position_Title: true } } }
      });
      console.log('👥 Candidate details:', candidateDetails);
      
      try {
        await this.addCandidatesToBallot(ballot.id, createBallotDto.candidateIds);
        console.log('✅ Successfully added candidates to ballot');
      } catch (error) {
        console.error('❌ Error adding candidates to ballot:', error);
        throw error;
      }
    } else {
      console.log('⚠️ No candidates provided for ballot');
    }

    console.log('🎉 Ballot creation completed successfully');
    return ballot;
  }

  async cloneTemplate(templateId: string, newName: string, createdBy: string) {
    const originalTemplate = await this.getTemplateById(templateId);
    
    return this.prisma.ballotTemplate.create({
      data: {
        id: this.generateId(),
        BallotTemplate_Name: newName,
        BallotTemplate_Description: originalTemplate.BallotTemplate_Description,
        BallotTemplate_Data: originalTemplate.BallotTemplate_Data,
        BallotTemplate_IsPublic: false, // Cloned templates are private by default
        BallotTemplate_CreatedBy: createdBy,
      },
      include: {
        createdByAdmin: {
          select: {
            id: true,
            Admin_Username: true,
            Admin_Email: true,
          },
        },
      },
    });
  }

  private validateTemplateData(templateData: any) {
    if (!templateData || typeof templateData !== 'object') {
      throw new BadRequestException('Template data must be a valid object');
    }

    // Validate required fields
    if (!templateData.title) {
      throw new BadRequestException('Template must have a title');
    }

    // Validate positions if provided
    if (templateData.positions) {
      if (!Array.isArray(templateData.positions)) {
        throw new BadRequestException('Positions must be an array');
      }

      for (const position of templateData.positions) {
        if (!position.positionId) {
          throw new BadRequestException('Each position must have a positionId');
        }
      }
    }
  }

  private async addPositionToBallot(ballotId: string, positionData: {
    positionId: string;
    displayOrder: number;
    isRequired: boolean;
  }) {
    return this.prisma.ballotPosition.create({
      data: {
        id: this.generateId(),
        BallotPosition_BallotId: ballotId,
        BallotPosition_PositionId: positionData.positionId,
        BallotPosition_DisplayOrder: positionData.displayOrder,
        BallotPosition_IsRequired: positionData.isRequired,
      },
    });
  }

  private async addCandidatesToBallot(ballotId: string, candidateIds: string[]) {
    console.log('🎯 Adding candidates to ballot:', ballotId, candidateIds);
    
    try {
      // Remove duplicates from candidate IDs
      const uniqueCandidateIds = [...new Set(candidateIds)];
      console.log('🔍 Unique candidate IDs:', uniqueCandidateIds);
      
      // Get candidates with their position information
      const candidates = await this.prisma.candidate.findMany({
        where: { 
          id: { in: uniqueCandidateIds },
          isDeleted: false,
        },
        select: { id: true, positionId: true }
      });

      console.log('🔍 Found candidates:', candidates);

      // Add each candidate to the ballot
      for (const candidate of candidates) {
        try {
          // Check if candidate is already in the ballot
          const existingCandidate = await this.prisma.ballotCandidate.findFirst({
            where: {
              BallotCandidate_BallotId: ballotId,
              BallotCandidate_CandidateId: candidate.id,
            },
          });

          if (existingCandidate) {
            console.log('⚠️ Candidate already in ballot:', candidate.id);
            continue;
          }

          await this.prisma.ballotCandidate.create({
            data: {
              id: this.generateId(),
              BallotCandidate_BallotId: ballotId,
              BallotCandidate_CandidateId: candidate.id,
              BallotCandidate_PositionId: candidate.positionId,
            },
          });
          console.log('✅ Added candidate:', candidate.id, 'to ballot:', ballotId);
        } catch (error) {
          console.error('❌ Error adding candidate:', candidate.id, 'Error:', error);
          throw error;
        }
      }

      console.log('✅ Successfully added all candidates to ballot');
    } catch (error) {
      console.error('❌ Error in addCandidatesToBallot:', error);
      throw error;
    }
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
