import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingPlanMatchingService } from './onboarding-plan-matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('OnboardingPlanMatchingService', () => {
  let service: OnboardingPlanMatchingService;
  let prisma: PrismaService;

  const mockPlans = [
    {
      id: 'plan-1-exact',
      title: 'Exact Engineering Plan',
      department: 'Engineering',
      designation: 'Software Engineer',
      location: 'Bengaluru',
      employmentType: 'Full Time',
      isActive: true,
    },
    {
      id: 'plan-2-partial-desig',
      title: 'Partial Design Plan',
      department: 'Engineering',
      designation: 'Software Engineer',
      location: null,
      employmentType: 'Full Time',
      isActive: true,
    },
    {
      id: 'plan-3-dept-fallback',
      title: 'General Engineering Plan',
      department: 'Engineering',
      designation: null,
      location: null,
      employmentType: null,
      isActive: true,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingPlanMatchingService,
        {
          provide: PrismaService,
          useValue: {
            onboardingPlan: {
              findMany: jest.fn().mockImplementation(({ where }) => {
                if (where.department.equals === 'Engineering') {
                  return mockPlans;
                }
                return [];
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OnboardingPlanMatchingService>(OnboardingPlanMatchingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return exact match when all parameters match', async () => {
    const result = await service.findMatchingPlan({
      department: 'Engineering',
      designation: 'Software Engineer',
      location: 'Bengaluru',
      employmentType: 'Full Time',
    });

    expect(result.id).toEqual('plan-1-exact');
  });

  it('should fallback to partial match (Department + Designation + Employment Type)', async () => {
    const result = await service.findMatchingPlan({
      department: 'Engineering',
      designation: 'Software Engineer',
      location: 'Singapore', // Different location
      employmentType: 'Full Time',
    });

    expect(result.id).toEqual('plan-2-partial-desig');
  });

  it('should fallback to department general plan when no designation matches', async () => {
    const result = await service.findMatchingPlan({
      department: 'Engineering',
      designation: 'QA Specialist',
      location: 'London',
      employmentType: 'Contract',
    });

    expect(result.id).toEqual('plan-3-dept-fallback');
  });

  it('should throw BadRequestException when no plan exists for department', async () => {
    await expect(
      service.findMatchingPlan({
        department: 'Quantum Robotics',
        designation: 'Researcher',
        location: 'Tokyo',
        employmentType: 'Full Time',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
