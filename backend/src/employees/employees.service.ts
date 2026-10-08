import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        onboardingPlan: true,
        documents: true,
        verifications: true,
        tasks: true,
        assets: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        candidate: true,
        user: true,
        onboardingPlan: true,
        documents: true,
        verifications: true,
        tasks: true,
        assets: true,
        checklist: true,
      },
    });
  }
}
