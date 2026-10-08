import { PrismaService } from '../prisma/prisma.service';
export declare class AssetsService {
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
        isMandatory: boolean;
        assetType: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        employeeId: string;
        remarks: string | null;
        assetName: string;
        serialNumber: string | null;
        assetIdentifier: string | null;
        preparedAt: Date | null;
        assignedAt: Date | null;
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
        isMandatory: boolean;
        assetType: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        employeeId: string;
        remarks: string | null;
        assetName: string;
        serialNumber: string | null;
        assetIdentifier: string | null;
        preparedAt: Date | null;
        assignedAt: Date | null;
    }>;
}
export declare class AssetsController {
    private readonly service;
    constructor(service: AssetsService);
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
        isMandatory: boolean;
        assetType: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        employeeId: string;
        remarks: string | null;
        assetName: string;
        serialNumber: string | null;
        assetIdentifier: string | null;
        preparedAt: Date | null;
        assignedAt: Date | null;
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
        isMandatory: boolean;
        assetType: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        employeeId: string;
        remarks: string | null;
        assetName: string;
        serialNumber: string | null;
        assetIdentifier: string | null;
        preparedAt: Date | null;
        assignedAt: Date | null;
    }>;
}
export declare class AssetsModule {
}
