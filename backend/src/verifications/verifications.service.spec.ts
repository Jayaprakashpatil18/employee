import { Test, TestingModule } from '@nestjs/testing';
import { VerificationsService } from './verifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VerificationStatus, VerificationResult } from '@prisma/client';

describe('VerificationsService', () => {
  let service: VerificationsService;

  const mockVerification: any = {
    id: 'verif-101',
    employeeId: 'emp-101',
    verificationType: 'Employment Verification',
    agencyName: 'SafeHire Agency',
    status: VerificationStatus.REQUESTED,
    result: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationsService,
        {
          provide: PrismaService,
          useValue: {
            backgroundVerification: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === 'verif-101') return mockVerification;
                if (where.id === 'verif-completed') {
                  return { ...mockVerification, id: 'verif-completed', status: VerificationStatus.COMPLETED, result: VerificationResult.CLEAR };
                }
                return null;
              }),
              findMany: jest.fn().mockResolvedValue([mockVerification]),
              create: jest.fn().mockResolvedValue(mockVerification),
              update: jest.fn().mockImplementation(({ where, data }) => ({ ...mockVerification, ...data })),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({ id: 'log-1' }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<VerificationsService>(VerificationsService);
  });

  it('should start background verification and transition status to IN_PROGRESS', async () => {
    const result = await service.startVerification('verif-101');
    expect(result.status).toBe(VerificationStatus.IN_PROGRESS);
  });

  it('should complete background verification with valid CLEAR result', async () => {
    const result = await service.completeVerification('verif-101', {
      result: VerificationResult.CLEAR,
      remarks: 'Verified prior 3 years employment',
    });

    expect(result.status).toBe(VerificationStatus.COMPLETED);
    expect(result.result).toBe(VerificationResult.CLEAR);
  });

  it('should throw BadRequestException if completing verification without result', async () => {
    await expect(
      service.completeVerification('verif-101', { result: null as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject restarting an already COMPLETED verification', async () => {
    await expect(service.startVerification('verif-completed')).rejects.toThrow(BadRequestException);
  });
});
