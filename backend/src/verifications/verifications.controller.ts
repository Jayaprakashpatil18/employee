import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  VerificationsService,
  CreateVerificationDto,
  CompleteVerificationDto,
} from './verifications.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('verifications')
@Controller('verifications')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VerificationsController {
  constructor(private readonly verificationsService: VerificationsService) {}

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'List background verifications for employee' })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.verificationsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get background verification by ID' })
  async findOne(@Param('id') id: string) {
    return this.verificationsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create background verification check (HR Only)' })
  async create(@Body() dto: CreateVerificationDto, @CurrentUser() user: User) {
    return this.verificationsService.create(dto, user);
  }

  @Post(':id/start')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Start background verification check (status -> IN_PROGRESS)' })
  async startVerification(@Param('id') id: string, @CurrentUser() user: User) {
    return this.verificationsService.startVerification(id, user);
  }

  @Post(':id/complete')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Complete background verification check with result (CLEAR, FAILED, NEEDS_REVIEW)' })
  async completeVerification(
    @Param('id') id: string,
    @Body() dto: CompleteVerificationDto,
    @CurrentUser() user: User,
  ) {
    return this.verificationsService.completeVerification(id, dto, user);
  }
}
