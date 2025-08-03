import { Module } from '@nestjs/common';
import { VoterController } from './voter.controller';
import { VoterService } from './voter.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [VoterController],
  providers: [VoterService, IdGeneratorService],
  exports: [VoterService],
})
export class VoterModule {} 