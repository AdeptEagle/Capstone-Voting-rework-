import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartyListDto, UpdatePartyListDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { FileUploadService } from '../services/file-upload.service';

@Injectable()
export class PartyListService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private fileUploadService: FileUploadService,
  ) {}

  async create(createPartyListDto: CreatePartyListDto, logo?: Express.Multer.File) {
    // Check if party list with same name already exists
    const existingPartyList = await this.prisma.partyList.findFirst({
      where: {
        name: createPartyListDto.name,
        isDeleted: false,
      },
    });

    if (existingPartyList) {
      throw new ConflictException('Party list with this name already exists');
    }

    // Handle logo upload
    let logoUrl = null;
    if (logo) {
      try {
        logoUrl = await this.fileUploadService.uploadFile(logo, 'party-list-logos');
      } catch (error) {
        console.error('Error uploading party list logo:', error);
        // Continue without logo if upload fails
      }
    } else if (createPartyListDto.logoUrl) {
      logoUrl = createPartyListDto.logoUrl;
    }

    const partyList = await this.prisma.partyList.create({
      data: {
        id: await this.idGenerator.generateId('PartyList'),
        name: createPartyListDto.name,
        description: createPartyListDto.description,
        color: createPartyListDto.color,
        logo: logoUrl,
      },
      include: {
        candidates: {
          where: { isDeleted: false },
          select: {
            id: true,
            Candidate_Name: true,
            position: {
              select: {
                Position_Title: true,
              },
            },
          },
        },
      },
    });

    return partyList;
  }

  async findAll() {
    return this.prisma.partyList.findMany({
      where: { isDeleted: false },
      include: {
        candidates: {
          where: { isDeleted: false },
          select: {
            id: true,
            Candidate_Name: true,
            position: {
              select: {
                Position_Title: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const partyList = await this.prisma.partyList.findFirst({
      where: { id, isDeleted: false },
      include: {
        candidates: {
          where: { isDeleted: false },
          select: {
            id: true,
            Candidate_Name: true,
            Candidate_Email: true,
            position: {
              select: {
                Position_Title: true,
              },
            },
            department: {
              select: {
                Department_Name: true,
              },
            },
            course: {
              select: {
                Course_Name: true,
              },
            },
          },
        },
      },
    });

    if (!partyList) {
      throw new NotFoundException('Party list not found');
    }

    return partyList;
  }

  async update(id: string, updatePartyListDto: UpdatePartyListDto, logo?: Express.Multer.File) {
    const existingPartyList = await this.prisma.partyList.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingPartyList) {
      throw new NotFoundException('Party list not found');
    }

    // Check if another party list with same name exists (excluding current one)
    if (updatePartyListDto.name) {
      const duplicatePartyList = await this.prisma.partyList.findFirst({
        where: {
          name: updatePartyListDto.name,
          id: { not: id },
          isDeleted: false,
        },
      });

      if (duplicatePartyList) {
        throw new ConflictException('Party list with this name already exists');
      }
    }

    // Handle logo upload
    let logoUrl = existingPartyList.logo; // Keep existing logo by default
    if (logo) {
      try {
        logoUrl = await this.fileUploadService.uploadFile(logo, 'party-list-logos');
      } catch (error) {
        console.error('Error uploading party list logo:', error);
        // Keep existing logo if upload fails
      }
    } else if (updatePartyListDto.logoUrl !== undefined) {
      logoUrl = updatePartyListDto.logoUrl;
    }

    return this.prisma.partyList.update({
      where: { id },
      data: {
        ...updatePartyListDto,
        logo: logoUrl,
      },
      include: {
        candidates: {
          where: { isDeleted: false },
          select: {
            id: true,
            Candidate_Name: true,
            position: {
              select: {
                Position_Title: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    const partyList = await this.prisma.partyList.findFirst({
      where: { id, isDeleted: false },
    });

    if (!partyList) {
      throw new NotFoundException('Party list not found');
    }

    // Check if party list has candidates
    const candidateCount = await this.prisma.candidate.count({
      where: {
        partyListId: id,
        isDeleted: false,
      },
    });

    if (candidateCount > 0) {
      throw new ConflictException(
        'Cannot delete party list that has candidates. Please remove all candidates first.',
      );
    }

    return this.prisma.partyList.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async getStatistics() {
    const totalPartyLists = await this.prisma.partyList.count({
      where: { isDeleted: false },
    });

    const partyListsWithCounts = await this.prisma.partyList.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            candidates: {
              where: { isDeleted: false },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      totalPartyLists,
      partyLists: partyListsWithCounts,
    };
  }
}
