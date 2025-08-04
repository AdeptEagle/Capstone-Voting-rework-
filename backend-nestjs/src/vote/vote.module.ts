import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';
import { TimezoneService } from '../services/timezone.service';
import { VotingGateway } from '../websocket/voting.gateway';
import { AuditService } from '../services/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [VoteController],
  providers: [VoteService, IdGeneratorService, TimezoneService, VotingGateway, AuditService],
  exports: [VoteService],
})
export class VoteModule {} 