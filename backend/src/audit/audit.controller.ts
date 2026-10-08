import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService, QueryAuditDto } from './audit.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('audit')
@Controller('audit')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'List and filter audit logs with pagination' })
  @ApiQuery({ name: 'dateRange', required: false, enum: ['TODAY', '7_DAYS', '14_DAYS', '30_DAYS', 'ALL'] })
  @ApiQuery({ name: 'actorUserId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: QueryAuditDto) {
    return this.auditService.queryAuditLogs(query);
  }

  @Get('entity/:entityType/:entityId')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.IT, UserRole.FINANCE, UserRole.ADMINISTRATION)
  @ApiOperation({ summary: 'Get activity timeline for a specific entity' })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getAuditHistoryForEntity(entityType, entityId);
  }

  @Get('employee/:employeeId')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.IT, UserRole.FINANCE, UserRole.ADMINISTRATION, UserRole.REPORTING_MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get activity timeline for a specific employee' })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.auditService.getAuditHistoryForEmployee(employeeId);
  }
}
