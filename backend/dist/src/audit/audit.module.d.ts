import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
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
        user: {
            id: string;
            clerkUserId: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        employeeId: string | null;
        userId: string | null;
        actorRole: string | null;
        action: string;
        entity: string;
        entityType: string | null;
        entityId: string | null;
        oldValue: string | null;
        newValue: string | null;
        details: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
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
        user: {
            id: string;
            clerkUserId: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        employeeId: string | null;
        userId: string | null;
        actorRole: string | null;
        action: string;
        entity: string;
        entityType: string | null;
        entityId: string | null;
        oldValue: string | null;
        newValue: string | null;
        details: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
}
export declare class AuditController {
    private readonly service;
    constructor(service: AuditService);
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
        user: {
            id: string;
            clerkUserId: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        employeeId: string | null;
        userId: string | null;
        actorRole: string | null;
        action: string;
        entity: string;
        entityType: string | null;
        entityId: string | null;
        oldValue: string | null;
        newValue: string | null;
        details: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
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
        user: {
            id: string;
            clerkUserId: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        employeeId: string | null;
        userId: string | null;
        actorRole: string | null;
        action: string;
        entity: string;
        entityType: string | null;
        entityId: string | null;
        oldValue: string | null;
        newValue: string | null;
        details: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
}
export declare class AuditModule {
}
