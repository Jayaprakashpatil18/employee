import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingPlanMatchingService } from '../onboarding-plans/onboarding-plan-matching.service';
import { CandidateStatus, UserRole } from '@prisma/client';

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  location: string;
  employmentType: string;
  expectedJoiningDate: Date | string;
  status?: CandidateStatus;
}

export interface QueryCandidatesDto {
  search?: string;
  status?: CandidateStatus;
  department?: string;
  location?: string;
  employmentType?: string;
}

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingService: OnboardingPlanMatchingService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCandidateDto, currentUserId?: string) {
    const existing = await this.prisma.candidate.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException(`Candidate with email '${dto.email}' already exists.`);
    }

    const candidate = await this.prisma.candidate.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        designation: dto.designation,
        department: dto.department,
        location: dto.location || 'Remote',
        employmentType: dto.employmentType || 'Full Time',
        expectedJoiningDate: new Date(dto.expectedJoiningDate),
        status: dto.status || CandidateStatus.ACTIVE,
        createdById: currentUserId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'CANDIDATE_CREATED',
        entity: 'Candidate',
        entityType: 'Candidate',
        entityId: candidate.id,
        newValue: JSON.stringify(candidate),
        details: `Created candidate ${candidate.firstName} ${candidate.lastName}`,
      },
    });

    return candidate;
  }

  async findAll(query?: QueryCandidatesDto) {
    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }
    if (query?.department) {
      where.department = { equals: query.department, mode: 'insensitive' };
    }
    if (query?.location) {
      where.location = { equals: query.location, mode: 'insensitive' };
    }
    if (query?.employmentType) {
      where.employmentType = { equals: query.employmentType, mode: 'insensitive' };
    }
    if (query?.search) {
      const s = query.search;
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { designation: { contains: s, mode: 'insensitive' } },
        { department: { contains: s, mode: 'insensitive' } },
      ];
    }

    return this.prisma.candidate.findMany({
      where,
      include: {
        createdBy: true,
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        createdBy: true,
        employee: {
          include: {
            onboardingPlan: true,
            documents: true,
            verifications: true,
            tasks: true,
            assets: true,
            checklist: true,
          },
        },
      },
    });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID '${id}' not found`);
    }
    return candidate;
  }

  async update(id: string, dto: Partial<CreateCandidateDto>, currentUserId?: string) {
    const candidate = await this.findOne(id);

    const updated = await this.prisma.candidate.update({
      where: { id },
      data: {
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.lastName ? { lastName: dto.lastName } : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.designation ? { designation: dto.designation } : {}),
        ...(dto.department ? { department: dto.department } : {}),
        ...(dto.location ? { location: dto.location } : {}),
        ...(dto.employmentType ? { employmentType: dto.employmentType } : {}),
        ...(dto.expectedJoiningDate ? { expectedJoiningDate: new Date(dto.expectedJoiningDate) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'CANDIDATE_UPDATED',
        entity: 'Candidate',
        entityType: 'Candidate',
        entityId: id,
        oldValue: JSON.stringify(candidate),
        newValue: JSON.stringify(updated),
        details: `Updated candidate details for ${updated.firstName} ${updated.lastName}`,
      },
    });

    return updated;
  }

  /**
   * Complete candidate to employee conversion in an atomic Prisma transaction
   */
  async convertCandidateToEmployee(candidateId: string, currentUserId?: string) {
    const candidate = await this.findOne(candidateId);

    if (candidate.status === CandidateStatus.CONVERTED) {
      throw new BadRequestException(`Candidate '${candidate.firstName} ${candidate.lastName}' has already been converted to an employee.`);
    }

    // 1. Find matching active onboarding plan using matching engine BEFORE transaction
    const matchingPlan = await this.matchingService.findMatchingPlan({
      department: candidate.department,
      designation: candidate.designation,
      location: candidate.location,
      employmentType: candidate.employmentType,
    });

    // 2. Execute atomic Prisma transaction
    return this.prisma.$transaction(async (tx) => {
      // Generate safe unique employee code
      const employeeCount = await tx.employee.count();
      const employeeCode = `EMP-${new Date().getFullYear()}-${String(employeeCount + 1).padStart(4, '0')}`;

      // Create Employee Record
      const employee = await tx.employee.create({
        data: {
          candidateId: candidate.id,
          employeeId: employeeCode,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          department: candidate.department,
          designation: candidate.designation,
          location: candidate.location,
          employmentType: candidate.employmentType,
          joiningDate: candidate.expectedJoiningDate,
          onboardingStatus: 'READY',
          onboardingPlanId: matchingPlan.id,
        },
      });

      // Generate Document Requirements
      const documentPromises = matchingPlan.documentRequirements.map((req) =>
        tx.employeeDocument.create({
          data: {
            employeeId: employee.id,
            documentType: req.documentType,
            documentName: `${req.documentType} Document`,
            isRequired: req.isRequired !== undefined ? req.isRequired : true,
            submissionStatus: 'NOT_SUBMITTED',
            verificationStatus: 'PENDING',
          },
        }),
      );

      // Generate Background Verification Requirements for mandatory/verification required documents
      const verificationReqs = matchingPlan.documentRequirements.filter((req) => req.verificationRequired);
      const verificationPromises = verificationReqs.map((req) =>
        tx.backgroundVerification.create({
          data: {
            employeeId: employee.id,
            verificationType: `${req.documentType} Verification`,
            isMandatory: req.isRequired !== undefined ? req.isRequired : true,
            status: 'REQUESTED',
          },
        }),
      );

      // Generate Department Tasks (calculate due dates based on offset)
      const taskPromises = matchingPlan.taskRequirements.map((req) => {
        const dueDate = new Date(candidate.expectedJoiningDate);
        dueDate.setDate(dueDate.getDate() + req.dueDaysFromJoining);
        return tx.departmentTask.create({
          data: {
            employeeId: employee.id,
            title: req.title,
            description: req.description,
            assignedDepartment: req.assignedDepartment,
            isMandatory: req.isMandatory,
            status: 'TODO',
            dueDate,
          },
        });
      });

      // Generate Asset Requirements
      const assetPromises = matchingPlan.assetRequirements.map((req) =>
        tx.employeeAsset.create({
          data: {
            employeeId: employee.id,
            assetName: req.assetType,
            assetType: req.assetType,
            isMandatory: req.isMandatory,
            status: 'REQUESTED',
          },
        }),
      );

      // Generate Joining Checklist Items
      const checklistPromises = matchingPlan.checklistRequirements.map((req) =>
        tx.joiningChecklistItem.create({
          data: {
            employeeId: employee.id,
            title: req.title,
            item: req.title,
            category: req.category || 'GENERAL',
            isMandatory: req.isMandatory,
            isCompleted: false,
          },
        }),
      );

      // Execute all requirement creations
      const [documents, verifications, tasks, assets, checklist] = await Promise.all([
        Promise.all(documentPromises),
        Promise.all(verificationPromises),
        Promise.all(taskPromises),
        Promise.all(assetPromises),
        Promise.all(checklistPromises),
      ]);

      // Update Candidate Status to CONVERTED
      await tx.candidate.update({
        where: { id: candidate.id },
        data: { status: CandidateStatus.CONVERTED },
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentUserId,
          employeeId: employee.id,
          action: 'EMPLOYEE_CREATED_FROM_CANDIDATE',
          entity: 'Employee',
          entityType: 'Candidate',
          entityId: candidate.id,
          oldValue: CandidateStatus.SELECTED,
          newValue: CandidateStatus.CONVERTED,
          details: `Candidate ${candidate.firstName} ${candidate.lastName} converted to Employee ${employeeCode} with plan '${matchingPlan.title}'.`,
        },
      });

      // Create In-App & Email Notification
      await this.notificationsService.createNotification({
        recipientUserId: currentUserId,
        employeeId: employee.id,
        candidateId: candidate.id,
        type: 'ONBOARDING_CREATED',
        channel: 'IN_APP',
        title: `Onboarding Initialized: ${employee.firstName} ${employee.lastName}`,
        message: `Candidate ${employee.firstName} ${employee.lastName} was converted to Employee (${employeeCode}). Plan '${matchingPlan.title}' assigned.`,
        priority: 'MEDIUM',
        relatedEntityType: 'Employee',
        relatedEntityId: employee.id,
      }).catch(() => null);

      return {
        success: true,
        message: 'Candidate converted to employee successfully',
        employeeCode,
        employee,
        onboardingPlan: matchingPlan,
        requirementsGenerated: {
          documentsCount: documents.length,
          verificationsCount: verifications.length,
          tasksCount: tasks.length,
          assetsCount: assets.length,
          checklistCount: checklist.length,
        },
      };
    });
  }
}
