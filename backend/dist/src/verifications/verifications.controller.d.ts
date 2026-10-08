import { VerificationsService, CreateVerificationDto, CompleteVerificationDto } from './verifications.service';
import { User } from '@prisma/client';
export declare class VerificationsController {
    private readonly verificationsService;
    constructor(verificationsService: VerificationsService);
    findByEmployee(employeeId: string): Promise<({
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
    create(dto: CreateVerificationDto, user: User): Promise<{
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
    startVerification(id: string, user: User): Promise<{
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
    completeVerification(id: string, dto: CompleteVerificationDto, user: User): Promise<{
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
