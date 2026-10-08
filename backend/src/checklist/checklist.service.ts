import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { OnboardingReadinessService } from '../readiness/readiness.service';

export interface UpdateChecklistItemDto {
  title?: string;
  item?: string;
  category?: string;
  isMandatory?: boolean;
}

@Injectable()
export class ChecklistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readinessService: OnboardingReadinessService,
  ) {}

  async findByEmployee(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID '${employeeId}' not found`);
    }

    const items = await this.prisma.joiningChecklistItem.findMany({
      where: { employeeId },
      include: { completedBy: true },
      orderBy: { createdAt: 'asc' },
    });

    const total = items.length;
    const completedCount = items.filter((i) => i.isCompleted).length;
    const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      employeeId,
      items,
      total,
      completedCount,
      progressPercentage,
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.joiningChecklistItem.findUnique({
      where: { id },
      include: { completedBy: true, employee: true },
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID '${id}' not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateChecklistItemDto, currentUser: User) {
    this.assertAuthorizedModifier(currentUser);
    const item = await this.findOne(id);

    const updated = await this.prisma.joiningChecklistItem.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title, item: dto.title } : {}),
        ...(dto.item ? { item: dto.item, title: dto.title || dto.item } : {}),
        ...(dto.category ? { category: dto.category } : {}),
        ...(dto.isMandatory !== undefined ? { isMandatory: dto.isMandatory } : {}),
      },
      include: { completedBy: true },
    });

    // Recalculate readiness
    await this.readinessService.evaluateReadiness(item.employeeId, currentUser);

    return updated;
  }

  async completeItem(id: string, currentUser: User) {
    this.assertAuthorizedModifier(currentUser);
    const item = await this.findOne(id);

    const updated = await this.prisma.joiningChecklistItem.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        completedById: currentUser.id,
      },
      include: { completedBy: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        employeeId: item.employeeId,
        action: 'CHECKLIST_COMPLETED',
        entity: 'JoiningChecklistItem',
        entityType: 'JoiningChecklistItem',
        entityId: id,
        oldValue: 'Incomplete',
        newValue: 'Completed',
        details: `Completed checklist item '${item.title || item.item}' by ${currentUser.name}`,
      },
    });

    // Trigger readiness recalculation
    await this.readinessService.evaluateReadiness(item.employeeId, currentUser);

    return updated;
  }

  async reopenItem(id: string, currentUser: User) {
    this.assertAuthorizedModifier(currentUser);
    const item = await this.findOne(id);

    const updated = await this.prisma.joiningChecklistItem.update({
      where: { id },
      data: {
        isCompleted: false,
        completedAt: null,
        completedById: null,
      },
      include: { completedBy: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        employeeId: item.employeeId,
        action: 'CHECKLIST_REOPENED',
        entity: 'JoiningChecklistItem',
        entityType: 'JoiningChecklistItem',
        entityId: id,
        oldValue: 'Completed',
        newValue: 'Incomplete',
        details: `Reopened checklist item '${item.title || item.item}' by ${currentUser.name}`,
      },
    });

    // Trigger readiness recalculation
    await this.readinessService.evaluateReadiness(item.employeeId, currentUser);

    return updated;
  }

  private assertAuthorizedModifier(user: User) {
    if (!user || user.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Employees are not authorized to modify joining checklist items.');
    }
  }
}
