import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartyListService } from './party-list.service';
import { CreatePartyListDto, UpdatePartyListDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Party List')
@Controller('party-lists')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PartyListController {
  constructor(private readonly partyListService: PartyListService) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Create a new party list' })
  @ApiResponse({ status: 201, description: 'Party list created successfully' })
  @ApiResponse({ status: 409, description: 'Party list with this name already exists' })
  create(@Body() createPartyListDto: CreatePartyListDto, @UploadedFile() logo?: Express.Multer.File) {
    return this.partyListService.create(createPartyListDto, logo);
  }

  @Get()
  @ApiOperation({ summary: 'Get all party lists' })
  @ApiResponse({ status: 200, description: 'List of all party lists' })
  findAll() {
    return this.partyListService.findAll();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get party list statistics' })
  @ApiResponse({ status: 200, description: 'Party list statistics' })
  getStatistics() {
    return this.partyListService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a party list by ID' })
  @ApiResponse({ status: 200, description: 'Party list details' })
  @ApiResponse({ status: 404, description: 'Party list not found' })
  findOne(@Param('id') id: string) {
    return this.partyListService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Update a party list' })
  @ApiResponse({ status: 200, description: 'Party list updated successfully' })
  @ApiResponse({ status: 404, description: 'Party list not found' })
  @ApiResponse({ status: 409, description: 'Party list with this name already exists' })
  update(@Param('id') id: string, @Body() updatePartyListDto: UpdatePartyListDto, @UploadedFile() logo?: Express.Multer.File) {
    return this.partyListService.update(id, updatePartyListDto, logo);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({ summary: 'Delete a party list' })
  @ApiResponse({ status: 200, description: 'Party list deleted successfully' })
  @ApiResponse({ status: 404, description: 'Party list not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete party list with candidates' })
  remove(@Param('id') id: string) {
    return this.partyListService.remove(id);
  }
}
