"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const candidates_service_1 = require("./candidates.service");
const prisma_service_1 = require("../prisma/prisma.service");
const onboarding_plan_matching_service_1 = require("../onboarding-plans/onboarding-plan-matching.service");
const notifications_service_1 = require("../notifications/notifications.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
describe('CandidatesService', () => {
    let service;
    const mockCandidate = {
        id: 'cand-101',
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91-9876543210',
        department: 'Engineering',
        designation: 'Software Engineer',
        location: 'Bengaluru',
        employmentType: 'Full Time',
        expectedJoiningDate: new Date('2026-10-01'),
        status: client_1.CandidateStatus.SELECTED,
    };
    const mockPlan = {
        id: 'plan-eng-001',
        title: 'Engineering Plan',
        department: 'Engineering',
        documentRequirements: [{ documentType: 'ID Proof', verificationRequired: true }],
        taskRequirements: [{ title: 'Setup Laptop', assignedDepartment: 'IT', dueDaysFromJoining: -3, isMandatory: true }],
        assetRequirements: [{ assetType: 'Laptop', isMandatory: true }],
        checklistRequirements: [{ title: 'Manager Assigned', category: 'MANAGEMENT', isMandatory: true }],
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                candidates_service_1.CandidatesService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        candidate: {
                            findUnique: jest.fn().mockImplementation(({ where }) => {
                                if (where.id === 'cand-101')
                                    return mockCandidate;
                                if (where.id === 'cand-already-converted') {
                                    return { ...mockCandidate, id: 'cand-already-converted', status: client_1.CandidateStatus.CONVERTED };
                                }
                                return null;
                            }),
                            findMany: jest.fn().mockResolvedValue([mockCandidate]),
                            create: jest.fn().mockResolvedValue(mockCandidate),
                            update: jest.fn().mockResolvedValue({ ...mockCandidate, status: client_1.CandidateStatus.CONVERTED }),
                        },
                        employee: {
                            count: jest.fn().mockResolvedValue(5),
                        },
                        auditLog: {
                            create: jest.fn().mockResolvedValue({ id: 'log-1' }),
                        },
                        $transaction: jest.fn().mockImplementation(async (cb) => {
                            return cb({
                                employee: {
                                    count: jest.fn().mockResolvedValue(5),
                                    create: jest.fn().mockResolvedValue({ id: 'emp-501', employeeId: 'EMP-2026-0006' }),
                                },
                                employeeDocument: { create: jest.fn().mockResolvedValue({}) },
                                backgroundVerification: { create: jest.fn().mockResolvedValue({}) },
                                departmentTask: { create: jest.fn().mockResolvedValue({}) },
                                employeeAsset: { create: jest.fn().mockResolvedValue({}) },
                                joiningChecklistItem: { create: jest.fn().mockResolvedValue({}) },
                                candidate: { update: jest.fn().mockResolvedValue({}) },
                                auditLog: { create: jest.fn().mockResolvedValue({}) },
                            });
                        }),
                    },
                },
                {
                    provide: onboarding_plan_matching_service_1.OnboardingPlanMatchingService,
                    useValue: {
                        findMatchingPlan: jest.fn().mockImplementation((profile) => {
                            if (profile.department === 'Engineering') {
                                return mockPlan;
                            }
                            throw new common_1.BadRequestException('No active onboarding plan is configured for this employee profile.');
                        }),
                    },
                },
                {
                    provide: notifications_service_1.NotificationsService,
                    useValue: {
                        createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
                        notifyPlanAssigned: jest.fn().mockResolvedValue({ id: 'notif-1' }),
                    },
                },
            ],
        }).compile();
        service = module.get(candidates_service_1.CandidatesService);
    });
    it('should successfully convert a selected candidate into an employee and generate requirements', async () => {
        const result = await service.convertCandidateToEmployee('cand-101', 'user-hr-01');
        expect(result.success).toBe(true);
        expect(result.employeeCode).toBe('EMP-2026-0006');
        expect(result.requirementsGenerated.documentsCount).toBe(1);
        expect(result.requirementsGenerated.tasksCount).toBe(1);
    });
    it('should throw BadRequestException if candidate is already converted', async () => {
        await expect(service.convertCandidateToEmployee('cand-already-converted', 'user-hr-01')).rejects.toThrow(common_1.BadRequestException);
    });
});
//# sourceMappingURL=candidates.service.spec.js.map