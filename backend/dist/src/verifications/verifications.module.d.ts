import { PrismaService } from '../prisma/prisma.service';
export declare class VerificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        employee: {
            id: string;
            email: string;
            department: string;
            createdAt: Date;
            updatedAt: Date;
            designation: string;
            location: string;
            employmentType: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            employeeId: string;
            joiningDate: Date;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            candidateId: string | null;
            userId: string | null;
            onboardingPlanId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        result: import(".prisma/client").$Enums.VerificationResult | null;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.VerificationStatus;
        employeeId: string;
        remarks: string | null;
        verificationType: string;
        agencyName: string | null;
        notes: string | null;
        completedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        employee: {
            id: string;
            email: string;
            department: string;
            createdAt: Date;
            updatedAt: Date;
            designation: string;
            location: string;
            employmentType: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            employeeId: string;
            joiningDate: Date;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            candidateId: string | null;
            userId: string | null;
            onboardingPlanId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        result: import(".prisma/client").$Enums.VerificationResult | null;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.VerificationStatus;
        employeeId: string;
        remarks: string | null;
        verificationType: string;
        agencyName: string | null;
        notes: string | null;
        completedAt: Date | null;
    }>;
}
export declare class VerificationsController {
    private readonly service;
    constructor(service: VerificationsService);
    findAll(): Promise<({
        employee: {
            id: string;
            email: string;
            department: string;
            createdAt: Date;
            updatedAt: Date;
            designation: string;
            location: string;
            employmentType: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            employeeId: string;
            joiningDate: Date;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            candidateId: string | null;
            userId: string | null;
            onboardingPlanId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        result: import(".prisma/client").$Enums.VerificationResult | null;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.VerificationStatus;
        employeeId: string;
        remarks: string | null;
        verificationType: string;
        agencyName: string | null;
        notes: string | null;
        completedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        employee: {
            id: string;
            email: string;
            department: string;
            createdAt: Date;
            updatedAt: Date;
            designation: string;
            location: string;
            employmentType: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            employeeId: string;
            joiningDate: Date;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            candidateId: string | null;
            userId: string | null;
            onboardingPlanId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        result: import(".prisma/client").$Enums.VerificationResult | null;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.VerificationStatus;
        employeeId: string;
        remarks: string | null;
        verificationType: string;
        agencyName: string | null;
        notes: string | null;
        completedAt: Date | null;
    }>;
}
export declare class VerificationsModule {
}
