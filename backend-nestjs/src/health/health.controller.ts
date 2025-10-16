import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        environment: { type: 'string', example: 'development' },
        port: { type: 'number', example: 8080 },
        database: { type: 'string', example: 'connected' },
        uptime: { type: 'number', example: 123.45 },
      },
    },
  })
  async check() {
    const startTime = Date.now();
    let databaseStatus = 'disconnected';
    
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
      console.log(`[${new Date().toISOString()}] 🏥 Health check - Database connected`);
    } catch (error) {
      databaseStatus = 'error';
      console.error(`[${new Date().toISOString()}] 🏥 Health check - Database error:`, error.message);
    }
    
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 8080,
      database: databaseStatus,
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
    };

    // Log health check for debugging
    console.log(`[${new Date().toISOString()}] 🏥 Health check response:`, {
      status: healthData.status,
      database: healthData.database,
      responseTime: healthData.responseTime
    });

    return healthData;
  }
} 