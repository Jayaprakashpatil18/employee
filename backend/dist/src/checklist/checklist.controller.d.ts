import { ChecklistService, UpdateChecklistItemDto } from './checklist.service';
import { User } from '@prisma/client';
export declare class ChecklistController {
    private readonly checklistService;
    constructor(checklistService: ChecklistService);
    getChecklistItem(id: string): Promise<{
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
    updateChecklistItem(id: string, dto: UpdateChecklistItemDto, currentUser: User): Promise<{
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
    completeChecklistItem(id: string, currentUser: User): Promise<{
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
    reopenChecklistItem(id: string, currentUser: User): Promise<{
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
}
