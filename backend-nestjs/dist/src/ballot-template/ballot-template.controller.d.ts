import { BallotTemplateService } from './ballot-template.service';
import { CreateBallotTemplateDto } from './dto/create-ballot-template.dto';
import { UpdateBallotTemplateDto } from './dto/update-ballot-template.dto';
import { CreateBallotFromTemplateDto } from './dto/create-ballot-from-template.dto';
export declare class BallotTemplateController {
    private readonly ballotTemplateService;
    constructor(ballotTemplateService: BallotTemplateService);
    createTemplate(createTemplateDto: CreateBallotTemplateDto, req: any): Promise<{
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
    getAllTemplates(includePublic?: string, req?: any): Promise<({
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
    updateTemplate(id: string, updateTemplateDto: UpdateBallotTemplateDto, req: any): Promise<{
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
    deleteTemplate(id: string, req: any): Promise<{
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
    cloneTemplate(id: string, newName: string, req: any): Promise<{
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
    createBallotFromTemplate(id: string, createBallotDto: CreateBallotFromTemplateDto, req: any): Promise<{
        id: string;
        electionId: string | null;
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
}
