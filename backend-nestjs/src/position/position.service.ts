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

    // Trim the ID if provided
    const trimmedId = id?.trim();

    // Check if position with this title already exists
    const existingPosition = await this.prisma.position.findFirst({
      where: { Position_Title: Position_Title },
    });

    if (existingPosition) {
      throw new ConflictException('Position with this title already exists');
    }

    // If custom ID is provided, check if it already exists
    if (trimmedId) {
      const existingPositionWithId = await this.prisma.position.findUnique({
        where: { id: trimmedId },
      });

      if (existingPositionWithId) {
        throw new ConflictException(`Position with ID "${trimmedId}" already exists`);
      }
    }

    // Use provided ID if available, otherwise generate one
    const positionId = trimmedId || await this.idGenerator.generatePositionId();

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

    // Trim the ID
    const trimmedId = id?.trim();

    // Try to find position with trimmed ID first
    let existingPosition = await this.prisma.position.findUnique({
      where: { id: trimmedId },
    });

    // If not found with trimmed ID, try with original ID (in case it has trailing spaces)
    if (!existingPosition && id !== trimmedId) {
      console.log(`[PositionService] Position not found with trimmed ID, trying original ID: "${id}"`);
      existingPosition = await this.prisma.position.findUnique({
        where: { id: id },
      });
    }

    if (!existingPosition) {
      throw new NotFoundException('Position not found');
    }

    // Check if title is already taken by another position
    if (Position_Title && Position_Title !== existingPosition.Position_Title) {
      const conflictingPosition = await this.prisma.position.findFirst({
        where: {
          Position_Title: Position_Title,
          NOT: { id: existingPosition.id },
        },
      });

      if (conflictingPosition) {
        throw new ConflictException('Position with this title already exists');
      }
    }

    const position = await this.prisma.position.update({
      where: { id: existingPosition.id },
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
    
    // Try to find position with trimmed ID first
    let position = await this.prisma.position.findUnique({
      where: { id: trimmedId },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    });

    // If not found with trimmed ID, try with original ID (in case it has trailing spaces)
    if (!position && id !== trimmedId) {
      console.log(`[PositionService] Position not found with trimmed ID, trying original ID: "${id}"`);
      position = await this.prisma.position.findUnique({
        where: { id: id },
        include: {
          _count: {
            select: {
              candidates: true,
              votes: true,
            },
          },
        },
      });
    }

    if (!position) {
      console.log(`[PositionService] Position not found with ID: "${trimmedId}" or "${id}"`);
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

    console.log(`[PositionService] Performing soft delete for position: "${position.id}"`);

    // SOFT DELETE: Mark as deleted but preserve data
    // We allow deletion even with related data since soft delete preserves everything
    await this.prisma.position.update({
      where: { id: position.id },
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