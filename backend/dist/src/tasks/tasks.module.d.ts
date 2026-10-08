import { PrismaService } from '../prisma/prisma.service';
export declare class TasksService {
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
        assignedUser: {
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
        description: string | null;
        assignedDepartment: string;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.TaskStatus;
        employeeId: string;
        completedAt: Date | null;
        priority: string;
        dueDate: Date | null;
        completionRemarks: string | null;
        assignedUserId: string | null;
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
        assignedUser: {
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
        description: string | null;
        assignedDepartment: string;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.TaskStatus;
        employeeId: string;
        completedAt: Date | null;
        priority: string;
        dueDate: Date | null;
        completionRemarks: string | null;
        assignedUserId: string | null;
    }>;
}
export declare class TasksController {
    private readonly service;
    constructor(service: TasksService);
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
        assignedUser: {
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
        description: string | null;
        assignedDepartment: string;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.TaskStatus;
        employeeId: string;
        completedAt: Date | null;
        priority: string;
        dueDate: Date | null;
        completionRemarks: string | null;
        assignedUserId: string | null;
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
        assignedUser: {
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
        description: string | null;
        assignedDepartment: string;
        isMandatory: boolean;
        status: import(".prisma/client").$Enums.TaskStatus;
        employeeId: string;
        completedAt: Date | null;
        priority: string;
        dueDate: Date | null;
        completionRemarks: string | null;
        assignedUserId: string | null;
    }>;
}
export declare class TasksModule {
}
