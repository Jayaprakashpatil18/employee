import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications.service';
import { TaskStatus, OnboardingStatus } from '@prisma/client';

@Injectable()
export class DeadlineReminderService {
  private readonly logger = new Logger(DeadlineReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  /**
   * Periodically scans database for upcoming joining dates, tasks due soon, and overdue items.
   */
  async processDeadlineReminders() {
    this.logger.log('⏰ Running scheduled deadline reminder & overdue detection engine...');

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const results = {
      joiningRemindersSent: 0,
      taskDueRemindersSent: 0,
      overdueTasksEscalated: 0,
    };

    // 1. Process Joining Date Reminders (7 days, 3 days, 1 day before joining)
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

    // 2. Process Department Tasks Due Soon (due within next 3 days)
    const dueTasks = await this.prisma.departmentTask.findMany({
      where: {
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
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
          message: `Task '${task.title}' for ${task.employee.firstName} ${task.employee.lastName} is due on ${new Date(task.dueDate!).toLocaleDateString()}.`,
          priority: 'HIGH',
          relatedEntityType: 'DepartmentTask',
          relatedEntityId: task.id,
        });
        results.taskDueRemindersSent++;
      }
    }

    // 3. Process Overdue Department Tasks (past dueDate & incomplete)
    const overdueTasks = await this.prisma.departmentTask.findMany({
      where: {
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        dueDate: { lt: new Date() },
      },
      include: { employee: true },
    });

    for (const task of overdueTasks) {
      // Mark task status as OVERDUE in database if not already updated
      if (task.status !== TaskStatus.OVERDUE) {
        await this.prisma.departmentTask.update({
          where: { id: task.id },
          data: { status: TaskStatus.OVERDUE },
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
          message: `Task '${task.title}' assigned to ${task.assignedDepartment} for ${task.employee.firstName} ${task.employee.lastName} was due on ${new Date(task.dueDate!).toLocaleDateString()} and is now OVERDUE.`,
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
}
