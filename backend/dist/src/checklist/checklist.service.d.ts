import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { OnboardingReadinessService } from '../readiness/readiness.service';
export interface UpdateChecklistItemDto {
    title?: string;
    item?: string;
    category?: string;
    isMandatory?: boolean;
}
export declare class ChecklistService {
    private readonly prisma;
    private readonly readinessService;
    constructor(prisma: PrismaService, readinessService: OnboardingReadinessService);
    findByEmployee(employeeId: string): Promise<{
        employeeId: string;
        items: ({
            completedBy: {
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
            updatedAt: Date;
            title: string;
            isMandatory: boolean;
            category: string;
            employeeId: string;
            completedAt: Date | null;
            item: string;
            isCompleted: boolean;
            completedById: string | null;
        })[];
        total: number;
        completedCount: number;
        progressPercentage: number;
    }>;
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
        completedBy: {
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
        updatedAt: Date;
        title: string;
        isMandatory: boolean;
        category: string;
        employeeId: string;
        completedAt: Date | null;
        item: string;
        isCompleted: boolean;
        completedById: string | null;
    }>;
    update(id: string, dto: UpdateChecklistItemDto, currentUser: User): Promise<{
        completedBy: {
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
        updatedAt: Date;
        title: string;
        isMandatory: boolean;
        category: string;
        employeeId: string;
        completedAt: Date | null;
        item: string;
        isCompleted: boolean;
        completedById: string | null;
    }>;
    completeItem(id: string, currentUser: User): Promise<{
        completedBy: {
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
        updatedAt: Date;
        title: string;
        isMandatory: boolean;
        category: string;
        employeeId: string;
        completedAt: Date | null;
        item: string;
        isCompleted: boolean;
        completedById: string | null;
    }>;
    reopenItem(id: string, currentUser: User): Promise<{
        completedBy: {
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
        updatedAt: Date;
        title: string;
        isMandatory: boolean;
        category: string;
        employeeId: string;
        completedAt: Date | null;
        item: string;
        isCompleted: boolean;
        completedById: string | null;
    }>;
    private assertAuthorizedModifier;
}
