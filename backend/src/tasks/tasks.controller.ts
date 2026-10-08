import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  TasksService,
  CreateTaskDto,
  QueryTasksDto,
} from './tasks.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List departmental onboarding tasks with optional search & filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'assignedUserId', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'isOverdue', required: false })
  async findAll(@Query() query: QueryTasksDto, @CurrentUser() user: User) {
    return this.tasksService.findAll(query, user);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'List tasks for specific employee' })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.tasksService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details by ID' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create new departmental task (HR Only)' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(dto, user);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign task to target user ID' })
  async assignTask(
    @Param('id') id: string,
    @Body('userId') targetUserId: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.assignTask(id, targetUserId, user);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start task (status -> IN_PROGRESS)' })
  async startTask(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.startTask(id, user);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete task with required completion remarks' })
  async completeTask(
    @Param('id') id: string,
    @Body('completionRemarks') remarks: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.completeTask(id, remarks, user);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Mark task as BLOCKED with reason' })
  async blockTask(
    @Param('id') id: string,
    @Body('remarks') remarks: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.blockTask(id, remarks, user);
  }
}
