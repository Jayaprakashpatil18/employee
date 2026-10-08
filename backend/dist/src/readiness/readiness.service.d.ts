import { PrismaService } from '../prisma/prisma.service';
import { OnboardingStatus, User } from '@prisma/client';
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
export declare class OnboardingReadinessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    evaluateReadiness(employeeId: string, currentUser?: User): Promise<ReadinessEvaluationResponse>;
    getComplianceSummary(): Promise<{
        totalUpcomingJoiners: number;
        readyCount: number;
        partiallyReadyCount: number;
        delayedCount: number;
        blockedCount: number;
        pendingDocuments: number;
        pendingVerifications: number;
        pendingTasks: number;
        pendingAssets: number;
    }>;
    getUpcomingJoiners(query?: {
        search?: string;
        status?: OnboardingStatus;
        department?: string;
    }): Promise<any[]>;
}
