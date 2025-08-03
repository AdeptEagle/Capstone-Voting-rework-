import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [PositionController],
  providers: [PositionService, IdGeneratorService],
  exports: [PositionService],
})
export class PositionModule {} 