import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from '../services/audit.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {} 