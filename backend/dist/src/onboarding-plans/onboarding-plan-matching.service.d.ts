import { PrismaService } from '../prisma/prisma.service';
import { OnboardingPlan, PlanDocumentRequirement, PlanTask, PlanAssetRequirement, PlanChecklistItemRequirement } from '@prisma/client';
export interface EmployeeProfileForMatching {
    department: string;
    designation: string;
    location: string;
    employmentType: string;
}
export type FullOnboardingPlan = OnboardingPlan & {
    documentRequirements: PlanDocumentRequirement[];
    taskRequirements: PlanTask[];
    assetRequirements: PlanAssetRequirement[];
    checklistRequirements: PlanChecklistItemRequirement[];
};
export declare class OnboardingPlanMatchingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMatchingPlan(profile: EmployeeProfileForMatching): Promise<FullOnboardingPlan>;
}
