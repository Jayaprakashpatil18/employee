import { AuthService, SyncUserDto } from './auth.service';
import { User } from '@prisma/client';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getMe(user: User): Promise<{
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
