import { Module } from '@nestjs/common';
import { BallotService } from './ballot.service';
import { BallotController } from './ballot.controller';
import { BallotResultsService } from './ballot-results.service';
import { BallotResultsController } from './ballot-results.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';
import { TimezoneService } from '../services/timezone.service';
import { AuditService } from '../services/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [BallotController, BallotResultsController],
  providers: [
    BallotService, 
    BallotResultsService, 
    IdGeneratorService, 
    TimezoneService, 
    AuditService
  ],
  exports: [BallotService, BallotResultsService],
})
export class BallotModule {}
