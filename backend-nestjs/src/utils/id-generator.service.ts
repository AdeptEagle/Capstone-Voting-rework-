import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdGeneratorService {
  constructor(private prisma: PrismaService) {}

  // Configurable ID generation with custom prefixes
  private async generateCustomId(
    model: any,
    prefix: string,
    format: 'simple' | 'padded' | 'year' = 'simple'
  ): Promise<string> {
    const count = await model.count();
    const number = count + 1;
    
    switch (format) {
      case 'padded':
        return `${prefix}-${number.toString().padStart(3, '0')}`;
      case 'year':
        const year = new Date().getFullYear();
        return `${prefix}-${year}-${number}`;
      default:
        return `${prefix}-${number}`;
    }
  }

  async generateAdminId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.admin, 'ADMIN', format);
  }

  async generateDepartmentId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.department, 'DEPT', format);
  }

  async generateCourseId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.course, 'COURSE', format);
  }

  async generatePositionId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.position, 'POS', format);
  }

  async generateCandidateId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.candidate, 'CAND', format);
  }

  async generateVoterId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.voter, 'VTR', format);
  }

  async generateElectionId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.election, 'ELEC', format);
  }

  async generateVoteId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.vote, 'VOTE', format);
  }

  async generateElectionPositionId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.electionPosition, 'ELECPOS', format);
  }

  async generateElectionCandidateId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.electionCandidate, 'ELECCAND', format);
  }

  async generatePasswordResetTokenId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.passwordResetToken, 'PWD', format);
  }

  // Advanced customization methods
  async generateCustomFormatId(
    model: any,
    prefix: string,
    format: 'simple' | 'padded' | 'year' = 'simple'
  ): Promise<string> {
    return this.generateCustomId(model, prefix, format);
  }

  // Get current count for any model
  async getModelCount(modelName: string): Promise<number> {
    const modelMap: { [key: string]: any } = {
      admin: this.prisma.admin,
      department: this.prisma.department,
      course: this.prisma.course,
      position: this.prisma.position,
      candidate: this.prisma.candidate,
      voter: this.prisma.voter,
      election: this.prisma.election,
      vote: this.prisma.vote,
    };
    
    const model = modelMap[modelName.toLowerCase()];
    if (!model) {
      throw new Error(`Unknown model: ${modelName}`);
    }
    
    return model.count();
  }
} 