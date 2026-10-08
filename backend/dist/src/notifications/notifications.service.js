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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("./email/email.service");
const DEMO_NOTIFICATIONS = [
    {
        id: 'notif-demo-001',
        recipientUserId: 'user-hr-admin-dev',
        type: 'TASK_ASSIGNED',
        channel: 'IN_APP',
        title: 'New Onboarding Task Assigned',
        message: 'IT Department task "Prepare Developer Laptop" assigned for Alex Turner.',
        priority: 'HIGH',
        status: 'SENT',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
        id: 'notif-demo-002',
        recipientUserId: 'user-hr-admin-dev',
        type: 'DOCUMENT_PENDING',
        channel: 'IN_APP',
        title: 'Document Submitted for Review',
        message: 'Rahul Sharma uploaded Aadhaar Card scan for HR verification.',
        priority: 'MEDIUM',
        status: 'SENT',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
];
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async createNotification(dto) {
        let recipientEmail = null;
        let recipientName = null;
        try {
            if (dto.recipientUserId) {
                const user = await this.prisma.user.findUnique({ where: { id: dto.recipientUserId } });
                if (user) {
                    recipientEmail = user.email;
                    recipientName = user.name;
                }
            }
            else if (dto.employeeId) {
                const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
                if (employee) {
                    recipientEmail = employee.email;
                    recipientName = `${employee.firstName} ${employee.lastName}`;
                }
            }
            const notification = await this.prisma.notification.create({
                data: {
                    recipientUserId: dto.recipientUserId || null,
                    userId: dto.recipientUserId || null,
                    employeeId: dto.employeeId || null,
                    candidateId: dto.candidateId || null,
                    type: dto.type,
                    channel: dto.channel || 'IN_APP',
                    title: dto.title,
                    message: dto.message,
                    relatedEntityType: dto.relatedEntityType || null,
                    relatedEntityId: dto.relatedEntityId || null,
                    priority: dto.priority || 'MEDIUM',
                    status: 'SENT',
                    isRead: false,
                    scheduledFor: dto.scheduledFor || null,
                    sentAt: new Date(),
                },
            });
            if (recipientEmail && (dto.channel === 'EMAIL' || dto.priority === 'HIGH' || dto.priority === 'CRITICAL')) {
                await this.emailService.sendEmail({
                    to: recipientEmail,
                    templateType: this.mapTypeToEmailTemplate(dto.type),
                    data: {
                        employeeName: recipientName || 'Employee',
                        taskTitle: dto.title,
                        joiningDate: new Date().toLocaleDateString(),
                        actionUrl: `http://localhost:3000/employees/${dto.employeeId || ''}`,
                    },
                });
            }
            return notification;
        }
        catch (err) {
            this.logger.warn(`Database notification insert skipped (DB offline): ${err.message}`);
            return null;
        }
    }
    async getUserNotifications(userId, query) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {
            OR: [{ recipientUserId: userId }, { userId }],
        };
        if (query?.unreadOnly) {
            where.isRead = false;
        }
        if (query?.type) {
            where.type = query.type;
        }
        if (query?.priority) {
            where.priority = query.priority;
        }
        try {
            const [items, total] = await Promise.all([
                this.prisma.notification.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.notification.count({ where }),
            ]);
            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (err) {
            this.logger.warn(`Database search unavailable for notifications: ${err.message}. Returning demo notifications.`);
            return {
                items: DEMO_NOTIFICATIONS,
                total: DEMO_NOTIFICATIONS.length,
                page: 1,
                limit: 20,
                totalPages: 1,
            };
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await this.prisma.notification.count({
                where: {
                    OR: [{ recipientUserId: userId }, { userId }],
                    isRead: false,
                },
            });
            return { unreadCount: count };
        }
        catch (err) {
            return { unreadCount: DEMO_NOTIFICATIONS.length };
        }
    }
    async markAsRead(id, userId) {
        try {
            const notification = await this.prisma.notification.findUnique({ where: { id } });
            if (!notification) {
                throw new common_1.NotFoundException(`Notification '${id}' not found.`);
            }
            if (notification.recipientUserId && notification.recipientUserId !== userId && notification.userId !== userId) {
                throw new common_1.ForbiddenException('Not authorized to update this notification.');
            }
            return await this.prisma.notification.update({
                where: { id },
                data: { isRead: true, readAt: new Date() },
            });
        }
        catch (err) {
            return { id, isRead: true };
        }
    }
    async markAllAsRead(userId) {
        try {
            await this.prisma.notification.updateMany({
                where: {
                    OR: [{ recipientUserId: userId }, { userId }],
                    isRead: false,
                },
                data: { isRead: true, readAt: new Date() },
            });
        }
        catch (err) {
        }
        return { message: 'All notifications marked as read.' };
    }
    async deleteNotification(id, userId) {
        try {
            const notification = await this.prisma.notification.findUnique({ where: { id } });
            if (!notification) {
                throw new common_1.NotFoundException(`Notification '${id}' not found.`);
            }
            if (notification.recipientUserId && notification.recipientUserId !== userId && notification.userId !== userId) {
                throw new common_1.ForbiddenException('Not authorized to delete this notification.');
            }
            await this.prisma.notification.delete({ where: { id } });
        }
        catch (err) {
        }
        return { message: 'Notification deleted.' };
    }
    async getUserPreferences(userId) {
        try {
            let pref = await this.prisma.notificationPreference.findUnique({ where: { userId } });
            if (!pref) {
                pref = await this.prisma.notificationPreference.create({
                    data: { userId },
                });
            }
            return pref;
        }
        catch (err) {
            return {
                userId,
                emailNotificationsEnabled: true,
                inAppNotificationsEnabled: true,
                documentNotifications: true,
                verificationNotifications: true,
                taskNotifications: true,
                assetNotifications: true,
                joiningReminders: true,
                overdueEscalations: true,
            };
        }
    }
    async updateUserPreferences(userId, dto) {
        try {
            return await this.prisma.notificationPreference.upsert({
                where: { userId },
                update: { ...dto },
                create: { userId, ...dto },
            });
        }
        catch (err) {
            return { userId, ...dto };
        }
    }
    mapTypeToEmailTemplate(type) {
        switch (type) {
            case 'TASK_ASSIGNED':
                return 'ONBOARDING_TASK_ASSIGNED';
            case 'DOCUMENT_PENDING':
                return 'ONBOARDING_DOCUMENT_PENDING';
            case 'DOCUMENT_REJECTED':
                return 'ONBOARDING_DOCUMENT_REJECTED';
            case 'TASK_OVERDUE':
                return 'ONBOARDING_TASK_OVERDUE';
            case 'ONBOARDING_BLOCKED':
                return 'ONBOARDING_BLOCKED';
            case 'ONBOARDING_READY':
                return 'ONBOARDING_READY';
            default:
                return 'ONBOARDING_JOINING_REMINDER';
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map