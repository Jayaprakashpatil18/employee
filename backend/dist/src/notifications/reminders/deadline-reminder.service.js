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
var DeadlineReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlineReminderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications.service");
const client_1 = require("@prisma/client");
let DeadlineReminderService = DeadlineReminderService_1 = class DeadlineReminderService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(DeadlineReminderService_1.name);
    }
    async processDeadlineReminders() {
        this.logger.log('⏰ Running scheduled deadline reminder & overdue detection engine...');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const results = {
            joiningRemindersSent: 0,
            taskDueRemindersSent: 0,
            overdueTasksEscalated: 0,
        };
        const upcomingEmployees = await this.prisma.employee.findMany({
            where: {
                joiningDate: {
                    gte: now,
                    lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                },
            },
        });
        for (const emp of upcomingEmployees) {
            const empJoining = new Date(emp.joiningDate);
            empJoining.setHours(0, 0, 0, 0);
            const diffDays = Math.round((empJoining.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 7 || diffDays === 3 || diffDays === 1 || diffDays === 0) {
                const reminderType = `JOINING_REMINDER_${diffDays}_DAYS`;
                const exists = await this.prisma.notification.findFirst({
                    where: {
                        employeeId: emp.id,
                        type: reminderType,
                        createdAt: { gte: now },
                    },
                });
                if (!exists) {
                    const urgencyText = diffDays === 0 ? 'joining TODAY' : `joining in ${diffDays} day(s)`;
                    await this.notificationService.createNotification({
                        employeeId: emp.id,
                        type: reminderType,
                        channel: 'IN_APP',
                        title: `Upcoming Joining: ${emp.firstName} ${emp.lastName} (${urgencyText})`,
                        message: `${emp.firstName} ${emp.lastName} is ${urgencyText} (${emp.department}). Current onboarding status: ${emp.onboardingStatus}.`,
                        priority: diffDays <= 1 ? 'HIGH' : 'MEDIUM',
                        relatedEntityType: 'Employee',
                        relatedEntityId: emp.id,
                    });
                    results.joiningRemindersSent++;
                }
            }
        }
        const dueTasks = await this.prisma.departmentTask.findMany({
            where: {
                status: { in: [client_1.TaskStatus.TODO, client_1.TaskStatus.IN_PROGRESS] },
                dueDate: {
                    gte: now,
                    lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                },
            },
            include: { employee: true },
        });
        for (const task of dueTasks) {
            const exists = await this.prisma.notification.findFirst({
                where: {
                    relatedEntityType: 'DepartmentTask',
                    relatedEntityId: task.id,
                    type: 'TASK_DUE_SOON',
                    createdAt: { gte: now },
                },
            });
            if (!exists) {
                await this.notificationService.createNotification({
                    recipientUserId: task.assignedUserId || undefined,
                    employeeId: task.employeeId,
                    type: 'TASK_DUE_SOON',
                    channel: 'IN_APP',
                    title: `Task Due Soon: ${task.title}`,
                    message: `Task '${task.title}' for ${task.employee.firstName} ${task.employee.lastName} is due on ${new Date(task.dueDate).toLocaleDateString()}.`,
                    priority: 'HIGH',
                    relatedEntityType: 'DepartmentTask',
                    relatedEntityId: task.id,
                });
                results.taskDueRemindersSent++;
            }
        }
        const overdueTasks = await this.prisma.departmentTask.findMany({
            where: {
                status: { in: [client_1.TaskStatus.TODO, client_1.TaskStatus.IN_PROGRESS] },
                dueDate: { lt: new Date() },
            },
            include: { employee: true },
        });
        for (const task of overdueTasks) {
            if (task.status !== client_1.TaskStatus.OVERDUE) {
                await this.prisma.departmentTask.update({
                    where: { id: task.id },
                    data: { status: client_1.TaskStatus.OVERDUE },
                });
            }
            const exists = await this.prisma.notification.findFirst({
                where: {
                    relatedEntityType: 'DepartmentTask',
                    relatedEntityId: task.id,
                    type: 'TASK_OVERDUE',
                    createdAt: { gte: now },
                },
            });
            if (!exists) {
                await this.notificationService.createNotification({
                    recipientUserId: task.assignedUserId || undefined,
                    employeeId: task.employeeId,
                    type: 'TASK_OVERDUE',
                    channel: 'IN_APP',
                    title: `[OVERDUE ESCALATION] Task '${task.title}' is Overdue`,
                    message: `Task '${task.title}' assigned to ${task.assignedDepartment} for ${task.employee.firstName} ${task.employee.lastName} was due on ${new Date(task.dueDate).toLocaleDateString()} and is now OVERDUE.`,
                    priority: 'CRITICAL',
                    relatedEntityType: 'DepartmentTask',
                    relatedEntityId: task.id,
                });
                results.overdueTasksEscalated++;
            }
        }
        this.logger.log(`✅ Deadline reminder check complete: ${JSON.stringify(results)}`);
        return results;
    }
};
exports.DeadlineReminderService = DeadlineReminderService;
exports.DeadlineReminderService = DeadlineReminderService = DeadlineReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], DeadlineReminderService);
//# sourceMappingURL=deadline-reminder.service.js.map