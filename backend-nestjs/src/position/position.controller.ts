import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PositionService } from './position.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Position')
@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'List of all positions' })
  async getAllPositions(@Request() req) {
    console.log(`[PositionController] getAllPositions called`);
    console.log(`[PositionController] User:`, req.user);
    console.log(`[PositionController] User role:`, req.user?.role);
    
    // Admin users should NOT see deleted positions in the main list
    // They should only see deleted positions in the Trash Bin
    const showAll = false; // Always filter out deleted positions
    console.log(`[PositionController] showAll parameter: ${showAll} (always false for main list)`);
    
    return this.positionService.getAllPositions(showAll);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  async createPosition(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.createPosition(createPositionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiResponse({ status: 200, description: 'Position found' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async getPositionById(@Param('id') id: string) {
    return this.positionService.getPositionById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update position' })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async updatePosition(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionService.updatePosition(id, updatePositionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete position' })
  @ApiResponse({ status: 200, description: 'Position deleted successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async deletePosition(@Param('id') id: string) {
    console.log(`[PositionController] deletePosition called with ID: "${id}"`);
    console.log(`[PositionController] ID type: ${typeof id}`);
    console.log(`[PositionController] ID length: ${id?.length}`);
    console.log(`[PositionController] ID trimmed: "${id?.trim()}"`);
    console.log(`[PositionController] ID trimmed length: ${id?.trim()?.length}`);
    
    // Trim the ID to handle any whitespace issues
    const trimmedId = id?.trim();
    console.log(`[PositionController] Using trimmed ID: "${trimmedId}"`);
    
    return this.positionService.deletePosition(trimmedId);
  }
} 