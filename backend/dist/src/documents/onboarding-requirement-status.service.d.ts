import { PrismaService } from '../prisma/prisma.service';
export interface RequirementMetricsSummary {
    totalDocuments: number;
    submittedDocuments: number;
    verifiedDocuments: number;
    rejectedDocuments: number;
    resubmissionRequiredDocuments: number;
    documentProgressPercentage: number;
    totalVerifications: number;
    completedVerifications: number;
    clearVerifications: number;
    failedVerifications: number;
    needsReviewVerifications: number;
    verificationProgressPercentage: number;
    hasBlockingFailure: boolean;
    areAllMandatoryRequirementsMet: boolean;
}
export declare class OnboardingRequirementStatusService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getEmployeeRequirementMetrics(employeeId: string): Promise<RequirementMetricsSummary>;
}
