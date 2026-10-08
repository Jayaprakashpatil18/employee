import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingReadinessService } from '../readiness/readiness.service';
import { OnboardingStatus } from '@prisma/client';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: any;
  let mockReadinessService: any;

  const mockEmployeeA = {
    id: 'emp-1',
    employeeId: 'EMP-2026-0001',
    firstName: 'Alex',
    lastName: 'Turner',
    department: 'Engineering',
    location: 'Bengaluru',
    joiningDate: new Date(), // Joining Today
    onboardingStatus: OnboardingStatus.READY,
    documents: [{ isRequired: true, verificationStatus: 'VERIFIED' }],
    verifications: [{ isMandatory: true, status: 'COMPLETED', result: 'CLEAR' }],
    tasks: [{ isMandatory: true, status: 'COMPLETED' }],
    assets: [{ isMandatory: true, status: 'READY' }],
    checklist: [{ isMandatory: true, isCompleted: true }],
  };

  const mockEmployeeB = {
    id: 'emp-2',
    employeeId: 'EMP-2026-0002',
    firstName: 'David',
    lastName: 'Blocked',
    department: 'Engineering',
    location: 'Bengaluru',
    joiningDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    onboardingStatus: OnboardingStatus.BLOCKED,
    documents: [],
    verifications: [{ isMandatory: true, status: 'COMPLETED', result: 'FAILED', remarks: 'Discrepancy' }],
    tasks: [],
    assets: [],
    checklist: [],
  };

  beforeEach(async () => {
    mockPrisma = {
      employee: {
        findMany: jest.fn().mockResolvedValue([mockEmployeeA, mockEmployeeB]),
      },
    };

    mockReadinessService = {
      evaluateReadiness: jest.fn().mockResolvedValue({ status: 'READY' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OnboardingReadinessService, useValue: mockReadinessService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('Summary & Analytics', () => {
    it('should aggregate top-level KPI counts from evaluated employees', async () => {
      const summary = await service.getSummary();
      expect(summary.upcomingJoiners).toBe(2);
      expect(summary.ready).toBe(1);
      expect(summary.blocked).toBe(1);
    });

    it('should calculate readiness distribution analytics', async () => {
      const analytics = await service.getAnalytics();
      expect(analytics.readinessDistribution).toHaveLength(4);
      expect(analytics.departmentOverview.length).toBeGreaterThan(0);
    });
  });

  describe('Attention Required & Urgency Calculation', () => {
    it('should return BLOCKED employees in attention required section', async () => {
      const attentionList = await service.getAttentionRequired();
      expect(attentionList.length).toBeGreaterThan(0);
      expect(attentionList[0].status).toBe(OnboardingStatus.BLOCKED);
    });

    it('should calculate dynamic joining date urgency labels', async () => {
      const joiners = await service.getUpcomingJoiners();
      expect(joiners[0].joiningUrgency).toBe('Joining Today');
      expect(joiners[1].joiningUrgency).toBe('In 3 Days');
    });
  });
});
