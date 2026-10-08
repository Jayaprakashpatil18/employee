import { PrismaService } from '../prisma/prisma.service';
export interface RecordAuditOptions {
    actorUserId?: string;
    actorRole?: string;
    action: string;
    entity?: string;
    entityType?: string;
    entityId?: string;
    employeeId?: string;
    description?: string;
    oldValue?: any;
    newValue?: any;
    details?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface QueryAuditDto {
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    actorUserId?: string;
    action?: string;
    entityType?: string;
    employeeId?: string;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    record(options: RecordAuditOptions): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        employeeId: string | null;
        userId: string | null;
        actorRole: string | null;
        action: string;
        entity: string;
        entityType: string | null;
        entityId: string | null;
        oldValue: string | null;
        newValue: string | null;
        details: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    queryAuditLogs(query?: QueryAuditDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAuditHistoryForEntity(entityType: string, entityId: string): Promise<any[]>;
    getAuditHistoryForEmployee(employeeId: string): Promise<any[]>;
    sanitizeMetadata(obj: any): any;
}
