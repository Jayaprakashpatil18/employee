import { AuditService, QueryAuditDto } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: QueryAuditDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByEntity(entityType: string, entityId: string): Promise<any[]>;
    findByEmployee(employeeId: string): Promise<any[]>;
}
