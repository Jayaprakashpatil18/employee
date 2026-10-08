import { PrismaService } from '../prisma/prisma.service';
import { OnboardingReadinessService } from '../readiness/readiness.service';
import { OnboardingStatus } from '@prisma/client';
export interface DashboardFilterDto {
    dateRange?: 'TODAY' | '7_DAYS' | '14_DAYS' | '30_DAYS' | 'ALL';
    department?: string;
    location?: string;
    employmentType?: string;
    designation?: string;
    status?: OnboardingStatus | 'ALL';
    search?: string;
}
export declare class DashboardService {
    private readonly prisma;
    private readonly readinessService;
    constructor(prisma: PrismaService, readinessService: OnboardingReadinessService);
    private buildWhereClause;
    getSummary(query?: DashboardFilterDto): Promise<{
        upcomingJoiners: number;
        ready: number;
        partiallyReady: number;
        delayed: number;
        blocked: number;
        pendingDocuments: number;
        pendingVerification: number;
        pendingTasks: number;
        pendingAssets: number;
    }>;
    getAnalytics(query?: DashboardFilterDto): Promise<{
        readinessDistribution: {
            name: string;
            count: number;
            color: string;
        }[];
        departmentOverview: {
            department: string;
            totalEmployees: number;
            readyCount: number;
            delayedCount: number;
            blockedCount: number;
        }[];
        locationOverview: {
            location: string;
            totalEmployees: number;
            readyCount: number;
            delayedCount: number;
            blockedCount: number;
        }[];
    }>;
    getAttentionRequired(query?: DashboardFilterDto): Promise<any[]>;
    getPendingRequirements(query?: DashboardFilterDto): Promise<{
        pendingDocuments: any[];
        pendingVerifications: any[];
        pendingTasks: any[];
        pendingAssets: any[];
    }>;
    getUpcomingJoiners(query?: DashboardFilterDto): Promise<any[]>;
}
