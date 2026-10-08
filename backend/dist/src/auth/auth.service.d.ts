import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export interface SyncUserDto {
    clerkUserId: string;
    email: string;
    name: string;
    role?: UserRole;
    department?: string;
}
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    syncUser(dto: SyncUserDto): Promise<{
        id: string;
        clerkUserId: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCurrentUser(clerkUserId: string): Promise<{
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
        clerkUserId: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
