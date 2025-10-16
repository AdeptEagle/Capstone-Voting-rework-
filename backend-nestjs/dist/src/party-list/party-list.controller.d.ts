import { PartyListService } from './party-list.service';
import { CreatePartyListDto, UpdatePartyListDto } from './dto';
export declare class PartyListController {
    private readonly partyListService;
    constructor(partyListService: PartyListService);
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
}
