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
    return this.prisma.position.findMany({
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
  }

  async createPosition(createPositionDto: CreatePositionDto) {
    const { title, description, voteLimit } = createPositionDto;

    // Check if position with this title already exists
    const existingPosition = await this.prisma.position.findFirst({
      where: { title },
    });

    if (existingPosition) {
      throw new ConflictException('Position with this title already exists');
    }

    // Generate custom ID
    const customId = await this.idGenerator.generatePositionId();

    const position = await this.prisma.position.create({
      data: {
        id: customId,
        title,
        description,
        voteLimit: voteLimit || 1,
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

    return position;
  }

  async updatePosition(id: string, updatePositionDto: UpdatePositionDto) {
    const { title, description } = updatePositionDto;

    // Check if position exists
    const existingPosition = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!existingPosition) {
      throw new NotFoundException('Position not found');
    }

    // Check if title is already taken by another position
    if (title && title !== existingPosition.title) {
      const conflictingPosition = await this.prisma.position.findFirst({
        where: {
          title,
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
        title,
        description,
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

    // Check if position has related data
    if (position._count.candidates > 0 || position._count.votes > 0 || position._count.electionPositions > 0) {
      throw new ConflictException('Cannot delete position with related candidates, votes, or election assignments');
    }

    await this.prisma.position.delete({
      where: { id },
    });

    return {
      message: 'Position deleted successfully!',
    };
  }
} 