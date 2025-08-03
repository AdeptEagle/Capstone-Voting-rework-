import { Module } from '@nestjs/common';
import { ElectionController } from './election.controller';
import { ElectionService } from './election.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [ElectionController],
  providers: [ElectionService, IdGeneratorService],
  exports: [ElectionService],
})
export class ElectionModule {} 