import { Module } from '@nestjs/common';
import { PartyListService } from './party-list.service';
import { PartyListController } from './party-list.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';
import { FileUploadModule } from '../modules/file-upload.module';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [PartyListController],
  providers: [PartyListService, IdGeneratorService],
  exports: [PartyListService],
})
export class PartyListModule {}
