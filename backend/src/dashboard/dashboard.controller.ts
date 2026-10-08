import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService, DashboardFilterDto } from './dashboard.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OnboardingStatus } from '@prisma/client';

@ApiTags('HR Dashboard & Management Analytics')
@Controller('dashboard')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get top-level onboarding KPI counts' })
  @ApiQuery({ name: 'dateRange', required: false, enum: ['TODAY', '7_DAYS', '14_DAYS', '30_DAYS', 'ALL'] })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'employmentType', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Summary KPI card counts.' })
  async getSummary(@Query() query: DashboardFilterDto) {
    return this.dashboardService.getSummary(query);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get readiness distribution charts and department/location breakdowns' })
  @ApiResponse({ status: 200, description: 'Analytics chart data and table metrics.' })
  async getAnalytics(@Query() query: DashboardFilterDto) {
    return this.dashboardService.getAnalytics(query);
  }

  @Get('attention-required')
  @ApiOperation({ summary: 'Get high-priority attention required alerts sorted by urgency' })
  @ApiResponse({ status: 200, description: 'List of employees requiring urgent HR intervention.' })
  async getAttentionRequired(@Query() query: DashboardFilterDto) {
    return this.dashboardService.getAttentionRequired(query);
  }

  @Get('pending-requirements')
  @ApiOperation({ summary: 'Get pending documents, verifications, tasks, and assets breakdown' })
  @ApiResponse({ status: 200, description: 'Grouped lists of pending onboarding items.' })
  async getPendingRequirements(@Query() query: DashboardFilterDto) {
    return this.dashboardService.getPendingRequirements(query);
  }

  @Get('upcoming-joiners')
  @ApiOperation({ summary: 'Get upcoming joiners table with urgency indicators and readiness metrics' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: OnboardingStatus })
  @ApiResponse({ status: 200, description: 'Upcoming joiners list.' })
  async getUpcomingJoiners(@Query() query: DashboardFilterDto) {
    return this.dashboardService.getUpcomingJoiners(query);
  }
}
