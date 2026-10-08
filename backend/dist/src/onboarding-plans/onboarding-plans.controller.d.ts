import { OnboardingPlansService, CreatePlanDto } from './onboarding-plans.service';
export declare class OnboardingPlansController {
    private readonly plansService;
    constructor(plansService: OnboardingPlansService);
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
    activate(id: string): Promise<{
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
    deactivate(id: string): Promise<{
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
}
