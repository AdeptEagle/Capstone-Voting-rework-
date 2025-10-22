import { Controller, Post, UseGuards, HttpException, HttpStatus, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulerService } from '../services/scheduler.service';
import { LogCleanupConfigService } from '../services/log-cleanup-config.service';

@ApiTags('System Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaintenanceController {
  constructor(
    private readonly schedulerService: SchedulerService,
    private readonly logCleanupConfig: LogCleanupConfigService
  ) {}

  // Helper method to check if user has admin access
  private checkAdminAccess(req: any) {
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied - Admin or Super Admin required');
    }
  }

  @Post('cleanup/login-logs')
  @ApiOperation({ summary: 'Manually trigger login logs cleanup (Admin and Super Admin)' })
  @ApiResponse({ status: 200, description: 'Login logs cleanup completed' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin or Super Admin required' })
  @ApiResponse({ status: 500, description: 'Cleanup failed' })
  async cleanupLoginLogs(@Request() req) {
    this.checkAdminAccess(req);
    try {
      await this.schedulerService.cleanupOldLoginLogs();
      return {
        success: true,
        message: 'Login logs cleanup completed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to cleanup login logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cleanup/audit-logs')
  @ApiOperation({ summary: 'Manually trigger audit logs cleanup' })
  @ApiResponse({ status: 200, description: 'Audit logs cleanup completed' })
  @ApiResponse({ status: 500, description: 'Cleanup failed' })
  async cleanupAuditLogs() {
    try {
      await this.schedulerService.cleanupOldAuditLogs();
      return {
        success: true,
        message: 'Audit logs cleanup completed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to cleanup audit logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cleanup/sessions')
  @ApiOperation({ summary: 'Manually trigger inactive sessions cleanup' })
  @ApiResponse({ status: 200, description: 'Sessions cleanup completed' })
  @ApiResponse({ status: 500, description: 'Cleanup failed' })
  async cleanupSessions() {
    try {
      await this.schedulerService.cleanupInactiveSessions();
      await this.schedulerService.cleanupInactiveAdminSessions();
      return {
        success: true,
        message: 'Inactive sessions cleanup completed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to cleanup inactive sessions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cleanup/admin-sessions')
  @ApiOperation({ summary: 'Manually trigger inactive admin sessions cleanup' })
  @ApiResponse({ status: 200, description: 'Admin sessions cleanup completed' })
  @ApiResponse({ status: 500, description: 'Cleanup failed' })
  async cleanupAdminSessions() {
    try {
      await this.schedulerService.cleanupInactiveAdminSessions();
      return {
        success: true,
        message: 'Inactive admin sessions cleanup completed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to cleanup inactive admin sessions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cleanup/all')
  @ApiOperation({ summary: 'Manually trigger all cleanup tasks (Admin and Super Admin)' })
  @ApiResponse({ status: 200, description: 'All cleanup tasks completed' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin or Super Admin required' })
  @ApiResponse({ status: 500, description: 'Cleanup failed' })
  async cleanupAll(@Request() req) {
    this.checkAdminAccess(req);
    try {
      const results = {
        loginLogs: null,
        auditLogs: null,
        sessions: null,
      };

      // Run all cleanup tasks
      await this.schedulerService.cleanupOldLoginLogs();
      results.loginLogs = 'completed';

      await this.schedulerService.cleanupOldAuditLogs();
      results.auditLogs = 'completed';

      await this.schedulerService.cleanupInactiveSessions();
      await this.schedulerService.cleanupInactiveAdminSessions();
      results.sessions = 'completed';

      return {
        success: true,
        message: 'All cleanup tasks completed successfully',
        results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to run cleanup tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
