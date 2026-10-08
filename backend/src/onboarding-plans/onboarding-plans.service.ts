import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface CreatePlanDto {
  title: string;
  description?: string;
  department: string;
  designation?: string;
  location?: string;
  employmentType?: string;
  isActive?: boolean;
  documentRequirements?: {
    documentType: string;
    isRequired?: boolean;
    verificationRequired?: boolean;
    description?: string;
  }[];
  taskRequirements?: {
    title: string;
    description?: string;
    assignedDepartment: string;
    defaultAssigneeRole?: UserRole;
    isMandatory?: boolean;
    dueDaysFromJoining?: number;
  }[];
  assetRequirements?: {
    assetType: string;
    isMandatory?: boolean;
    description?: string;
  }[];
  checklistRequirements?: {
    title: string;
    category?: string;
    isMandatory?: boolean;
  }[];
}

@Injectable()
export class OnboardingPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanDto) {
    // Backend validation: prevent conflicting active plans for identical parameters
    if (dto.isActive !== false) {
      await this.validateUniqueActivePlan(
        dto.department,
        dto.designation,
        dto.location,
        dto.employmentType,
      );
    }

    return this.prisma.onboardingPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        department: dto.department,
        designation: dto.designation || null,
        location: dto.location || null,
        employmentType: dto.employmentType || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        documentRequirements: {
          create: dto.documentRequirements || [],
        },
        taskRequirements: {
          create: dto.taskRequirements || [],
        },
        assetRequirements: {
          create: dto.assetRequirements || [],
        },
        checklistRequirements: {
          create: dto.checklistRequirements || [],
        },
      },
      include: {
        documentRequirements: true,
        taskRequirements: true,
        assetRequirements: true,
        checklistRequirements: true,
      },
    });
  }

  async findAll() {
    return this.prisma.onboardingPlan.findMany({
      include: {
        documentRequirements: true,
        taskRequirements: true,
        assetRequirements: true,
        checklistRequirements: true,
        _count: { select: { employees: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.onboardingPlan.findUnique({
      where: { id },
      include: {
        documentRequirements: true,
        taskRequirements: true,
        assetRequirements: true,
        checklistRequirements: true,
        employees: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Onboarding plan with ID '${id}' not found`);
    }

    return plan;
  }

  async update(id: string, dto: Partial<CreatePlanDto>) {
    const existing = await this.findOne(id);

    if (dto.isActive === true) {
      await this.validateUniqueActivePlan(
        dto.department || existing.department,
        dto.designation !== undefined ? dto.designation : existing.designation,
        dto.location !== undefined ? dto.location : existing.location,
        dto.employmentType !== undefined ? dto.employmentType : existing.employmentType,
        id,
      );
    }

    return this.prisma.onboardingPlan.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        department: dto.department,
        designation: dto.designation,
        location: dto.location,
        employmentType: dto.employmentType,
        isActive: dto.isActive,
      },
      include: {
        documentRequirements: true,
        taskRequirements: true,
        assetRequirements: true,
        checklistRequirements: true,
      },
    });
  }

  async setPlanStatus(id: string, isActive: boolean) {
    const plan = await this.findOne(id);

    if (isActive) {
      await this.validateUniqueActivePlan(
        plan.department,
        plan.designation,
        plan.location,
        plan.employmentType,
        id,
      );
    }

    return this.prisma.onboardingPlan.update({
      where: { id },
      data: { isActive },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.onboardingPlan.delete({ where: { id } });
  }

  private async validateUniqueActivePlan(
    department: string,
    designation?: string | null,
    location?: string | null,
    employmentType?: string | null,
    excludePlanId?: string,
  ) {
    const activeDuplicate = await this.prisma.onboardingPlan.findFirst({
      where: {
        id: excludePlanId ? { not: excludePlanId } : undefined,
        department: { equals: department, mode: 'insensitive' },
        designation: designation ? { equals: designation, mode: 'insensitive' } : null,
        location: location ? { equals: location, mode: 'insensitive' } : null,
        employmentType: employmentType ? { equals: employmentType, mode: 'insensitive' } : null,
        isActive: true,
      },
    });

    if (activeDuplicate) {
      throw new BadRequestException(
        `An active onboarding plan ('${activeDuplicate.title}') already exists for this combination of Department, Designation, Location, and Employment Type.`,
      );
    }
  }
}
