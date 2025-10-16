import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
export declare class PositionService {
    private prisma;
    private idGenerator;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService);
    getAllPositions(showAll?: boolean): Promise<({
        _count: {
            candidates: number;
            electionPositions: number;
            votes: number;
        };
    } & {
        id: string;
        Position_Title: string;
        Position_Description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        displayOrder: number;
        voteLimit: number;
    })[]>;
    createPosition(createPositionDto: CreatePositionDto): Promise<{
        message: string;
        position: {
            _count: {
                candidates: number;
                electionPositions: number;
                votes: number;
            };
        } & {
            id: string;
            Position_Title: string;
            Position_Description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            displayOrder: number;
            voteLimit: number;
        };
    }>;
    getPositionById(id: string): Promise<{
        _count: {
            candidates: number;
            electionPositions: number;
            votes: number;
        };
    } & {
        id: string;
        Position_Title: string;
        Position_Description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        displayOrder: number;
        voteLimit: number;
    }>;
    updatePosition(id: string, updatePositionDto: UpdatePositionDto): Promise<{
        message: string;
        position: {
            _count: {
                candidates: number;
                electionPositions: number;
                votes: number;
            };
        } & {
            id: string;
            Position_Title: string;
            Position_Description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            displayOrder: number;
            voteLimit: number;
        };
    }>;
    deletePosition(id: string): Promise<{
        message: string;
    }>;
}
