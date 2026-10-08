import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email/email.service';
import { DeadlineReminderService } from './reminders/deadline-reminder.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TaskStatus } from '@prisma/client';

describe('Notifications & Deadline Reminders System', () => {
  let service: NotificationsService;
  let reminderService: DeadlineReminderService;
  let mockPrisma: any;
  let mockEmailService: any;

  const mockNotification = {
    id: 'notif-101',
    recipientUserId: 'user-1',
    userId: 'user-1',
    employeeId: 'emp-1',
    type: 'TASK_ASSIGNED',
    channel: 'IN_APP',
    title: 'New Task Assigned',
    message: 'Prepare Laptop task assigned',
    priority: 'HIGH',
    status: 'SENT',
    isRead: false,
    createdAt: new Date(),
  };

  const mockEmployee = {
    id: 'emp-1',
    employeeId: 'EMP-2026-0001',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    department: 'Engineering',
    joiningDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
    onboardingStatus: 'PARTIALLY_READY',
  };

  const mockTask = {
    id: 'task-1',
    employeeId: 'emp-1',
    title: 'Setup Laptop',
    assignedDepartment: 'IT',
    assignedUserId: 'user-1',
    status: TaskStatus.TODO,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
    employee: mockEmployee,
  };

  beforeEach(async () => {
    mockPrisma = {
      notification: {
        create: jest.fn().mockResolvedValue(mockNotification),
        findMany: jest.fn().mockResolvedValue([mockNotification]),
        findUnique: jest.fn().mockResolvedValue(mockNotification),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue({ ...mockNotification, isRead: true }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        delete: jest.fn().mockResolvedValue(mockNotification),
      },
      notificationPreference: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ userId: 'user-1', emailNotificationsEnabled: true }),
        upsert: jest.fn().mockResolvedValue({ userId: 'user-1', emailNotificationsEnabled: true }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-1', name: 'HR Admin', email: 'hr@example.com' }),
      },
      employee: {
        findUnique: jest.fn().mockResolvedValue(mockEmployee),
        findMany: jest.fn().mockResolvedValue([mockEmployee]),
      },
      departmentTask: {
        findMany: jest.fn().mockResolvedValue([mockTask]),
        update: jest.fn().mockResolvedValue({ ...mockTask, status: TaskStatus.OVERDUE }),
      },
    };

    mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue({ success: true, provider: 'console' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        DeadlineReminderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('console') } },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    reminderService = module.get<DeadlineReminderService>(DeadlineReminderService);
  });

  describe('Notification CRUD & Read Status', () => {
    it('should create notification and trigger email for HIGH priority alerts', async () => {
      const result = await service.createNotification({
        recipientUserId: 'user-1',
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'Task assigned',
        priority: 'HIGH',
      });

      expect(result.id).toBe('notif-101');
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    it('should calculate unread notification count for user', async () => {
      const result = await service.getUnreadCount('user-1');
      expect(result.unreadCount).toBe(1);
    });

    it('should mark notification as read', async () => {
      const result = await service.markAsRead('notif-101', 'user-1');
      expect(result.isRead).toBe(true);
    });

    it('should mark all notifications as read for user', async () => {
      const result = await service.markAllAsRead('user-1');
      expect(result.message).toContain('marked as read');
    });
  });

  describe('Deadline Reminder Engine', () => {
    it('should process deadline reminders for 3 days before joining & overdue tasks', async () => {
      const results = await reminderService.processDeadlineReminders();
      expect(results.joiningRemindersSent).toBe(1);
      expect(results.overdueTasksEscalated).toBe(1);
    });
  });
});
