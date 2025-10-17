import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { VoterModule } from './voter/voter.module';
import { CandidateModule } from './candidate/candidate.module';
import { PositionModule } from './position/position.module';
import { VoteModule } from './vote/vote.module';
import { DepartmentModule } from './department/department.module';
import { CourseModule } from './course/course.module';
import { FileUploadModule } from './modules/file-upload.module';
import { AuditModule } from './audit/audit.module';
import { TrashModule } from './trash/trash.module';
import { BallotModule } from './ballot/ballot.module';
import { BallotTemplateModule } from './ballot-template/ballot-template.module';
import { PartyListModule } from './party-list/party-list.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SchedulerService } from './services/scheduler.service';
import { TimezoneService } from './services/timezone.service';
import { TemplateInitializationService } from './services/template-initialization.service';
import { PositionInitializationService } from './services/position-initialization.service';
import { DepartmentCourseInitializationService } from './services/department-course-initialization.service';
import { TimezoneController } from './controllers/timezone.controller';
import { WebsocketModule } from './websocket/websocket.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AdminModule,
    VoterModule,
    CandidateModule,
    PositionModule,
    VoteModule,
    DepartmentModule,
    CourseModule,
    FileUploadModule,
    AuditModule,
    TrashModule,
    BallotModule,
    BallotTemplateModule,
    PartyListModule,
    AnalyticsModule,
    WebsocketModule,
    HealthModule,
  ],
  controllers: [TimezoneController],
  providers: [SchedulerService, TimezoneService, TemplateInitializationService, PositionInitializationService, DepartmentCourseInitializationService],
})
export class AppModule {} 