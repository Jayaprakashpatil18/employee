import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OnboardingReadinessService } from './readiness.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User, OnboardingStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Readiness & Compliance Engine')
@Controller('readiness')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReadinessController {
  constructor(private readonly readinessService: OnboardingReadinessService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get platform-wide compliance summary for HR dashboard' })
  @ApiResponse({ status: 200, description: 'Compliance summary metrics.' })
  async getComplianceSummary() {
    return this.readinessService.getComplianceSummary();
  }

  @Get('upcoming-joiners')
  @ApiOperation({ summary: 'Get upcoming joiners with evaluated readiness metrics' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: OnboardingStatus })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of upcoming joiners with readiness scores.' })
  async getUpcomingJoiners(
    @Query('search') search?: string,
    @Query('status') status?: OnboardingStatus,
    @Query('department') department?: string,
  ) {
    return this.readinessService.getUpcomingJoiners({ search, status, department });
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Get onboarding readiness details for a specific employee' })
  @ApiResponse({ status: 200, description: 'Structured readiness evaluation response.' })
  async getEmployeeReadiness(
    @Param('id') employeeId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.readinessService.evaluateReadiness(employeeId, currentUser);
  }
}
