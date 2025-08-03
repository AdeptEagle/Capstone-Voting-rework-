import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [CandidateController],
  providers: [CandidateService, IdGeneratorService],
  exports: [CandidateService],
})
export class CandidateModule {} 