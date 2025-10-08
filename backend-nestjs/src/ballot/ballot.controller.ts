import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BallotService } from './ballot.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { UpdateBallotDto } from './dto/update-ballot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ballots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BallotController {
  constructor(private readonly ballotService: BallotService) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  createBallot(@Body() createBallotDto: CreateBallotDto, @Request() req) {
    console.log('🔐 Ballot creation auth check:');
    console.log('User object:', req.user);
    console.log('User role:', req.user?.role);
    console.log('User ID:', req.user?.id);
    console.log('User type:', req.user?.type);
    return this.ballotService.createBallot(createBallotDto, req.user.id);
  }

  @Get()
  getBallots(
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    const filters: any = {};
    
    if (status) filters.status = status;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (createdBy) filters.createdBy = createdBy;

    return this.ballotService.getBallots(filters);
  }

  @Get('available')
  getAvailableBallots(@Request() req) {
    return this.ballotService.getAvailableBallotsForUser(req.user.id);
  }

  @Get('upcoming')
  getUpcomingBallots(@Request() req) {
    return this.ballotService.getUpcomingBallotsForUser(req.user.id);
  }

  @Get('user-history')
  getUserBallotHistoryFromAuth(@Request() req) {
    return this.ballotService.getUserBallotHistory(req.user.id);
  }

  @Post('cast-vote')
  castBallotVote(@Body() voteData: any, @Request() req) {
    return this.ballotService.castBallotVote(voteData, req.user.id);
  }

  @Get(':id')
  getBallotById(@Param('id') id: string) {
    return this.ballotService.getBallotById(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  updateBallot(
    @Param('id') id: string,
    @Body() updateBallotDto: UpdateBallotDto,
    @Request() req,
  ) {
    return this.ballotService.updateBallot(id, updateBallotDto, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBallot(@Param('id') id: string, @Request() req) {
    return this.ballotService.deleteBallot(id, req.user.id);
  }

  @Post(':id/activate')
  @Roles('ADMIN', 'SUPERADMIN')
  activateBallot(@Param('id') id: string, @Request() req) {
    return this.ballotService.activateBallot(id, req.user.id);
  }

  @Post(':id/pause')
  @Roles('ADMIN', 'SUPERADMIN')
  pauseBallot(@Param('id') id: string, @Request() req) {
    return this.ballotService.pauseBallot(id, req.user.id);
  }

  @Post(':id/end')
  @Roles('ADMIN', 'SUPERADMIN')
  endBallot(@Param('id') id: string, @Request() req) {
    return this.ballotService.endBallot(id, req.user.id);
  }

  @Get('available/:userId')
  getAvailableBallotsForUser(@Param('userId') userId: string) {
    return this.ballotService.getAvailableBallotsForUser(userId);
  }

  @Get('history/:userId')
  getUserBallotHistory(@Param('userId') userId: string) {
    return this.ballotService.getUserBallotHistory(userId);
  }

  // Results endpoint moved to BallotResultsController to avoid conflicts

  // Bulk Operations
  @Post('bulk/activate')
  @Roles('ADMIN', 'SUPERADMIN')
  bulkActivateBallots(@Body('ballotIds') ballotIds: string[], @Request() req) {
    return this.ballotService.bulkActivateBallots(ballotIds, req.user.id);
  }

  @Post('bulk/pause')
  @Roles('ADMIN', 'SUPERADMIN')
  bulkPauseBallots(@Body('ballotIds') ballotIds: string[], @Request() req) {
    return this.ballotService.bulkPauseBallots(ballotIds, req.user.id);
  }

  @Post('bulk/end')
  @Roles('ADMIN', 'SUPERADMIN')
  bulkEndBallots(@Body('ballotIds') ballotIds: string[], @Request() req) {
    return this.ballotService.bulkEndBallots(ballotIds, req.user.id);
  }

  @Post('bulk/delete')
  @Roles('ADMIN', 'SUPERADMIN')
  bulkDeleteBallots(@Body('ballotIds') ballotIds: string[], @Request() req) {
    return this.ballotService.bulkDeleteBallots(ballotIds, req.user.id);
  }

  @Post('bulk/update-status')
  @Roles('ADMIN', 'SUPERADMIN')
  bulkUpdateBallotStatus(
    @Body('ballotIds') ballotIds: string[],
    @Body('status') status: string,
    @Request() req
  ) {
    return this.ballotService.bulkUpdateBallotStatus(ballotIds, status as any, req.user.id);
  }

}
