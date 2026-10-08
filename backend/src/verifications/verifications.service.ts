import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus, VerificationResult, User } from '@prisma/client';

export interface CreateVerificationDto {
  employeeId: string;
  verificationType: string;
  agencyName?: string;
  notes?: string;
}

export interface CompleteVerificationDto {
  result: VerificationResult;
  remarks?: string;
  notes?: string;
}

@Injectable()
export class VerificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVerificationDto, currentUser?: User) {
    const verification = await this.prisma.backgroundVerification.create({
      data: {
        employeeId: dto.employeeId,
        verificationType: dto.verificationType,
        agencyName: dto.agencyName || 'Internal Verification Agency',
        status: VerificationStatus.REQUESTED,
        notes: dto.notes,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: dto.employeeId,
        action: 'BACKGROUND_VERIFICATION_CREATED',
        entity: 'BackgroundVerification',
        entityType: 'BackgroundVerification',
        entityId: verification.id,
        details: `Requested background verification '${dto.verificationType}'`,
      },
    });

    return verification;
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.backgroundVerification.findMany({
      where: { employeeId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const v = await this.prisma.backgroundVerification.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!v) {
      throw new NotFoundException(`Background verification record with ID '${id}' not found`);
    }
    return v;
  }

  async startVerification(id: string, currentUser?: User) {
    const v = await this.findOne(id);

    if (v.status === VerificationStatus.COMPLETED) {
      throw new BadRequestException('Cannot start a background verification that is already COMPLETED.');
    }

    const updated = await this.prisma.backgroundVerification.update({
      where: { id },
      data: {
        status: VerificationStatus.IN_PROGRESS,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: v.employeeId,
        action: 'BACKGROUND_VERIFICATION_STARTED',
        entity: 'BackgroundVerification',
        entityType: 'BackgroundVerification',
        entityId: v.id,
        oldValue: v.status,
        newValue: VerificationStatus.IN_PROGRESS,
        details: `Started background check '${v.verificationType}'`,
      },
    });

    return updated;
  }

  async completeVerification(id: string, dto: CompleteVerificationDto, currentUser?: User) {
    const v = await this.findOne(id);

    if (!dto.result) {
      throw new BadRequestException('A completion result (CLEAR, FAILED, or NEEDS_REVIEW) is required to complete background verification.');
    }

    if (!Object.values(VerificationResult).includes(dto.result)) {
      throw new BadRequestException(`Invalid verification result '${dto.result}'. Allowed values: CLEAR, FAILED, NEEDS_REVIEW.`);
    }

    const updated = await this.prisma.backgroundVerification.update({
      where: { id },
      data: {
        status: VerificationStatus.COMPLETED,
        result: dto.result,
        remarks: dto.remarks || null,
        notes: dto.notes || v.notes,
        completedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: v.employeeId,
        action: 'BACKGROUND_VERIFICATION_COMPLETED',
        entity: 'BackgroundVerification',
        entityType: 'BackgroundVerification',
        entityId: v.id,
        oldValue: v.status,
        newValue: `COMPLETED (${dto.result})`,
        details: `Completed background check '${v.verificationType}' with result ${dto.result}. Remarks: ${dto.remarks || 'None'}`,
      },
    });

    return updated;
  }
}
