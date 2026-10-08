"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const notifications_service_1 = require("./notifications.service");
const email_service_1 = require("./email/email.service");
const deadline_reminder_service_1 = require("./reminders/deadline-reminder.service");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
describe('Notifications & Deadline Reminders System', () => {
    let service;
    let reminderService;
    let mockPrisma;
    let mockEmailService;
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
        joiningDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        onboardingStatus: 'PARTIALLY_READY',
    };
    const mockTask = {
        id: 'task-1',
        employeeId: 'emp-1',
        title: 'Setup Laptop',
        assignedDepartment: 'IT',
        assignedUserId: 'user-1',
        status: client_1.TaskStatus.TODO,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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
                update: jest.fn().mockResolvedValue({ ...mockTask, status: client_1.TaskStatus.OVERDUE }),
            },
        };
        mockEmailService = {
            sendEmail: jest.fn().mockResolvedValue({ success: true, provider: 'console' }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                notifications_service_1.NotificationsService,
                deadline_reminder_service_1.DeadlineReminderService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: email_service_1.EmailService, useValue: mockEmailService },
                { provide: config_1.ConfigService, useValue: { get: jest.fn().mockReturnValue('console') } },
            ],
        }).compile();
        service = module.get(notifications_service_1.NotificationsService);
        reminderService = module.get(deadline_reminder_service_1.DeadlineReminderService);
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
//# sourceMappingURL=notifications.service.spec.js.map