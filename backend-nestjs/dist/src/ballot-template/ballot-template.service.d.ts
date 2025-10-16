import { PrismaService } from '../prisma/prisma.service';
import { CreateBallotTemplateDto } from './dto/create-ballot-template.dto';
import { UpdateBallotTemplateDto } from './dto/update-ballot-template.dto';
import { CreateBallotFromTemplateDto } from './dto/create-ballot-from-template.dto';
import { BallotService } from '../ballot/ballot.service';
export declare class BallotTemplateService {
    private prisma;
    private ballotService;
    constructor(prisma: PrismaService, ballotService: BallotService);
    createTemplate(createTemplateDto: CreateBallotTemplateDto, createdBy: string): Promise<{
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        BallotTemplate_Name: string;
        BallotTemplate_Description: string | null;
        BallotTemplate_Data: import("@prisma/client/runtime/library").JsonValue;
        BallotTemplate_IsPublic: boolean;
        BallotTemplate_CreatedBy: string;
        BallotTemplate_CreatedAt: Date;
        BallotTemplate_UpdatedAt: Date;
        BallotTemplate_DeletedAt: Date | null;
        BallotTemplate_IsDeleted: boolean;
    }>;
    getAllTemplates(includePublic?: boolean, createdBy?: string): Promise<({
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        BallotTemplate_Name: string;
        BallotTemplate_Description: string | null;
        BallotTemplate_Data: import("@prisma/client/runtime/library").JsonValue;
        BallotTemplate_IsPublic: boolean;
        BallotTemplate_CreatedBy: string;
        BallotTemplate_CreatedAt: Date;
        BallotTemplate_UpdatedAt: Date;
        BallotTemplate_DeletedAt: Date | null;
        BallotTemplate_IsDeleted: boolean;
    })[]>;
    getTemplateById(id: string): Promise<{
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        BallotTemplate_Name: string;
        BallotTemplate_Description: string | null;
        BallotTemplate_Data: import("@prisma/client/runtime/library").JsonValue;
        BallotTemplate_IsPublic: boolean;
        BallotTemplate_CreatedBy: string;
        BallotTemplate_CreatedAt: Date;
        BallotTemplate_UpdatedAt: Date;
        BallotTemplate_DeletedAt: Date | null;
        BallotTemplate_IsDeleted: boolean;
    }>;
    updateTemplate(id: string, updateTemplateDto: UpdateBallotTemplateDto, updatedBy: string): Promise<{
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        BallotTemplate_Name: string;
        BallotTemplate_Description: string | null;
        BallotTemplate_Data: import("@prisma/client/runtime/library").JsonValue;
        BallotTemplate_IsPublic: boolean;
        BallotTemplate_CreatedBy: string;
        BallotTemplate_CreatedAt: Date;
        BallotTemplate_UpdatedAt: Date;
        BallotTemplate_DeletedAt: Date | null;
        BallotTemplate_IsDeleted: boolean;
    }>;
    deleteTemplate(id: string, deletedBy: string): Promise<{
        id: string;
        BallotTemplate_Name: string;
        BallotTemplate_Description: string | null;
        BallotTemplate_Data: import("@prisma/client/runtime/library").JsonValue;
        BallotTemplate_IsPublic: boolean;
        BallotTemplate_CreatedBy: string;
        BallotTemplate_CreatedAt: Date;
        BallotTemplate_UpdatedAt: Date;
        BallotTemplate_DeletedAt: Date | null;
        BallotTemplate_IsDeleted: boolean;
    }>;
    createBallotFromTemplate(templateId: string, createBallotDto: CreateBallotFromTemplateDto, createdBy: string): Promise<{
        id: string;
        Ballot_Title: string;
        Ballot_Description: string | null;
        Ballot_StartDate: Date;
        Ballot_EndDate: Date;
        Ballot_Status: import(".prisma/client").$Enums.BallotStatus;
        Ballot_IsActive: boolean;
        Ballot_MaxVotesPerUser: number;
        Ballot_AllowMultipleVotes: boolean;
        Ballot_RequireAllPositions: boolean;
        Ballot_ShowResults: boolean;
        Ballot_ShowResultsAfter: Date | null;
        Ballot_ShowLiveResults: boolean;
        Ballot_AllowAbstain: boolean;
        Ballot_CreatedBy: string;
        Ballot_CreatedAt: Date;
        Ballot_UpdatedAt: Date;
        Ballot_DeletedAt: Date | null;
        Ballot_IsDeleted: boolean;
    }>;
    cloneTemplate(templateId: string, newName: string, createdBy: string): Promise<{
        createdByAdmin: {
            id: string;
            Admin_Username: string;
            Admin_Email: string;
        };
    } & {
        id: string;
        BallotTemplate_Name: string;
        BallotTemplate_Description: string | null;
        BallotTemplate_Data: import("@prisma/client/runtime/library").JsonValue;
        BallotTemplate_IsPublic: boolean;
        BallotTemplate_CreatedBy: string;
        BallotTemplate_CreatedAt: Date;
        BallotTemplate_UpdatedAt: Date;
        BallotTemplate_DeletedAt: Date | null;
        BallotTemplate_IsDeleted: boolean;
    }>;
    private validateTemplateData;
    private addPositionToBallot;
    private addCandidatesToBallot;
    private generateId;
}
