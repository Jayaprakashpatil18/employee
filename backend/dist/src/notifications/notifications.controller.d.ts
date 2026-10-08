import { NotificationsService, QueryNotificationsDto } from './notifications.service';
import { DeadlineReminderService } from './reminders/deadline-reminder.service';
import { User } from '@prisma/client';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly reminderService;
    constructor(notificationsService: NotificationsService, reminderService: DeadlineReminderService);
    getUserNotifications(currentUser: User, query: QueryNotificationsDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(currentUser: User): Promise<{
        unreadCount: number;
    }>;
    markAllAsRead(currentUser: User): Promise<{
        message: string;
    }>;
    markAsRead(id: string, currentUser: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        employeeId: string | null;
        candidateId: string | null;
        userId: string | null;
        priority: string;
        type: string;
        recipientUserId: string | null;
        channel: string;
        message: string;
        relatedEntityType: string | null;
        relatedEntityId: string | null;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
        failedAt: Date | null;
        failureReason: string | null;
        scheduledFor: Date | null;
    } | {
        id: string;
        isRead: boolean;
    }>;
    deleteNotification(id: string, currentUser: User): Promise<{
        message: string;
    }>;
    getPreferences(currentUser: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        emailNotificationsEnabled: boolean;
        inAppNotificationsEnabled: boolean;
        documentNotifications: boolean;
        verificationNotifications: boolean;
        taskNotifications: boolean;
        assetNotifications: boolean;
        joiningReminders: boolean;
        overdueEscalations: boolean;
    } | {
        userId: string;
        emailNotificationsEnabled: boolean;
        inAppNotificationsEnabled: boolean;
        documentNotifications: boolean;
        verificationNotifications: boolean;
        taskNotifications: boolean;
        assetNotifications: boolean;
        joiningReminders: boolean;
        overdueEscalations: boolean;
    }>;
    updatePreferences(currentUser: User, dto: any): Promise<any>;
    triggerReminders(): Promise<{
        joiningRemindersSent: number;
        taskDueRemindersSent: number;
        overdueTasksEscalated: number;
    }>;
}
