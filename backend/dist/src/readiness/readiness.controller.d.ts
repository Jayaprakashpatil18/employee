import { OnboardingReadinessService } from './readiness.service';
import { User, OnboardingStatus } from '@prisma/client';
export declare class ReadinessController {
    private readonly readinessService;
    constructor(readinessService: OnboardingReadinessService);
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
    getUpcomingJoiners(search?: string, status?: OnboardingStatus, department?: string): Promise<any[]>;
    getEmployeeReadiness(employeeId: string, currentUser: User): Promise<import("./readiness.service").ReadinessEvaluationResponse>;
}
