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
export declare class StatusResolver {
    static resolveStatus(requirements: EvaluatedRequirement[]): ResolvedReadinessStatus;
}
