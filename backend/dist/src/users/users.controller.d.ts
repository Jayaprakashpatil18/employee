import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
