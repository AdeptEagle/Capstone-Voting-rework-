import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IdGeneratorService } from '../utils/id-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [CourseController],
  providers: [CourseService, IdGeneratorService],
  exports: [CourseService],
})
export class CourseModule {} 