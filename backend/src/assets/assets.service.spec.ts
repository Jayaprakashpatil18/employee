import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AssetStatus, UserRole } from '@prisma/client';

describe('AssetsService', () => {
  let service: AssetsService;

  const mockItUser: any = {
    id: 'user-it-1',
    name: 'IT Specialist',
    email: 'it@example.com',
    role: UserRole.IT,
  };

  const mockEmployeeUser: any = {
    id: 'user-emp-1',
    name: 'Alex Turner',
    email: 'alex@example.com',
    role: UserRole.EMPLOYEE,
  };

  const mockAsset: any = {
    id: 'asset-101',
    employeeId: 'emp-101',
    assetName: 'MacBook Pro M3 Max 16"',
    assetType: 'Laptop (MacBook Pro)',
    serialNumber: null,
    assetIdentifier: null,
    status: AssetStatus.REQUESTED,
    employee: { firstName: 'Alex', lastName: 'Turner' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: {
            employeeAsset: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === 'asset-101') return mockAsset;
                return null;
              }),
              findMany: jest.fn().mockResolvedValue([mockAsset]),
              create: jest.fn().mockResolvedValue(mockAsset),
              update: jest.fn().mockImplementation(({ where, data }) => ({ ...mockAsset, ...data })),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({ id: 'log-1' }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  describe('Asset Readiness Lifecycle', () => {
    it('should prepare asset and assign serial number / asset identifier', async () => {
      const result = await service.prepareAsset(
        'asset-101',
        { status: AssetStatus.READY, assetIdentifier: 'LAP-2026-9921' },
        mockItUser,
      );

      expect(result.status).toBe(AssetStatus.READY);
      expect(result.assetIdentifier).toBe('LAP-2026-9921');
    });

    it('should assign ready asset to employee', async () => {
      const result = await service.assignAsset('asset-101', mockItUser);
      expect(result.status).toBe(AssetStatus.ASSIGNED);
    });

    it('should throw BadRequestException if prepare status is invalid', async () => {
      await expect(
        service.prepareAsset('asset-101', { status: AssetStatus.ASSIGNED }, mockItUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('RBAC Authorization', () => {
    it('should deny employee from modifying asset status (403 Forbidden)', async () => {
      await expect(
        service.assignAsset('asset-101', mockEmployeeUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
