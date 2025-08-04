import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { VoterModule } from './voter/voter.module';
import { CandidateModule } from './candidate/candidate.module';
import { PositionModule } from './position/position.module';
import { ElectionModule } from './election/election.module';
import { VoteModule } from './vote/vote.module';
import { DepartmentModule } from './department/department.module';
import { CourseModule } from './course/course.module';
import { FileUploadModule } from './modules/file-upload.module';
import { ElectionAssignmentModule } from './election-assignment/election-assignment.module';
import { AuditModule } from './audit/audit.module';
import { SchedulerService } from './services/scheduler.service';
import { TimezoneService } from './services/timezone.service';
import { TimezoneController } from './controllers/timezone.controller';
import { WebsocketModule } from './websocket/websocket.module';

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
    ElectionModule,
    VoteModule,
    DepartmentModule,
    CourseModule,
    FileUploadModule,
    ElectionAssignmentModule,
    AuditModule,
    WebsocketModule,
  ],
  controllers: [TimezoneController],
  providers: [SchedulerService, TimezoneService],
})
export class AppModule {} 