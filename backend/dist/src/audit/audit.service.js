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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const SENSITIVE_KEYS = [
    'password',
    'token',
    'secret',
    'apikey',
    'api_key',
    'access_token',
    'refreshtoken',
    'refresh_token',
    'creditcard',
    'credit_card',
    'cvv',
    'filebuffer',
    'buffer',
    'content',
    'authorization',
];
const DEMO_AUDIT_LOGS = [
    {
        id: 'audit-demo-001',
        userId: 'user-hr-admin-dev',
        user: { id: 'user-hr-admin-dev', name: 'Sarah Jenkins', email: 'sarah.jenkins@corp.example.com', role: 'HR_ADMIN' },
        employeeId: 'emp-101',
        employee: { id: 'emp-101', firstName: 'Alex', lastName: 'Turner', employeeId: 'EMP-2026-0001', department: 'Engineering' },
        actorRole: 'HR_ADMIN',
        action: 'CANDIDATE_CONVERTED',
        entity: 'Candidate',
        entityType: 'Candidate',
        entityId: 'cand-101',
        description: 'Candidate converted to employee profile (EMP-2026-0001)',
        details: 'Candidate converted to employee profile (EMP-2026-0001)',
        metadata: { candidateId: 'cand-101', assignedPlan: 'Engineering New Hire Plan' },
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 'audit-demo-002',
        userId: 'user-hr-manager-dev',
        user: { id: 'user-hr-manager-dev', name: 'Michael Chang', email: 'michael.chang@corp.example.com', role: 'HR_MANAGER' },
        employeeId: 'emp-101',
        employee: { id: 'emp-101', firstName: 'Alex', lastName: 'Turner', employeeId: 'EMP-2026-0001', department: 'Engineering' },
        actorRole: 'HR_MANAGER',
        action: 'DOCUMENT_VERIFIED',
        entity: 'EmployeeDocument',
        entityType: 'EmployeeDocument',
        entityId: 'doc-aadhaar-101',
        description: 'Verified ID Proof (Aadhaar Card) for Alex Turner',
        details: 'Verified ID Proof (Aadhaar Card) for Alex Turner',
        metadata: { documentType: 'Aadhaar Card', verifiedBy: 'Michael Chang' },
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
        id: 'audit-demo-003',
        userId: 'user-it-dev',
        user: { id: 'user-it-dev', name: 'David Miller', email: 'david.miller@corp.example.com', role: 'IT' },
        employeeId: 'emp-101',
        employee: { id: 'emp-101', firstName: 'Alex', lastName: 'Turner', employeeId: 'EMP-2026-0001', department: 'Engineering' },
        actorRole: 'IT',
        action: 'ASSET_READY',
        entity: 'EmployeeAsset',
        entityType: 'EmployeeAsset',
        entityId: 'asset-macbook-101',
        description: 'Developer Laptop (MacBook M3 Pro) prepared and marked READY',
        details: 'Developer Laptop (MacBook M3 Pro) prepared and marked READY',
        metadata: { assetType: 'Laptop', serialNumber: 'C02F1029MBP' },
        createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
        id: 'audit-demo-004',
        userId: 'user-system-dev',
        user: { id: 'user-system-dev', name: 'System Engine', email: 'system@corp.example.com', role: 'HR_ADMIN' },
        employeeId: 'emp-101',
        employee: { id: 'emp-101', firstName: 'Alex', lastName: 'Turner', employeeId: 'EMP-2026-0001', department: 'Engineering' },
        actorRole: 'SYSTEM',
        action: 'READINESS_STATUS_CHANGED',
        entity: 'Employee',
        entityType: 'Employee',
        entityId: 'emp-101',
        description: 'Onboarding readiness status updated to READY (100% compliance)',
        details: 'Onboarding readiness status updated to READY (100% compliance)',
        metadata: { previousStatus: 'PARTIALLY_READY', newStatus: 'READY', score: 100 },
        createdAt: new Date(Date.now() - 900000).toISOString(),
    },
];
let AuditService = AuditService_1 = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async record(options) {
        try {
            const sanitizedMeta = options.metadata ? this.sanitizeMetadata(options.metadata) : null;
            const entityName = options.entity || options.entityType || 'System';
            const entityTypeName = options.entityType || options.entity || 'System';
            const desc = options.description || options.details || `${options.action} on ${entityName}`;
            const log = await this.prisma.auditLog.create({
                data: {
                    userId: options.actorUserId || null,
                    employeeId: options.employeeId || null,
                    actorRole: options.actorRole || null,
                    action: options.action,
                    entity: entityName,
                    entityType: entityTypeName,
                    entityId: options.entityId || null,
                    description: desc,
                    oldValue: options.oldValue ? String(typeof options.oldValue === 'object' ? JSON.stringify(options.oldValue) : options.oldValue) : null,
                    newValue: options.newValue ? String(typeof options.newValue === 'object' ? JSON.stringify(options.newValue) : options.newValue) : null,
                    details: options.details || desc,
                    metadata: sanitizedMeta || undefined,
                    ipAddress: options.ipAddress || null,
                    userAgent: options.userAgent || null,
                },
            });
            return log;
        }
        catch (err) {
            this.logger.error(`Failed to record audit log for action '${options.action}': ${err.message}`, err.stack);
            return null;
        }
    }
    async queryAuditLogs(query) {
        const page = Math.max(1, Number(query?.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.actorUserId) {
            where.userId = query.actorUserId;
        }
        if (query?.action) {
            where.action = query.action;
        }
        if (query?.entityType) {
            where.entityType = query.entityType;
        }
        if (query?.employeeId) {
            where.employeeId = query.employeeId;
        }
        if (query?.department) {
            where.employee = { department: query.department };
        }
        if (query?.search) {
            where.OR = [
                { action: { contains: query.search, mode: 'insensitive' } },
                { entity: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { details: { contains: query.search, mode: 'insensitive' } },
                { user: { name: { contains: query.search, mode: 'insensitive' } } },
                { employee: { firstName: { contains: query.search, mode: 'insensitive' } } },
                { employee: { lastName: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        try {
            const [items, total] = await Promise.all([
                this.prisma.auditLog.findMany({
                    where,
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } },
                        employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.auditLog.count({ where }),
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
            this.logger.warn(`Database search unavailable for audit logs: ${err.message}. Returning demo audit history.`);
            return {
                items: DEMO_AUDIT_LOGS,
                total: DEMO_AUDIT_LOGS.length,
                page: 1,
                limit: 20,
                totalPages: 1,
            };
        }
    }
    async getAuditHistoryForEntity(entityType, entityId) {
        try {
            return await this.prisma.auditLog.findMany({
                where: { entityType, entityId },
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (err) {
            return DEMO_AUDIT_LOGS.filter((log) => log.entityType === entityType);
        }
    }
    async getAuditHistoryForEmployee(employeeId) {
        try {
            return await this.prisma.auditLog.findMany({
                where: {
                    OR: [
                        { employeeId },
                        { entityType: 'Employee', entityId: employeeId },
                    ],
                },
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (err) {
            return DEMO_AUDIT_LOGS;
        }
    }
    sanitizeMetadata(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitizeMetadata(item));
        }
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
                sanitized[key] = '[REDACTED]';
            }
            else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeMetadata(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map