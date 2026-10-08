import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { ChecklistService } from '../checklist/checklist.service';
import { OnboardingReadinessService } from '../readiness/readiness.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('employees')
@Controller('employees')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly checklistService: ChecklistService,
    private readonly readinessService: OnboardingReadinessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all employees with onboarding details' })
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee details by ID' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Get(':id/checklist')
  @ApiOperation({ summary: 'Get final joining checklist for an employee' })
  async getEmployeeChecklist(@Param('id') id: string) {
    return this.checklistService.findByEmployee(id);
  }

  @Get(':id/readiness')
  @ApiOperation({ summary: 'Get onboarding readiness details for an employee' })
  async getEmployeeReadiness(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.readinessService.evaluateReadiness(id, currentUser);
  }
}
