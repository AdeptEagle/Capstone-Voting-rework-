import { Module } from '@nestjs/common';
import { VoterService } from './voter.service';
import { VoterController } from './voter.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';
import { VotingGateway } from '../websocket/voting.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [VoterController],
  providers: [VoterService, IdGeneratorService, VotingGateway],
  exports: [VoterService],
})
export class VoterModule {} 