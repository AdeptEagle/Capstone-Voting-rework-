import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { DepartmentModule } from './department/department.module';
import { CourseModule } from './course/course.module';
import { PositionModule } from './position/position.module';
import { CandidateModule } from './candidate/candidate.module';
import { AuthModule } from './auth/auth.module';
import { VoterModule } from './voter/voter.module';
import { ElectionModule } from './election/election.module';
import { VoteModule } from './vote/vote.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,
    DepartmentModule,
    CourseModule,
    PositionModule,
    CandidateModule,
    AuthModule,
    VoterModule,
    ElectionModule,
    VoteModule,
    HealthModule,
  ],
})
export class AppModule {} 