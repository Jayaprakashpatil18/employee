import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email/email.service';
export interface CreateNotificationDto {
    recipientUserId?: string;
    employeeId?: string;
    candidateId?: string;
    type: string;
    channel?: 'IN_APP' | 'EMAIL';
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    scheduledFor?: Date;
}
export interface QueryNotificationsDto {
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    createNotification(dto: CreateNotificationDto): Promise<{
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
    }>;
    getUserNotifications(userId: string, query?: QueryNotificationsDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAsRead(id: string, userId: string): Promise<{
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
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, userId: string): Promise<{
        message: string;
    }>;
    getUserPreferences(userId: string): Promise<{
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
    updateUserPreferences(userId: string, dto: any): Promise<any>;
    private mapTypeToEmailTemplate;
}
