import { PrismaService } from '../prisma/prisma.service';
export declare class IdGeneratorService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateCustomId;
    generateAdminId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateDepartmentId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateCourseId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generatePositionId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateCandidateId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateVoterId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateBallotId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateVoteId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateBallotPositionId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateBallotCandidateId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generatePasswordResetTokenId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateAdminLoginLogId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateUserLoginLogId(format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateId(modelName: string, format?: 'simple' | 'padded' | 'year'): Promise<string>;
    generateCustomFormatId(model: any, prefix: string, format?: 'simple' | 'padded' | 'year'): Promise<string>;
    getModelCount(modelName: string): Promise<number>;
}
