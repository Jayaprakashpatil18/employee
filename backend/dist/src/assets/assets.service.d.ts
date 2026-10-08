import { PrismaService } from '../prisma/prisma.service';
import { AssetStatus, User } from '@prisma/client';
export interface CreateAssetDto {
    employeeId: string;
    assetName: string;
    assetType: string;
    serialNumber?: string;
    assetIdentifier?: string;
    remarks?: string;
}
export interface QueryAssetsDto {
    search?: string;
    assetType?: string;
    status?: AssetStatus;
    employeeId?: string;
}
export interface PrepareAssetDto {
    status: AssetStatus;
    serialNumber?: string;
    assetIdentifier?: string;
    remarks?: string;
}
export declare class AssetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAssetDto, currentUser?: User): Promise<{
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
    findAll(query?: QueryAssetsDto): Promise<({
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
    prepareAsset(id: string, dto: PrepareAssetDto, currentUser: User): Promise<{
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
    assignAsset(id: string, currentUser: User): Promise<{
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
    blockAsset(id: string, remarks: string, currentUser: User): Promise<{
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
    private assertAssetRoleAccess;
}
