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

  async generateBallotId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.ballot, 'BALLOT', format);
  }

  async generateVoteId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.vote, 'VOTE', format);
  }

  async generateBallotPositionId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.ballotPosition, 'BALLOTPOS', format);
  }

  async generateBallotCandidateId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.ballotCandidate, 'BALLOTCAND', format);
  }

  async generatePasswordResetTokenId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.passwordResetToken, 'PWD', format);
  }

  async generateAdminLoginLogId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.adminLoginLog, 'ADMINLOG', format);
  }

  async generateUserLoginLogId(format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    return this.generateCustomId(this.prisma.userLoginLog, 'USERLOG', format);
  }

  // Generic method for any model
  async generateId(modelName: string, format: 'simple' | 'padded' | 'year' = 'simple'): Promise<string> {
    const modelMap: { [key: string]: any } = {
      admin: this.prisma.admin,
      department: this.prisma.department,
      course: this.prisma.course,
      position: this.prisma.position,
      candidate: this.prisma.candidate,
      voter: this.prisma.voter,
      ballot: this.prisma.ballot,
      vote: this.prisma.vote,
      admin_login_log: this.prisma.adminLoginLog,
      user_login_log: this.prisma.userLoginLog,
      partylist: this.prisma.partyList,
    };
    
    const model = modelMap[modelName.toLowerCase()];
    if (!model) {
      throw new Error(`Unknown model: ${modelName}`);
    }
    
    const count = await model.count();
    const number = count + 1;
    
    switch (format) {
      case 'padded':
        return `${modelName.toUpperCase()}-${number.toString().padStart(3, '0')}`;
      case 'year':
        const year = new Date().getFullYear();
        return `${modelName.toUpperCase()}-${year}-${number}`;
      default:
        return `${modelName.toUpperCase()}-${number}`;
    }
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
      ballot: this.prisma.ballot,
      vote: this.prisma.vote,
      partylist: this.prisma.partyList,
    };
    
    const model = modelMap[modelName.toLowerCase()];
    if (!model) {
      throw new Error(`Unknown model: ${modelName}`);
    }
    
    return model.count();
  }
} 