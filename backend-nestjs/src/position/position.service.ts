import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';

@Injectable()
export class PositionService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async getAllPositions(showAll: boolean = false) {
    console.log(`[PositionService] getAllPositions called with showAll: ${showAll}`);
    
    const whereClause = showAll ? {} : { isDeleted: false };
    console.log(`[PositionService] Using where clause:`, whereClause);
    
    const positions = await this.prisma.position.findMany({
      where: whereClause,
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          Position_Title: 'asc',
        },
      ],
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
            electionPositions: true,
          },
        },
      },
    });
    
    console.log(`[PositionService] Found ${positions.length} positions`);
    console.log(`[PositionService] Position IDs:`, positions.map(p => ({ id: p.id, title: p.Position_Title, isDeleted: p.isDeleted })));
    
    return positions;
  }

  async createPosition(createPositionDto: CreatePositionDto) {
    const { id, Position_Title, Position_Description, voteLimit, displayOrder } = createPositionDto;

    // Check if position with this title already exists
    const existingPosition = await this.prisma.position.findFirst({
      where: { Position_Title: Position_Title },
    });

    if (existingPosition) {
      throw new ConflictException('Position with this title already exists');
    }

    // If custom ID is provided, check if it already exists
    if (id) {
      const existingPositionWithId = await this.prisma.position.findUnique({
        where: { id: id },
      });

      if (existingPositionWithId) {
        throw new ConflictException(`Position with ID "${id}" already exists`);
      }
    }

    // Use provided ID if available, otherwise generate one
    const positionId = id || await this.idGenerator.generatePositionId();

    const position = await this.prisma.position.create({
      data: {
        id: positionId,
        Position_Title: Position_Title,
        Position_Description: Position_Description,
        voteLimit: voteLimit || 1,
        displayOrder: displayOrder || 0,
      },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
            electionPositions: true,
          },
        },
      },
    });

    return {
      message: 'Position created successfully!',
      position,
    };
  }

  async getPositionById(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
            electionPositions: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    // Check if position is soft-deleted
    if (position.isDeleted) {
      throw new NotFoundException('Position has been deleted');
    }

    return position;
  }

  async updatePosition(id: string, updatePositionDto: UpdatePositionDto) {
    const { Position_Title, Position_Description, voteLimit, displayOrder } = updatePositionDto;

    // Check if position exists
    const existingPosition = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!existingPosition) {
      throw new NotFoundException('Position not found');
    }

    // Check if title is already taken by another position
    if (Position_Title && Position_Title !== existingPosition.Position_Title) {
      const conflictingPosition = await this.prisma.position.findFirst({
        where: {
          Position_Title: Position_Title,
          NOT: { id },
        },
      });

      if (conflictingPosition) {
        throw new ConflictException('Position with this title already exists');
      }
    }

    const position = await this.prisma.position.update({
      where: { id },
      data: {
        Position_Title: Position_Title,
        Position_Description: Position_Description,
        voteLimit,
        displayOrder,
      },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
            electionPositions: true,
          },
        },
      },
    });

    return {
      message: 'Position updated successfully!',
      position,
    };
  }

  async deletePosition(id: string) {
    console.log(`[PositionService] deletePosition called with ID: "${id}"`);
    console.log(`[PositionService] ID type: ${typeof id}`);
    console.log(`[PositionService] ID length: ${id?.length}`);
    console.log(`[PositionService] ID trimmed: "${id?.trim()}"`);
    
    // Ensure ID is trimmed
    const trimmedId = id?.trim();
    console.log(`[PositionService] Using trimmed ID: "${trimmedId}"`);
    
    const position = await this.prisma.position.findUnique({
      where: { id: trimmedId },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
            electionPositions: true,
          },
        },
      },
    });

    if (!position) {
      console.log(`[PositionService] Position not found with ID: "${trimmedId}"`);
      throw new NotFoundException('Position not found');
    }

    console.log(`[PositionService] Found position:`, { 
      id: position.id, 
      title: position.Position_Title, 
      isDeleted: position.isDeleted 
    });

    // Check if position is already soft-deleted
    if (position.isDeleted) {
      console.log(`[PositionService] Position already soft-deleted: "${trimmedId}"`);
      throw new NotFoundException('Position has already been deleted');
    }

    console.log(`[PositionService] Performing soft delete for position: "${trimmedId}"`);

    // SOFT DELETE: Mark as deleted but preserve data
    // We allow deletion even with related data since soft delete preserves everything
    await this.prisma.position.update({
      where: { id: trimmedId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    console.log(`[PositionService] Position "${trimmedId}" soft-deleted successfully`);

    return {
      message: 'Position moved to trash successfully!',
    };
  }
} 