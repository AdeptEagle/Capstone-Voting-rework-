import { Module } from '@nestjs/common';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [VoteController],
  providers: [VoteService, IdGeneratorService],
  exports: [VoteService],
})
export class VoteModule {} 