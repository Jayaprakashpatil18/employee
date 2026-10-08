import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        clerkUserId: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
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
