import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingStatus, User } from '@prisma/client';
import { DocumentReadinessEvaluator } from './evaluators/document-readiness.evaluator';
import { VerificationReadinessEvaluator } from './evaluators/verification-readiness.evaluator';
import { TaskReadinessEvaluator } from './evaluators/task-readiness.evaluator';
import { AssetReadinessEvaluator } from './evaluators/asset-readiness.evaluator';
import { ChecklistReadinessEvaluator } from './evaluators/checklist-readiness.evaluator';
import { EvaluatedRequirement, StatusResolver } from './status-resolver';

export interface CategorySummary {
  total: number;
  completed: number;
  pending: number;
}

export interface ActionableIssue {
  category: string;
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'BLOCKED' | 'OVERDUE' | 'REJECTED' | 'PENDING' | 'NEEDS_REVIEW';
  message: string;
}

export interface ReadinessEvaluationResponse {
  employeeId: string;
  status: OnboardingStatus;
  readinessPercentage: number;
  summary: {
    totalRequirements: number;
    completedRequirements: number;
    pendingRequirements: number;
    overdueRequirements: number;
    blockedRequirements: number;
  };
  categories: {
    documents: CategorySummary;
    verifications: CategorySummary;
    tasks: CategorySummary;
    assets: CategorySummary;
    checklist: CategorySummary;
  };
  issues: ActionableIssue[];
}

@Injectable()
export class OnboardingReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateReadiness(employeeId: string, currentUser?: User): Promise<ReadinessEvaluationResponse> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        documents: true,
        verifications: true,
        tasks: true,
        assets: true,
        checklist: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID '${employeeId}' not found`);
    }

    const docReqs = DocumentReadinessEvaluator.evaluate(employee.documents || []);
    const verifReqs = VerificationReadinessEvaluator.evaluate(employee.verifications || []);
    const taskReqs = TaskReadinessEvaluator.evaluate(employee.tasks || []);
    const assetReqs = AssetReadinessEvaluator.evaluate(employee.assets || []);
    const checklistReqs = ChecklistReadinessEvaluator.evaluate(employee.checklist || []);

    const allRequirements: EvaluatedRequirement[] = [
      ...docReqs,
      ...verifReqs,
      ...taskReqs,
      ...assetReqs,
      ...checklistReqs,
    ];

    const resolved = StatusResolver.resolveStatus(allRequirements);

    // Build category summaries
    const buildCategorySummary = (reqs: EvaluatedRequirement[]): CategorySummary => ({
      total: reqs.length,
      completed: reqs.filter((r) => r.isComplete).length,
      pending: reqs.filter((r) => !r.isComplete).length,
    });

    const categories = {
      documents: buildCategorySummary(docReqs),
      verifications: buildCategorySummary(verifReqs),
      tasks: buildCategorySummary(taskReqs),
      assets: buildCategorySummary(assetReqs),
      checklist: buildCategorySummary(checklistReqs),
    };

    // Extract actionable issues
    const issues: ActionableIssue[] = [];
    allRequirements.forEach((r) => {
      if (r.isBlocked) {
        issues.push({
          category: r.category,
          name: r.name,
          severity: 'CRITICAL',
          type: 'BLOCKED',
          message: r.reason || `Critical blocker in ${r.category.toLowerCase()}: ${r.name}`,
        });
      } else if (r.isOverdue) {
        issues.push({
          category: r.category,
          name: r.name,
          severity: 'HIGH',
          type: 'OVERDUE',
          message: r.reason || `Overdue ${r.category.toLowerCase()}: ${r.name}`,
        });
      } else if (r.status === 'REJECTED' || r.status === 'RESUBMISSION_REQUIRED') {
        issues.push({
          category: r.category,
          name: r.name,
          severity: 'CRITICAL',
          type: 'REJECTED',
          message: r.reason || `Document '${r.name}' requires resubmission`,
        });
      } else if (r.status === 'NEEDS_REVIEW') {
        issues.push({
          category: r.category,
          name: r.name,
          severity: 'HIGH',
          type: 'NEEDS_REVIEW',
          message: r.reason || `Verification '${r.name}' requires HR review`,
        });
      } else if (!r.isComplete && r.mandatory) {
        issues.push({
          category: r.category,
          name: r.name,
          severity: 'MEDIUM',
          type: 'PENDING',
          message: r.reason || `Pending mandatory ${r.category.toLowerCase()}: ${r.name}`,
        });
      }
    });

    // Auto-sync employee.onboardingStatus if changed
    if (employee.onboardingStatus !== resolved.status) {
      await this.prisma.employee.update({
        where: { id: employeeId },
        data: { onboardingStatus: resolved.status },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          employeeId: employee.id,
          action: 'READINESS_STATUS_CHANGED',
          entity: 'Employee',
          entityType: 'Employee',
          entityId: employee.id,
          oldValue: employee.onboardingStatus,
          newValue: resolved.status,
          details: `Onboarding status automatically updated from ${employee.onboardingStatus} to ${resolved.status}. Reason: ${resolved.reason}`,
        },
      });
    }

    const totalRequirements = allRequirements.length;
    const completedRequirements = allRequirements.filter((r) => r.isComplete).length;
    const pendingRequirements = totalRequirements - completedRequirements;

    return {
      employeeId: employee.id,
      status: resolved.status,
      readinessPercentage: resolved.readinessPercentage,
      summary: {
        totalRequirements,
        completedRequirements,
        pendingRequirements,
        overdueRequirements: resolved.overdueCount,
        blockedRequirements: resolved.blockedCount,
      },
      categories,
      issues,
    };
  }

  async getComplianceSummary() {
    const employees = await this.prisma.employee.findMany({
      include: {
        documents: true,
        verifications: true,
        tasks: true,
        assets: true,
        checklist: true,
      },
    });

    let readyCount = 0;
    let partiallyReadyCount = 0;
    let delayedCount = 0;
    let blockedCount = 0;

    let pendingDocuments = 0;
    let pendingVerifications = 0;
    let pendingTasks = 0;
    let pendingAssets = 0;

    for (const emp of employees) {
      const docReqs = DocumentReadinessEvaluator.evaluate(emp.documents || []);
      const verifReqs = VerificationReadinessEvaluator.evaluate(emp.verifications || []);
      const taskReqs = TaskReadinessEvaluator.evaluate(emp.tasks || []);
      const assetReqs = AssetReadinessEvaluator.evaluate(emp.assets || []);
      const checklistReqs = ChecklistReadinessEvaluator.evaluate(emp.checklist || []);

      const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
      const res = StatusResolver.resolveStatus(all);

      if (res.status === OnboardingStatus.READY) readyCount++;
      else if (res.status === OnboardingStatus.PARTIALLY_READY) partiallyReadyCount++;
      else if (res.status === OnboardingStatus.DELAYED) delayedCount++;
      else if (res.status === OnboardingStatus.BLOCKED) blockedCount++;

      pendingDocuments += docReqs.filter((r) => !r.isComplete).length;
      pendingVerifications += verifReqs.filter((r) => !r.isComplete).length;
      pendingTasks += taskReqs.filter((r) => !r.isComplete).length;
      pendingAssets += assetReqs.filter((r) => !r.isComplete).length;
    }

    return {
      totalUpcomingJoiners: employees.length,
      readyCount,
      partiallyReadyCount,
      delayedCount,
      blockedCount,
      pendingDocuments,
      pendingVerifications,
      pendingTasks,
      pendingAssets,
    };
  }

  async getUpcomingJoiners(query?: { search?: string; status?: OnboardingStatus; department?: string }) {
    const where: any = {};

    if (query?.status) {
      where.onboardingStatus = query.status;
    }
    if (query?.department) {
      where.department = { equals: query.department, mode: 'insensitive' };
    }
    if (query?.search) {
      const s = query.search;
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { employeeId: { contains: s, mode: 'insensitive' } },
        { department: { contains: s, mode: 'insensitive' } },
        { designation: { contains: s, mode: 'insensitive' } },
      ];
    }

    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        documents: true,
        verifications: true,
        tasks: true,
        assets: true,
        checklist: true,
      },
      orderBy: { joiningDate: 'asc' },
    });

    const results = [];
    for (const emp of employees) {
      const docReqs = DocumentReadinessEvaluator.evaluate(emp.documents || []);
      const verifReqs = VerificationReadinessEvaluator.evaluate(emp.verifications || []);
      const taskReqs = TaskReadinessEvaluator.evaluate(emp.tasks || []);
      const assetReqs = AssetReadinessEvaluator.evaluate(emp.assets || []);
      const checklistReqs = ChecklistReadinessEvaluator.evaluate(emp.checklist || []);

      const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
      const res = StatusResolver.resolveStatus(all);

      const criticalIssues = all.filter((r) => r.isBlocked || r.isOverdue).length;

      results.push({
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        joiningDate: emp.joiningDate,
        status: res.status,
        readinessPercentage: res.readinessPercentage,
        criticalIssues,
      });
    }

    return results;
  }
}
