import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BallotResultsService } from './ballot-results.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ballots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BallotResultsController {
  constructor(private readonly ballotResultsService: BallotResultsService) {}

  @Get('results')
  getBallotsWithResults(@Request() req) {
    return this.ballotResultsService.getBallotsWithResults(req.user.id);
  }

  @Get(':id/results')
  getBallotResults(@Param('id') id: string) {
    return this.ballotResultsService.getBallotResults(id);
  }

  @Get(':id/results/live')
  getLiveBallotResults(@Param('id') id: string) {
    return this.ballotResultsService.getLiveBallotResults(id);
  }

  @Post(':id/results/refresh')
  @Roles('ADMIN', 'SUPERADMIN')
  refreshBallotResults(@Param('id') id: string) {
    return this.ballotResultsService.refreshBallotResults(id);
  }
}











