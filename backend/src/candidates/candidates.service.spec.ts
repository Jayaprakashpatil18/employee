import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingPlanMatchingService } from '../onboarding-plans/onboarding-plan-matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';
import { CandidateStatus } from '@prisma/client';

describe('CandidatesService', () => {
  let service: CandidatesService;

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
    status: CandidateStatus.SELECTED,
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: PrismaService,
          useValue: {
            candidate: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === 'cand-101') return mockCandidate;
                if (where.id === 'cand-already-converted') {
                  return { ...mockCandidate, id: 'cand-already-converted', status: CandidateStatus.CONVERTED };
                }
                return null;
              }),
              findMany: jest.fn().mockResolvedValue([mockCandidate]),
              create: jest.fn().mockResolvedValue(mockCandidate),
              update: jest.fn().mockResolvedValue({ ...mockCandidate, status: CandidateStatus.CONVERTED }),
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
          provide: OnboardingPlanMatchingService,
          useValue: {
            findMatchingPlan: jest.fn().mockImplementation((profile) => {
              if (profile.department === 'Engineering') {
                return mockPlan;
              }
              throw new BadRequestException('No active onboarding plan is configured for this employee profile.');
            }),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
            notifyPlanAssigned: jest.fn().mockResolvedValue({ id: 'notif-1' }),
          },
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
  });

  it('should successfully convert a selected candidate into an employee and generate requirements', async () => {
    const result = await service.convertCandidateToEmployee('cand-101', 'user-hr-01');

    expect(result.success).toBe(true);
    expect(result.employeeCode).toBe('EMP-2026-0006');
    expect(result.requirementsGenerated.documentsCount).toBe(1);
    expect(result.requirementsGenerated.tasksCount).toBe(1);
  });

  it('should throw BadRequestException if candidate is already converted', async () => {
    await expect(
      service.convertCandidateToEmployee('cand-already-converted', 'user-hr-01'),
    ).rejects.toThrow(BadRequestException);
  });
});
