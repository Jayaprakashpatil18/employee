import { PrismaService } from '../prisma/prisma.service';
import { VerificationResult, User } from '@prisma/client';
export interface CreateVerificationDto {
    employeeId: string;
    verificationType: string;
    agencyName?: string;
    notes?: string;
}
export interface CompleteVerificationDto {
    result: VerificationResult;
    remarks?: string;
    notes?: string;
}
export declare class VerificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVerificationDto, currentUser?: User): Promise<{
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
    startVerification(id: string, currentUser?: User): Promise<{
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
    completeVerification(id: string, dto: CompleteVerificationDto, currentUser?: User): Promise<{
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
