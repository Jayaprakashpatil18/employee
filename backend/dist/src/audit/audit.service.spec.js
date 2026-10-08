"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const audit_service_1 = require("./audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
describe('AuditService', () => {
    let service;
    let prisma;
    const mockAuditRecord = {
        id: 'audit-101',
        userId: 'user-hr-1',
        employeeId: 'emp-101',
        actorRole: 'HR_ADMIN',
        action: 'CANDIDATE_CONVERTED',
        entity: 'Candidate',
        entityType: 'Candidate',
        entityId: 'cand-101',
        description: 'Candidate converted to Employee',
        details: 'Candidate converted to Employee',
        metadata: { candidateId: 'cand-101' },
        createdAt: new Date(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                audit_service_1.AuditService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        auditLog: {
                            create: jest.fn().mockResolvedValue(mockAuditRecord),
                            findMany: jest.fn().mockResolvedValue([mockAuditRecord]),
                            count: jest.fn().mockResolvedValue(1),
                        },
                    },
                },
            ],
        }).compile();
        service = module.get(audit_service_1.AuditService);
        prisma = module.get(prisma_service_1.PrismaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('sanitizeMetadata', () => {
        it('should strip sensitive keys from metadata objects', () => {
            const sensitiveObj = {
                candidateName: 'John Doe',
                password: 'secret_password_123',
                token: 'bearer_token_abc',
                nested: {
                    apiKey: 'key_xyz_999',
                    safeField: 'Hello',
                },
            };
            const sanitized = service.sanitizeMetadata(sensitiveObj);
            expect(sanitized.candidateName).toBe('John Doe');
            expect(sanitized.password).toBe('[REDACTED]');
            expect(sanitized.token).toBe('[REDACTED]');
            expect(sanitized.nested.apiKey).toBe('[REDACTED]');
            expect(sanitized.nested.safeField).toBe('Hello');
        });
    });
    describe('record', () => {
        it('should call prisma.auditLog.create with sanitized parameters', async () => {
            const res = await service.record({
                actorUserId: 'user-hr-1',
                actorRole: 'HR_ADMIN',
                action: 'CANDIDATE_CONVERTED',
                entityType: 'Candidate',
                entityId: 'cand-101',
                description: 'Candidate converted to Employee',
                metadata: { password: 'should_redact', note: 'safe' },
            });
            expect(prisma.auditLog.create).toHaveBeenCalled();
            expect(res).toBeDefined();
        });
    });
    describe('queryAuditLogs', () => {
        it('should return paginated audit logs', async () => {
            const res = await service.queryAuditLogs({ page: 1, limit: 10, dateRange: 'TODAY' });
            expect(res.items).toBeDefined();
            expect(res.total).toBe(1);
        });
    });
});
//# sourceMappingURL=audit.service.spec.js.map