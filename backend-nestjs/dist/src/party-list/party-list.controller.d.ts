import { PartyListService } from './party-list.service';
import { CreatePartyListDto, UpdatePartyListDto } from './dto';
export declare class PartyListController {
    private readonly partyListService;
    constructor(partyListService: PartyListService);
    create(createPartyListDto: CreatePartyListDto, logo?: Express.Multer.File): Promise<{
        candidates: {
            id: string;
            position: {
                Position_Title: string;
            };
            Candidate_Name: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
    findAll(): Promise<({
        candidates: {
            id: string;
            position: {
                Position_Title: string;
            };
            Candidate_Name: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        description: string | null;
        color: string | null;
        logo: string | null;
    })[]>;
    getStatistics(): Promise<{
        totalPartyLists: number;
        partyLists: {
            id: string;
            name: string;
            _count: {
                candidates: number;
            };
            color: string;
        }[];
    }>;
    findOne(id: string): Promise<{
        candidates: {
            id: string;
            department: {
                Department_Name: string;
            };
            course: {
                Course_Name: string;
            };
            position: {
                Position_Title: string;
            };
            Candidate_Name: string;
            Candidate_Email: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
    update(id: string, updatePartyListDto: UpdatePartyListDto, logo?: Express.Multer.File): Promise<{
        candidates: {
            id: string;
            position: {
                Position_Title: string;
            };
            Candidate_Name: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        description: string | null;
        color: string | null;
        logo: string | null;
    }>;
}
