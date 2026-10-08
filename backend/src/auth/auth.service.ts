import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface SyncUserDto {
  clerkUserId: string;
  email: string;
  name: string;
  role?: UserRole;
  department?: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(dto: SyncUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkUserId: dto.clerkUserId },
    });

    if (existingUser) {
      return this.prisma.user.update({
        where: { clerkUserId: dto.clerkUserId },
        data: {
          email: dto.email,
          name: dto.name,
          ...(dto.department ? { department: dto.department } : {}),
        },
      });
    }

    return this.prisma.user.create({
      data: {
        clerkUserId: dto.clerkUserId,
        email: dto.email,
        name: dto.name,
        role: dto.role || UserRole.EMPLOYEE,
        department: dto.department || 'General',
      },
    });
  }

  async getCurrentUser(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        employee: true,
      },
    });
  }
}
