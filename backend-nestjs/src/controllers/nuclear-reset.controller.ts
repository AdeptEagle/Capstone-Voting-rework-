import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NuclearResetService } from '../services/nuclear-reset.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Nuclear Reset')
@Controller('nuclear-reset')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NuclearResetController {
  constructor(private readonly nuclearResetService: NuclearResetService) {}

  @Get('status')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get system status before nuclear reset (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'System status retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin access required' })
  async getSystemStatus() {
    return await this.nuclearResetService.getSystemStatus();
  }

  @Post('execute')
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Execute nuclear reset - Drops all user data while preserving system essentials (SuperAdmin only)',
    description: '⚠️ WARNING: This action is irreversible and will delete ALL user-generated data including voters, candidates, ballots, votes, party lists, and regular admins. Only SuperAdmins, built-in positions, templates, departments, courses, and system configurations will be preserved.'
  })
  @ApiResponse({ status: 200, description: 'Nuclear reset executed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid password' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin access required' })
  @ApiResponse({ status: 500, description: 'Nuclear reset failed' })
  async executeNuclearReset(@Body() body: { password: string }, @Request() req) {
    const adminId = req.user.id; // Get admin ID from JWT token
    return await this.nuclearResetService.nuclearReset(body.password, adminId);
  }
}
