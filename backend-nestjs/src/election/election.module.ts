import { Module } from '@nestjs/common';
import { ElectionService } from './election.service';
import { ElectionController } from './election.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';
import { TimezoneService } from '../services/timezone.service';
import { VotingGateway } from '../websocket/voting.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ElectionController],
  providers: [ElectionService, IdGeneratorService, TimezoneService, VotingGateway],
  exports: [ElectionService],
})
export class ElectionModule {} 