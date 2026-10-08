import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingReadinessService } from './readiness.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  OnboardingStatus,
  DocumentVerificationStatus,
  DocumentSubmissionStatus,
  VerificationStatus,
  VerificationResult,
  TaskStatus,
  AssetStatus,
  UserRole,
} from '@prisma/client';

describe('OnboardingReadinessService — Comprehensive Engine Tests', () => {
  let service: OnboardingReadinessService;
  let mockPrisma: any;

  const mockUser: any = {
    id: 'user-hr-1',
    name: 'HR Manager',
    email: 'hr@example.com',
    role: UserRole.HR_ADMIN,
  };

  const createMockEmployee = (overrides: any = {}) => ({
    id: 'emp-test-1',
    employeeId: 'EMP-2026-0001',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    joiningDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
    onboardingStatus: OnboardingStatus.PARTIALLY_READY,
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingReadinessService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OnboardingReadinessService>(OnboardingReadinessService);
  });

  // Test 1: READY — All mandatory requirements complete
  it('Test 1 — should return READY and 100% when all mandatory requirements are completed', async () => {
    const employee = createMockEmployee({
      documents: [
        {
          id: 'doc-1',
          documentType: 'Aadhaar',
          isRequired: true,
          verificationStatus: DocumentVerificationStatus.VERIFIED,
        },
      ],
      verifications: [
        {
          id: 'verif-1',
          verificationType: 'Criminal Check',
          isMandatory: true,
          status: VerificationStatus.COMPLETED,
          result: VerificationResult.CLEAR,
        },
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Setup Workstation',
          isMandatory: true,
          status: TaskStatus.COMPLETED,
        },
      ],
      assets: [
        {
          id: 'asset-1',
          assetName: 'MacBook Pro',
          isMandatory: true,
          status: AssetStatus.READY,
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
    expect(result.status).toBe(OnboardingStatus.READY);
    expect(result.readinessPercentage).toBe(100);
    expect(result.summary.completedRequirements).toBe(5);
    expect(result.summary.pendingRequirements).toBe(0);
  });

  // Test 2: PARTIALLY_READY — Some requirements incomplete, no overdue or blocker
  it('Test 2 — should return PARTIALLY_READY when requirements are incomplete without blockers/overdue', async () => {
    const employee = createMockEmployee({
      documents: [
        { id: 'doc-1', documentType: 'Passport', isRequired: true, verificationStatus: DocumentVerificationStatus.VERIFIED },
      ],
      tasks: [
        { id: 'task-1', title: 'Setup Email', isMandatory: true, status: TaskStatus.TODO, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.PARTIALLY_READY);
    expect(result.readinessPercentage).toBe(50);
  });

  // Test 3: DELAYED — Mandatory requirement overdue
  it('Test 3 — should return DELAYED when a mandatory task is overdue', async () => {
    const employee = createMockEmployee({
      tasks: [
        {
          id: 'task-1',
          title: 'Submit Tax Forms',
          isMandatory: true,
          status: TaskStatus.TODO,
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days in past
        },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.DELAYED);
    expect(result.summary.overdueRequirements).toBe(1);
  });

  // Test 4: BLOCKED — Critical background verification FAILED
  it('Test 4 — should return BLOCKED when background verification result is FAILED', async () => {
    const employee = createMockEmployee({
      verifications: [
        {
          id: 'verif-1',
          verificationType: 'Education Verification',
          isMandatory: true,
          status: VerificationStatus.COMPLETED,
          result: VerificationResult.FAILED,
          remarks: 'Diploma degree unverified',
        },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.BLOCKED);
    expect(result.summary.blockedRequirements).toBe(1);
  });

  // Test 5: BLOCKED — Critical document REJECTED
  it('Test 5 — should return BLOCKED when a mandatory document is REJECTED', async () => {
    const employee = createMockEmployee({
      documents: [
        {
          id: 'doc-1',
          documentType: 'PAN Card',
          isRequired: true,
          verificationStatus: DocumentVerificationStatus.REJECTED,
          rejectionReason: 'Illegible scan',
        },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.BLOCKED);
    expect(result.issues.some((i) => i.type === 'BLOCKED' || i.type === 'REJECTED')).toBe(true);
  });

  // Test 6: BLOCKED — Mandatory task BLOCKED
  it('Test 6 — should return BLOCKED when a mandatory task status is BLOCKED', async () => {
    const employee = createMockEmployee({
      tasks: [
        {
          id: 'task-1',
          title: 'Security Clearance',
          isMandatory: true,
          status: TaskStatus.BLOCKED,
          completionRemarks: 'Waiting for vendor approval',
        },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.BLOCKED);
  });

  // Test 7: BLOCKED — Mandatory asset BLOCKED
  it('Test 7 — should return BLOCKED when a mandatory asset status is BLOCKED', async () => {
    const employee = createMockEmployee({
      assets: [
        {
          id: 'asset-1',
          assetName: 'Developer Laptop',
          isMandatory: true,
          status: AssetStatus.BLOCKED,
          remarks: 'Out of stock',
        },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.BLOCKED);
  });

  // Test 8: Task overdue but completed -> NOT DELAYED
  it('Test 8 — should NOT treat completed overdue task as DELAYED', async () => {
    const employee = createMockEmployee({
      tasks: [
        {
          id: 'task-1',
          title: 'Sign Agreement',
          isMandatory: true,
          status: TaskStatus.COMPLETED,
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // past due date, but completed
        },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.READY);
    expect(result.summary.overdueRequirements).toBe(0);
  });

  // Test 9: Optional requirement incomplete -> Does NOT prevent READY
  it('Test 9 — should allow READY status when optional requirement is incomplete', async () => {
    const employee = createMockEmployee({
      tasks: [
        { id: 'task-1', title: 'Mandatory Setup', isMandatory: true, status: TaskStatus.COMPLETED },
        { id: 'task-2', title: 'Optional Welcome Video', isMandatory: false, status: TaskStatus.TODO },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.READY);
    expect(result.readinessPercentage).toBe(100);
  });

  // Test 10: Needs-review verification -> Not READY
  it('Test 10 — should NOT be READY when background verification is NEEDS_REVIEW', async () => {
    const employee = createMockEmployee({
      verifications: [
        {
          id: 'verif-1',
          verificationType: 'Previous Employment',
          isMandatory: true,
          status: VerificationStatus.COMPLETED,
          result: VerificationResult.NEEDS_REVIEW,
        },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).not.toBe(OnboardingStatus.READY);
    expect(result.issues.some((i) => i.type === 'NEEDS_REVIEW')).toBe(true);
  });

  // Test 11: Multiple issues returned
  it('Test 11 — should return all actionable issues for an employee', async () => {
    const employee = createMockEmployee({
      documents: [
        { id: 'doc-1', documentType: 'PAN', isRequired: true, verificationStatus: DocumentVerificationStatus.REJECTED },
      ],
      tasks: [
        { id: 'task-1', title: 'Setup Laptop', isMandatory: true, status: TaskStatus.TODO, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });

  // Test 12: Status Precedence — BLOCKED takes precedence over DELAYED
  it('Test 12 — should enforce status precedence (BLOCKED takes precedence over DELAYED)', async () => {
    const employee = createMockEmployee({
      verifications: [
        { id: 'verif-1', verificationType: 'Police Clearance', isMandatory: true, status: VerificationStatus.COMPLETED, result: VerificationResult.FAILED },
      ],
      tasks: [
        { id: 'task-1', title: 'Overdue Task', isMandatory: true, status: TaskStatus.TODO, dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      ],
    });

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.BLOCKED);
  });

  // Test 13: Zero requirements handling
  it('Test 13 — should handle employees with zero requirements gracefully', async () => {
    const employee = createMockEmployee();

    mockPrisma.employee.findUnique.mockResolvedValue(employee);

    const result = await service.evaluateReadiness('emp-test-1', mockUser);
    expect(result.status).toBe(OnboardingStatus.PARTIALLY_READY);
    expect(result.summary.totalRequirements).toBe(0);
    expect(result.readinessPercentage).toBe(0);
  });
});
