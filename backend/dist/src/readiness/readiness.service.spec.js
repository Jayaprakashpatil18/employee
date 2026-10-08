"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const readiness_service_1 = require("./readiness.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
describe('OnboardingReadinessService — Comprehensive Engine Tests', () => {
    let service;
    let mockPrisma;
    const mockUser = {
        id: 'user-hr-1',
        name: 'HR Manager',
        email: 'hr@example.com',
        role: client_1.UserRole.HR_ADMIN,
    };
    const createMockEmployee = (overrides = {}) => ({
        id: 'emp-test-1',
        employeeId: 'EMP-2026-0001',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        department: 'Engineering',
        designation: 'Senior Developer',
        joiningDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        onboardingStatus: client_1.OnboardingStatus.PARTIALLY_READY,
        documents: [],
        verifications: [],
        tasks: [],
        assets: [],
        checklist: [],
        ...overrides,
    });
    beforeEach(async () => {
        mockPrisma = {
            employee: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...createMockEmployee(), ...data })),
            },
            auditLog: {
                create: jest.fn().mockResolvedValue({ id: 'log-1' }),
            },
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                readiness_service_1.OnboardingReadinessService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get(readiness_service_1.OnboardingReadinessService);
    });
    it('Test 1 — should return READY and 100% when all mandatory requirements are completed', async () => {
        const employee = createMockEmployee({
            documents: [
                {
                    id: 'doc-1',
                    documentType: 'Aadhaar',
                    isRequired: true,
                    verificationStatus: client_1.DocumentVerificationStatus.VERIFIED,
                },
            ],
            verifications: [
                {
                    id: 'verif-1',
                    verificationType: 'Criminal Check',
                    isMandatory: true,
                    status: client_1.VerificationStatus.COMPLETED,
                    result: client_1.VerificationResult.CLEAR,
                },
            ],
            tasks: [
                {
                    id: 'task-1',
                    title: 'Setup Workstation',
                    isMandatory: true,
                    status: client_1.TaskStatus.COMPLETED,
                },
            ],
            assets: [
                {
                    id: 'asset-1',
                    assetName: 'MacBook Pro',
                    isMandatory: true,
                    status: client_1.AssetStatus.READY,
                },
            ],
            checklist: [
                {
                    id: 'chk-1',
                    title: 'ID Card Provisioned',
                    isMandatory: true,
                    isCompleted: true,
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.READY);
        expect(result.readinessPercentage).toBe(100);
        expect(result.summary.completedRequirements).toBe(5);
        expect(result.summary.pendingRequirements).toBe(0);
    });
    it('Test 2 — should return PARTIALLY_READY when requirements are incomplete without blockers/overdue', async () => {
        const employee = createMockEmployee({
            documents: [
                { id: 'doc-1', documentType: 'Passport', isRequired: true, verificationStatus: client_1.DocumentVerificationStatus.VERIFIED },
            ],
            tasks: [
                { id: 'task-1', title: 'Setup Email', isMandatory: true, status: client_1.TaskStatus.TODO, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.PARTIALLY_READY);
        expect(result.readinessPercentage).toBe(50);
    });
    it('Test 3 — should return DELAYED when a mandatory task is overdue', async () => {
        const employee = createMockEmployee({
            tasks: [
                {
                    id: 'task-1',
                    title: 'Submit Tax Forms',
                    isMandatory: true,
                    status: client_1.TaskStatus.TODO,
                    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.DELAYED);
        expect(result.summary.overdueRequirements).toBe(1);
    });
    it('Test 4 — should return BLOCKED when background verification result is FAILED', async () => {
        const employee = createMockEmployee({
            verifications: [
                {
                    id: 'verif-1',
                    verificationType: 'Education Verification',
                    isMandatory: true,
                    status: client_1.VerificationStatus.COMPLETED,
                    result: client_1.VerificationResult.FAILED,
                    remarks: 'Diploma degree unverified',
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.BLOCKED);
        expect(result.summary.blockedRequirements).toBe(1);
    });
    it('Test 5 — should return BLOCKED when a mandatory document is REJECTED', async () => {
        const employee = createMockEmployee({
            documents: [
                {
                    id: 'doc-1',
                    documentType: 'PAN Card',
                    isRequired: true,
                    verificationStatus: client_1.DocumentVerificationStatus.REJECTED,
                    rejectionReason: 'Illegible scan',
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.BLOCKED);
        expect(result.issues.some((i) => i.type === 'BLOCKED' || i.type === 'REJECTED')).toBe(true);
    });
    it('Test 6 — should return BLOCKED when a mandatory task status is BLOCKED', async () => {
        const employee = createMockEmployee({
            tasks: [
                {
                    id: 'task-1',
                    title: 'Security Clearance',
                    isMandatory: true,
                    status: client_1.TaskStatus.BLOCKED,
                    completionRemarks: 'Waiting for vendor approval',
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.BLOCKED);
    });
    it('Test 7 — should return BLOCKED when a mandatory asset status is BLOCKED', async () => {
        const employee = createMockEmployee({
            assets: [
                {
                    id: 'asset-1',
                    assetName: 'Developer Laptop',
                    isMandatory: true,
                    status: client_1.AssetStatus.BLOCKED,
                    remarks: 'Out of stock',
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.BLOCKED);
    });
    it('Test 8 — should NOT treat completed overdue task as DELAYED', async () => {
        const employee = createMockEmployee({
            tasks: [
                {
                    id: 'task-1',
                    title: 'Sign Agreement',
                    isMandatory: true,
                    status: client_1.TaskStatus.COMPLETED,
                    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.READY);
        expect(result.summary.overdueRequirements).toBe(0);
    });
    it('Test 9 — should allow READY status when optional requirement is incomplete', async () => {
        const employee = createMockEmployee({
            tasks: [
                { id: 'task-1', title: 'Mandatory Setup', isMandatory: true, status: client_1.TaskStatus.COMPLETED },
                { id: 'task-2', title: 'Optional Welcome Video', isMandatory: false, status: client_1.TaskStatus.TODO },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.READY);
        expect(result.readinessPercentage).toBe(100);
    });
    it('Test 10 — should NOT be READY when background verification is NEEDS_REVIEW', async () => {
        const employee = createMockEmployee({
            verifications: [
                {
                    id: 'verif-1',
                    verificationType: 'Previous Employment',
                    isMandatory: true,
                    status: client_1.VerificationStatus.COMPLETED,
                    result: client_1.VerificationResult.NEEDS_REVIEW,
                },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).not.toBe(client_1.OnboardingStatus.READY);
        expect(result.issues.some((i) => i.type === 'NEEDS_REVIEW')).toBe(true);
    });
    it('Test 11 — should return all actionable issues for an employee', async () => {
        const employee = createMockEmployee({
            documents: [
                { id: 'doc-1', documentType: 'PAN', isRequired: true, verificationStatus: client_1.DocumentVerificationStatus.REJECTED },
            ],
            tasks: [
                { id: 'task-1', title: 'Setup Laptop', isMandatory: true, status: client_1.TaskStatus.TODO, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.issues.length).toBeGreaterThanOrEqual(2);
    });
    it('Test 12 — should enforce status precedence (BLOCKED takes precedence over DELAYED)', async () => {
        const employee = createMockEmployee({
            verifications: [
                { id: 'verif-1', verificationType: 'Police Clearance', isMandatory: true, status: client_1.VerificationStatus.COMPLETED, result: client_1.VerificationResult.FAILED },
            ],
            tasks: [
                { id: 'task-1', title: 'Overdue Task', isMandatory: true, status: client_1.TaskStatus.TODO, dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
            ],
        });
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.BLOCKED);
    });
    it('Test 13 — should handle employees with zero requirements gracefully', async () => {
        const employee = createMockEmployee();
        mockPrisma.employee.findUnique.mockResolvedValue(employee);
        const result = await service.evaluateReadiness('emp-test-1', mockUser);
        expect(result.status).toBe(client_1.OnboardingStatus.PARTIALLY_READY);
        expect(result.summary.totalRequirements).toBe(0);
        expect(result.readinessPercentage).toBe(0);
    });
});
//# sourceMappingURL=readiness.service.spec.js.map