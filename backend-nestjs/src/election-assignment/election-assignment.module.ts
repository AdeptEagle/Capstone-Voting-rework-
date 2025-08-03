import { Module } from '@nestjs/common';
import { ElectionAssignmentController } from './election-assignment.controller';
import { ElectionAssignmentService } from './election-assignment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [ElectionAssignmentController],
  providers: [ElectionAssignmentService, IdGeneratorService],
  exports: [ElectionAssignmentService],
})
export class ElectionAssignmentModule {} 