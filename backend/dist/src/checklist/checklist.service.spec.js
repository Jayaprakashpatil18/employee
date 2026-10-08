"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const checklist_service_1 = require("./checklist.service");
const prisma_service_1 = require("../prisma/prisma.service");
const readiness_service_1 = require("../readiness/readiness.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
describe('ChecklistService', () => {
    let service;
    let mockPrisma;
    let mockReadinessService;
    const mockHrUser = {
        id: 'user-hr-1',
        name: 'HR Manager',
        role: client_1.UserRole.HR_ADMIN,
    };
    const mockEmployeeUser = {
        id: 'user-emp-1',
        name: 'Standard Employee',
        role: client_1.UserRole.EMPLOYEE,
    };
    const mockChecklistItem = {
        id: 'chk-101',
        employeeId: 'emp-101',
        title: 'Manager Assigned',
        item: 'Manager Assigned',
        category: 'MANAGEMENT',
        isMandatory: true,
        isCompleted: false,
        completedAt: null,
        completedById: null,
        employee: { id: 'emp-101' },
    };
    beforeEach(async () => {
        mockPrisma = {
            employee: {
                findUnique: jest.fn().mockImplementation(({ where }) => {
                    if (where.id === 'emp-101')
                        return { id: 'emp-101' };
                    return null;
                }),
            },
            joiningChecklistItem: {
                findMany: jest.fn().mockResolvedValue([mockChecklistItem]),
                findUnique: jest.fn().mockImplementation(({ where }) => {
                    if (where.id === 'chk-101')
                        return mockChecklistItem;
                    return null;
                }),
                update: jest.fn().mockImplementation(({ where, data }) => ({
                    ...mockChecklistItem,
                    ...data,
                })),
            },
            auditLog: {
                create: jest.fn().mockResolvedValue({ id: 'log-1' }),
            },
        };
        mockReadinessService = {
            evaluateReadiness: jest.fn().mockResolvedValue({ status: 'PARTIALLY_READY' }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                checklist_service_1.ChecklistService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: readiness_service_1.OnboardingReadinessService, useValue: mockReadinessService },
            ],
        }).compile();
        service = module.get(checklist_service_1.ChecklistService);
    });
    describe('Checklist Completion & Reopening', () => {
        it('should complete checklist item, set completedBy and trigger readiness evaluation', async () => {
            const result = await service.completeItem('chk-101', mockHrUser);
            expect(result.isCompleted).toBe(true);
            expect(result.completedById).toBe(mockHrUser.id);
            expect(mockReadinessService.evaluateReadiness).toHaveBeenCalledWith('emp-101', mockHrUser);
        });
        it('should reopen completed checklist item and reset attribution', async () => {
            const result = await service.reopenItem('chk-101', mockHrUser);
            expect(result.isCompleted).toBe(false);
            expect(result.completedAt).toBeNull();
            expect(result.completedById).toBeNull();
            expect(mockReadinessService.evaluateReadiness).toHaveBeenCalledWith('emp-101', mockHrUser);
        });
    });
    describe('RBAC Authorization', () => {
        it('should forbid standard employees from completing checklist items', async () => {
            await expect(service.completeItem('chk-101', mockEmployeeUser)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=checklist.service.spec.js.map