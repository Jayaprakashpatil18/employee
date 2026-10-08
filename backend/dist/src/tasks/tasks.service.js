"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, currentUser) {
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
                status: client_1.TaskStatus.TODO,
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
    async findAll(query, currentUser) {
        const where = {};
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
        const mappedTasks = tasks.map((t) => {
            const isOverdue = t.status !== client_1.TaskStatus.COMPLETED && t.dueDate ? t.dueDate < now : false;
            return {
                ...t,
                isOverdue,
                computedStatus: isOverdue && t.status === client_1.TaskStatus.TODO ? 'OVERDUE' : t.status,
            };
        });
        if (query?.isOverdue) {
            return mappedTasks.filter((t) => t.isOverdue);
        }
        return mappedTasks;
    }
    async findByEmployee(employeeId) {
        const tasks = await this.prisma.departmentTask.findMany({
            where: { employeeId },
            include: { employee: true, assignedUser: true },
            orderBy: { dueDate: 'asc' },
        });
        const now = new Date();
        return tasks.map((t) => ({
            ...t,
            isOverdue: t.status !== client_1.TaskStatus.COMPLETED && t.dueDate ? t.dueDate < now : false,
        }));
    }
    async findOne(id) {
        const task = await this.prisma.departmentTask.findUnique({
            where: { id },
            include: { employee: true, assignedUser: true },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID '${id}' not found`);
        }
        const now = new Date();
        const isOverdue = task.status !== client_1.TaskStatus.COMPLETED && task.dueDate ? task.dueDate < now : false;
        return {
            ...task,
            isOverdue,
        };
    }
    async assignTask(id, targetUserId, currentUser) {
        this.assertTaskModifierRole(currentUser);
        const task = await this.findOne(id);
        const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new common_1.NotFoundException(`Target user with ID '${targetUserId}' not found.`);
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
    async startTask(id, currentUser) {
        const task = await this.findOne(id);
        this.assertDepartmentOrHrAccess(task, currentUser);
        if (task.status === client_1.TaskStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot start a task that is already COMPLETED.');
        }
        const updated = await this.prisma.departmentTask.update({
            where: { id },
            data: { status: client_1.TaskStatus.IN_PROGRESS },
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
                newValue: client_1.TaskStatus.IN_PROGRESS,
                details: `Started task '${task.title}'`,
            },
        });
        return updated;
    }
    async completeTask(id, completionRemarks, currentUser) {
        const task = await this.findOne(id);
        this.assertDepartmentOrHrAccess(task, currentUser);
        if (task.isMandatory && (!completionRemarks || completionRemarks.trim() === '')) {
            throw new common_1.BadRequestException('Completion remarks are required when completing a mandatory onboarding task.');
        }
        const updated = await this.prisma.departmentTask.update({
            where: { id },
            data: {
                status: client_1.TaskStatus.COMPLETED,
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
                newValue: client_1.TaskStatus.COMPLETED,
                details: `Completed task '${task.title}'. Remarks: ${completionRemarks}`,
            },
        });
        return updated;
    }
    async blockTask(id, remarks, currentUser) {
        const task = await this.findOne(id);
        this.assertDepartmentOrHrAccess(task, currentUser);
        const updated = await this.prisma.departmentTask.update({
            where: { id },
            data: {
                status: client_1.TaskStatus.BLOCKED,
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
                newValue: client_1.TaskStatus.BLOCKED,
                details: `Blocked task '${task.title}'. Reason: ${remarks}`,
            },
        });
        return updated;
    }
    assertTaskModifierRole(user) {
        if (!user || user.role === client_1.UserRole.EMPLOYEE) {
            throw new common_1.ForbiddenException('Employees are not authorized to assign or reassign departmental tasks.');
        }
    }
    assertDepartmentOrHrAccess(task, user) {
        if (!user)
            throw new common_1.ForbiddenException('User identity missing.');
        if (user.role === client_1.UserRole.EMPLOYEE) {
            throw new common_1.ForbiddenException('Employees cannot complete or modify departmental onboarding tasks.');
        }
        if (user.role === client_1.UserRole.HR_ADMIN || user.role === client_1.UserRole.HR_MANAGER) {
            return true;
        }
        if (task.assignedUserId === user.id)
            return true;
        if (user.department?.toLowerCase() === task.assignedDepartment?.toLowerCase())
            return true;
        throw new common_1.ForbiddenException(`You are not authorized to update tasks for department '${task.assignedDepartment}'.`);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map