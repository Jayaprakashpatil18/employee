import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System and database health check' })
  @ApiResponse({ status: 200, description: 'Service and database are healthy' })
  @ApiResponse({ status: 503, description: 'Service or database is degraded/down' })
  async check(@Res() res: Response) {
    let dbStatus = 'down';
    let isHealthy = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
      isHealthy = true;
    } catch (err: any) {
      dbStatus = `degraded: ${err.message}`;
    }

    const payload = {
      status: isHealthy ? 'ok' : 'degraded',
      service: 'employee-onboarding-api',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    };

    return res
      .status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json(payload);
  }
}
