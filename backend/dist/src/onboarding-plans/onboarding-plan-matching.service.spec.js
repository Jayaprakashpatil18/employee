"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const onboarding_plan_matching_service_1 = require("./onboarding-plan-matching.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
describe('OnboardingPlanMatchingService', () => {
    let service;
    let prisma;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                onboarding_plan_matching_service_1.OnboardingPlanMatchingService,
                {
                    provide: prisma_service_1.PrismaService,
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
        service = module.get(onboarding_plan_matching_service_1.OnboardingPlanMatchingService);
        prisma = module.get(prisma_service_1.PrismaService);
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
            location: 'Singapore',
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
        await expect(service.findMatchingPlan({
            department: 'Quantum Robotics',
            designation: 'Researcher',
            location: 'Tokyo',
            employmentType: 'Full Time',
        })).rejects.toThrow(common_1.BadRequestException);
    });
});
//# sourceMappingURL=onboarding-plan-matching.service.spec.js.map