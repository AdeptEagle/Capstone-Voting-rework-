import { Module } from '@nestjs/common';
import { PartyListService } from './party-list.service';
import { PartyListController } from './party-list.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [PartyListController],
  providers: [PartyListService, IdGeneratorService],
  exports: [PartyListService],
})
export class PartyListModule {}
