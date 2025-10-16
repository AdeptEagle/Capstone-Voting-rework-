import { PositionService } from './position.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
export declare class PositionController {
    private readonly positionService;
    constructor(positionService: PositionService);
    getAllPositions(req: any): Promise<({
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
