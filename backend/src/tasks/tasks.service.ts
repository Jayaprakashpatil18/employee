import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, User, UserRole } from '@prisma/client';

export interface CreateTaskDto {
  employeeId: string;
  title: string;
  description?: string;
  assignedDepartment: string;
  assignedUserId?: string;
  priority?: string;
  isMandatory?: boolean;
  dueDate?: Date | string;
}

export interface QueryTasksDto {
  search?: string;
  department?: string;
  status?: TaskStatus;
  priority?: string;
  assignedUserId?: string;
  employeeId?: string;
  isOverdue?: boolean;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
  completionRemarks?: string;
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, currentUser?: User) {
    const task = await this.prisma.departmentTask.create({
      data: {
        employeeId: dto.employeeId,
        title: dto.title,
        description: dto.description,
        assignedDepartment: dto.assignedDepartment,
        assignedUserId: dto.assignedUserId || null,
        priority: dto.priority || 'MEDIUM',
        isMandatory: dto.isMandatory !== undefined ? dto.isMandatory : true,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: TaskStatus.TODO,
      },
      include: { employee: true, assignedUser: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: dto.employeeId,
        action: 'TASK_CREATED',
        entity: 'DepartmentTask',
        entityType: 'DepartmentTask',
        entityId: task.id,
        details: `Created task '${task.title}' assigned to ${task.assignedDepartment}`,
      },
    });

    return task;
  }

  async findAll(query?: QueryTasksDto, currentUser?: User) {
    const where: any = {};

    if (query?.department) {
      where.assignedDepartment = { equals: query.department, mode: 'insensitive' };
    }
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.priority) {
      where.priority = query.priority;
    }
    if (query?.assignedUserId) {
      where.assignedUserId = query.assignedUserId;
    }
    if (query?.employeeId) {
      where.employeeId = query.employeeId;
    }
    if (query?.search) {
      const s = query.search;
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { assignedDepartment: { contains: s, mode: 'insensitive' } },
        { employee: { firstName: { contains: s, mode: 'insensitive' } } },
        { employee: { lastName: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const tasks = await this.prisma.departmentTask.findMany({
      where,
      include: {
        employee: true,
        assignedUser: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();

    // Map tasks and calculate dynamic overdue status
    const mappedTasks = tasks.map((t) => {
      const isOverdue = t.status !== TaskStatus.COMPLETED && t.dueDate ? t.dueDate < now : false;
      return {
        ...t,
        isOverdue,
        computedStatus: isOverdue && t.status === TaskStatus.TODO ? 'OVERDUE' : t.status,
      };
    });

    if (query?.isOverdue) {
      return mappedTasks.filter((t) => t.isOverdue);
    }

    return mappedTasks;
  }

  async findByEmployee(employeeId: string) {
    const tasks = await this.prisma.departmentTask.findMany({
      where: { employeeId },
      include: { employee: true, assignedUser: true },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    return tasks.map((t) => ({
      ...t,
      isOverdue: t.status !== TaskStatus.COMPLETED && t.dueDate ? t.dueDate < now : false,
    }));
  }

  async findOne(id: string) {
    const task = await this.prisma.departmentTask.findUnique({
      where: { id },
      include: { employee: true, assignedUser: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID '${id}' not found`);
    }

    const now = new Date();
    const isOverdue = task.status !== TaskStatus.COMPLETED && task.dueDate ? task.dueDate < now : false;

    return {
      ...task,
      isOverdue,
    };
  }

  async assignTask(id: string, targetUserId: string, currentUser: User) {
    this.assertTaskModifierRole(currentUser);

    const task = await this.findOne(id);
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException(`Target user with ID '${targetUserId}' not found.`);
    }

    const updated = await this.prisma.departmentTask.update({
      where: { id },
      data: { assignedUserId: targetUserId },
      include: { employee: true, assignedUser: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: task.employeeId,
        action: 'TASK_ASSIGNED',
        entity: 'DepartmentTask',
        entityType: 'DepartmentTask',
        entityId: id,
        oldValue: task.assignedUserId || 'Unassigned',
        newValue: targetUser.name,
        details: `Assigned task '${task.title}' to ${targetUser.name}`,
      },
    });

    return updated;
  }

  async startTask(id: string, currentUser: User) {
    const task = await this.findOne(id);
    this.assertDepartmentOrHrAccess(task, currentUser);

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Cannot start a task that is already COMPLETED.');
    }

    const updated = await this.prisma.departmentTask.update({
      where: { id },
      data: { status: TaskStatus.IN_PROGRESS },
      include: { employee: true, assignedUser: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: task.employeeId,
        action: 'TASK_STARTED',
        entity: 'DepartmentTask',
        entityType: 'DepartmentTask',
        entityId: id,
        oldValue: task.status,
        newValue: TaskStatus.IN_PROGRESS,
        details: `Started task '${task.title}'`,
      },
    });

    return updated;
  }

  async completeTask(id: string, completionRemarks: string, currentUser: User) {
    const task = await this.findOne(id);
    this.assertDepartmentOrHrAccess(task, currentUser);

    if (task.isMandatory && (!completionRemarks || completionRemarks.trim() === '')) {
      throw new BadRequestException('Completion remarks are required when completing a mandatory onboarding task.');
    }

    const updated = await this.prisma.departmentTask.update({
      where: { id },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
        completionRemarks: completionRemarks || 'Task completed successfully.',
      },
      include: { employee: true, assignedUser: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: task.employeeId,
        action: 'TASK_COMPLETED',
        entity: 'DepartmentTask',
        entityType: 'DepartmentTask',
        entityId: id,
        oldValue: task.status,
        newValue: TaskStatus.COMPLETED,
        details: `Completed task '${task.title}'. Remarks: ${completionRemarks}`,
      },
    });

    return updated;
  }

  async blockTask(id: string, remarks: string, currentUser: User) {
    const task = await this.findOne(id);
    this.assertDepartmentOrHrAccess(task, currentUser);

    const updated = await this.prisma.departmentTask.update({
      where: { id },
      data: {
        status: TaskStatus.BLOCKED,
        completionRemarks: remarks || 'Task is blocked.',
      },
      include: { employee: true, assignedUser: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: task.employeeId,
        action: 'TASK_BLOCKED',
        entity: 'DepartmentTask',
        entityType: 'DepartmentTask',
        entityId: id,
        oldValue: task.status,
        newValue: TaskStatus.BLOCKED,
        details: `Blocked task '${task.title}'. Reason: ${remarks}`,
      },
    });

    return updated;
  }

  private assertTaskModifierRole(user: User) {
    if (!user || user.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Employees are not authorized to assign or reassign departmental tasks.');
    }
  }

  private assertDepartmentOrHrAccess(task: any, user: User) {
    if (!user) throw new ForbiddenException('User identity missing.');
    if (user.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Employees cannot complete or modify departmental onboarding tasks.');
    }

    if (user.role === UserRole.HR_ADMIN || user.role === UserRole.HR_MANAGER) {
      return true; // HR can manage all tasks
    }

    // Check if task is assigned directly to user or user role matches task department
    if (task.assignedUserId === user.id) return true;
    if (user.department?.toLowerCase() === task.assignedDepartment?.toLowerCase()) return true;

    throw new ForbiddenException(`You are not authorized to update tasks for department '${task.assignedDepartment}'.`);
  }
}
