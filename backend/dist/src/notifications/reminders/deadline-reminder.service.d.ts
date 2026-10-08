import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications.service';
export declare class DeadlineReminderService {
    private readonly prisma;
    private readonly notificationService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationService: NotificationsService);
    processDeadlineReminders(): Promise<{
        joiningRemindersSent: number;
        taskDueRemindersSent: number;
        overdueTasksEscalated: number;
    }>;
}
