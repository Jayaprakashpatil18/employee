import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export interface CreatePlanDto {
    title: string;
    description?: string;
    department: string;
    designation?: string;
    location?: string;
    employmentType?: string;
    isActive?: boolean;
    documentRequirements?: {
        documentType: string;
        isRequired?: boolean;
        verificationRequired?: boolean;
        description?: string;
    }[];
    taskRequirements?: {
        title: string;
        description?: string;
        assignedDepartment: string;
        defaultAssigneeRole?: UserRole;
        isMandatory?: boolean;
        dueDaysFromJoining?: number;
    }[];
    assetRequirements?: {
        assetType: string;
        isMandatory?: boolean;
        description?: string;
    }[];
    checklistRequirements?: {
        title: string;
        category?: string;
        isMandatory?: boolean;
    }[];
}
export declare class OnboardingPlansService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePlanDto): Promise<{
        documentRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            documentType: string;
            isRequired: boolean;
            verificationRequired: boolean;
            planId: string;
        }[];
        taskRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            planId: string;
            assignedDepartment: string;
            defaultAssigneeRole: import(".prisma/client").$Enums.UserRole | null;
            isMandatory: boolean;
            dueDaysFromJoining: number;
        }[];
        assetRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            planId: string;
            isMandatory: boolean;
            assetType: string;
        }[];
        checklistRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            planId: string;
            isMandatory: boolean;
            category: string;
        }[];
    } & {
        id: string;
        department: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        designation: string | null;
        location: string | null;
        employmentType: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<({
        documentRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            documentType: string;
            isRequired: boolean;
            verificationRequired: boolean;
            planId: string;
        }[];
        taskRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            planId: string;
            assignedDepartment: string;
            defaultAssigneeRole: import(".prisma/client").$Enums.UserRole | null;
            isMandatory: boolean;
            dueDaysFromJoining: number;
        }[];
        assetRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            planId: string;
            isMandatory: boolean;
            assetType: string;
        }[];
        checklistRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            planId: string;
            isMandatory: boolean;
            category: string;
        }[];
        _count: {
            employees: number;
        };
    } & {
        id: string;
        department: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        designation: string | null;
        location: string | null;
        employmentType: string | null;
        isActive: boolean;
    })[]>;
    findOne(id: string): Promise<{
        documentRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            documentType: string;
            isRequired: boolean;
            verificationRequired: boolean;
            planId: string;
        }[];
        taskRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            planId: string;
            assignedDepartment: string;
            defaultAssigneeRole: import(".prisma/client").$Enums.UserRole | null;
            isMandatory: boolean;
            dueDaysFromJoining: number;
        }[];
        assetRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            planId: string;
            isMandatory: boolean;
            assetType: string;
        }[];
        checklistRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            planId: string;
            isMandatory: boolean;
            category: string;
        }[];
        employees: {
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
        }[];
    } & {
        id: string;
        department: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        designation: string | null;
        location: string | null;
        employmentType: string | null;
        isActive: boolean;
    }>;
    update(id: string, dto: Partial<CreatePlanDto>): Promise<{
        documentRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            documentType: string;
            isRequired: boolean;
            verificationRequired: boolean;
            planId: string;
        }[];
        taskRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            planId: string;
            assignedDepartment: string;
            defaultAssigneeRole: import(".prisma/client").$Enums.UserRole | null;
            isMandatory: boolean;
            dueDaysFromJoining: number;
        }[];
        assetRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            planId: string;
            isMandatory: boolean;
            assetType: string;
        }[];
        checklistRequirements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            planId: string;
            isMandatory: boolean;
            category: string;
        }[];
    } & {
        id: string;
        department: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        designation: string | null;
        location: string | null;
        employmentType: string | null;
        isActive: boolean;
    }>;
    setPlanStatus(id: string, isActive: boolean): Promise<{
        id: string;
        department: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        designation: string | null;
        location: string | null;
        employmentType: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        department: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        designation: string | null;
        location: string | null;
        employmentType: string | null;
        isActive: boolean;
    }>;
    private validateUniqueActivePlan;
}
