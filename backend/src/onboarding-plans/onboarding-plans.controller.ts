import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingPlansService, CreatePlanDto } from './onboarding-plans.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('onboarding-plans')
@Controller('onboarding-plans')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OnboardingPlansController {
  constructor(private readonly plansService: OnboardingPlansService) {}

  @Get()
  @ApiOperation({ summary: 'List all onboarding plans' })
  async findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get onboarding plan by ID' })
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create new onboarding plan (HR Admin & HR Manager)' })
  async create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update onboarding plan (HR Admin & HR Manager)' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreatePlanDto>) {
    return this.plansService.update(id, dto);
  }

  @Post(':id/activate')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Activate onboarding plan' })
  async activate(@Param('id') id: string) {
    return this.plansService.setPlanStatus(id, true);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Deactivate onboarding plan' })
  async deactivate(@Param('id') id: string) {
    return this.plansService.setPlanStatus(id, false);
  }

  @Delete(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Delete onboarding plan (HR Admin only)' })
  async remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
