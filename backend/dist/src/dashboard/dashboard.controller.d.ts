import { DashboardService, DashboardFilterDto } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(query: DashboardFilterDto): Promise<{
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
    getAnalytics(query: DashboardFilterDto): Promise<{
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
    getAttentionRequired(query: DashboardFilterDto): Promise<any[]>;
    getPendingRequirements(query: DashboardFilterDto): Promise<{
        pendingDocuments: any[];
        pendingVerifications: any[];
        pendingTasks: any[];
        pendingAssets: any[];
    }>;
    getUpcomingJoiners(query: DashboardFilterDto): Promise<any[]>;
}
