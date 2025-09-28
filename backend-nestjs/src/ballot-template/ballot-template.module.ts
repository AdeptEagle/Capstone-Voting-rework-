import { Module } from '@nestjs/common';
import { BallotTemplateService } from './ballot-template.service';
import { BallotTemplateController } from './ballot-template.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BallotModule } from '../ballot/ballot.module';

@Module({
  imports: [PrismaModule, BallotModule],
  controllers: [BallotTemplateController],
  providers: [BallotTemplateService],
  exports: [BallotTemplateService],
})
export class BallotTemplateModule {}
