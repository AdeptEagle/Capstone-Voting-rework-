import { PrismaService } from '../prisma/prisma.service';
import { CreatePartyListDto, UpdatePartyListDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { FileUploadService } from '../services/file-upload.service';
export declare class PartyListService {
    private prisma;
    private idGenerator;
    private fileUploadService;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, fileUploadService: FileUploadService);
    create(createPartyListDto: CreatePartyListDto, logo?: Express.Multer.File): Promise<{
        candidates: {
            position: {
                Position_Title: string;
            };
            id: string;
            Candidate_Name: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        name: string;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
    findAll(): Promise<({
        candidates: {
            position: {
                Position_Title: string;
            };
            id: string;
            Candidate_Name: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        name: string;
        description: string | null;
        color: string | null;
        logo: string | null;
    })[]>;
    findOne(id: string): Promise<{
        candidates: {
            position: {
                Position_Title: string;
            };
            id: string;
            Candidate_Name: string;
            Candidate_Email: string;
            course: {
                Course_Name: string;
            };
            department: {
                Department_Name: string;
            };
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        name: string;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
    update(id: string, updatePartyListDto: UpdatePartyListDto, logo?: Express.Multer.File): Promise<{
        candidates: {
            position: {
                Position_Title: string;
            };
            id: string;
            Candidate_Name: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        name: string;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        name: string;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
    getStatistics(): Promise<{
        totalPartyLists: number;
        partyLists: {
            id: string;
            _count: {
                candidates: number;
            };
            name: string;
            color: string;
        }[];
    }>;
}
