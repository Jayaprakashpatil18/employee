import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OnboardingPlan,
  PlanDocumentRequirement,
  PlanTask,
  PlanAssetRequirement,
  PlanChecklistItemRequirement,
} from '@prisma/client';

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

@Injectable()
export class OnboardingPlanMatchingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find matching active onboarding plan based on strict fallback priority:
   * 1. Exact Match: Department + Designation + Location + Employment Type
   * 2. Department + Designation + Employment Type (where location is generic/null)
   * 3. Department + Employment Type (where designation is generic/null)
   * 4. Department General Fallback
   */
  async findMatchingPlan(profile: EmployeeProfileForMatching): Promise<FullOnboardingPlan> {
    const { department, designation, location, employmentType } = profile;

    // Fetch all active plans for the target department
    const activePlans = (await this.prisma.onboardingPlan.findMany({
      where: {
        department: { equals: department, mode: 'insensitive' },
        isActive: true,
      },
      include: {
        documentRequirements: true,
        taskRequirements: true,
        assetRequirements: true,
        checklistRequirements: true,
      },
    })) as FullOnboardingPlan[];

    if (!activePlans || activePlans.length === 0) {
      throw new BadRequestException(
        `No active onboarding plan is configured for department '${department}'.`,
      );
    }

    // Level 1: Exact match (Department + Designation + Location + Employment Type)
    const exactMatch = activePlans.find(
      (p) =>
        p.designation?.toLowerCase() === designation.toLowerCase() &&
        p.location?.toLowerCase() === location.toLowerCase() &&
        p.employmentType?.toLowerCase() === employmentType.toLowerCase(),
    );
    if (exactMatch) return exactMatch;

    // Level 2: Partial match (Department + Designation + Employment Type, generic/null location)
    const level2Match = activePlans.find(
      (p) =>
        p.designation?.toLowerCase() === designation.toLowerCase() &&
        p.employmentType?.toLowerCase() === employmentType.toLowerCase() &&
        (!p.location || p.location.trim() === ''),
    );
    if (level2Match) return level2Match;

    // Level 3: Partial match (Department + Employment Type, generic designation)
    const level3Match = activePlans.find(
      (p) =>
        p.employmentType?.toLowerCase() === employmentType.toLowerCase() &&
        (!p.designation || p.designation.trim() === ''),
    );
    if (level3Match) return level3Match;

    // Level 4: Department level general fallback plan (where specific matching fields are null/blank)
    const departmentFallback = activePlans.find(
      (p) => !p.designation && !p.location && !p.employmentType,
    ) || activePlans[0];

    if (departmentFallback) return departmentFallback;

    throw new BadRequestException(
      `No active onboarding plan is configured for this employee profile (${department}, ${designation}, ${location}, ${employmentType}).`,
    );
  }
}
