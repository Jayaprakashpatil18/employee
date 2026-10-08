import { OnboardingStatus } from '@prisma/client';

export interface EvaluatedRequirement {
  category: 'DOCUMENT' | 'VERIFICATION' | 'TASK' | 'ASSET' | 'CHECKLIST';
  name: string;
  mandatory: boolean;
  status: string;
  isComplete: boolean;
  isOverdue: boolean;
  isBlocked: boolean;
  reason?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ResolvedReadinessStatus {
  status: OnboardingStatus;
  reason: string;
  blockedCount: number;
  overdueCount: number;
  totalMandatory: number;
  completedMandatory: number;
  readinessPercentage: number;
}

export class StatusResolver {
  /**
   * Status Precedence:
   * 1. BLOCKED: Critical blocker exists (critical verification failed, doc rejected, task/asset blocked)
   * 2. DELAYED: Mandatory requirement is overdue and uncompleted
   * 3. READY: All mandatory requirements are complete (100% mandatory readiness)
   * 4. PARTIALLY_READY: Incomplete mandatory requirements exist, but no blockers/overdue items
   */
  static resolveStatus(requirements: EvaluatedRequirement[]): ResolvedReadinessStatus {
    const mandatoryReqs = requirements.filter((r) => r.mandatory);
    const totalMandatory = mandatoryReqs.length;
    const completedMandatory = mandatoryReqs.filter((r) => r.isComplete).length;

    let readinessPercentage = 0;
    if (totalMandatory > 0) {
      readinessPercentage = Math.round((completedMandatory / totalMandatory) * 100);
    } else if (requirements.length > 0) {
      // If only optional requirements exist and all are complete, 100%
      const allOptionalComplete = requirements.every((r) => r.isComplete);
      readinessPercentage = allOptionalComplete ? 100 : 0;
    } else {
      readinessPercentage = 0;
    }

    const blockedReqs = requirements.filter((r) => r.isBlocked);
    const overdueReqs = requirements.filter((r) => r.mandatory && r.isOverdue && !r.isComplete);

    // Rule 1: Critical Blocker Take Precedence
    if (blockedReqs.length > 0) {
      const mainBlocker = blockedReqs[0];
      return {
        status: OnboardingStatus.BLOCKED,
        reason: mainBlocker.reason || `Blocked due to critical ${mainBlocker.category.toLowerCase()} issue: '${mainBlocker.name}'`,
        blockedCount: blockedReqs.length,
        overdueCount: overdueReqs.length,
        totalMandatory,
        completedMandatory,
        readinessPercentage,
      };
    }

    // Rule 2: Overdue Mandatory Requirement
    if (overdueReqs.length > 0) {
      const mainOverdue = overdueReqs[0];
      return {
        status: OnboardingStatus.DELAYED,
        reason: `Delayed due to overdue mandatory ${mainOverdue.category.toLowerCase()} requirement: '${mainOverdue.name}'`,
        blockedCount: 0,
        overdueCount: overdueReqs.length,
        totalMandatory,
        completedMandatory,
        readinessPercentage,
      };
    }

    // Rule 3: Zero Requirements Special Case
    if (requirements.length === 0) {
      return {
        status: OnboardingStatus.PARTIALLY_READY,
        reason: 'No onboarding requirements configured for employee',
        blockedCount: 0,
        overdueCount: 0,
        totalMandatory: 0,
        completedMandatory: 0,
        readinessPercentage: 0,
      };
    }

    // Rule 4: All Mandatory Requirements Complete -> READY
    if (totalMandatory === 0 || completedMandatory === totalMandatory) {
      return {
        status: OnboardingStatus.READY,
        reason: 'All mandatory onboarding requirements completed successfully',
        blockedCount: 0,
        overdueCount: 0,
        totalMandatory,
        completedMandatory,
        readinessPercentage: 100,
      };
    }

    // Rule 5: Standard Incomplete State -> PARTIALLY_READY
    return {
      status: OnboardingStatus.PARTIALLY_READY,
      reason: `${totalMandatory - completedMandatory} mandatory onboarding requirement(s) pending`,
      blockedCount: 0,
      overdueCount: 0,
      totalMandatory,
      completedMandatory,
      readinessPercentage,
    };
  }
}
