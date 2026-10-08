"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const assets_service_1 = require("./assets.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
describe('AssetsService', () => {
    let service;
    const mockItUser = {
        id: 'user-it-1',
        name: 'IT Specialist',
        email: 'it@example.com',
        role: client_1.UserRole.IT,
    };
    const mockEmployeeUser = {
        id: 'user-emp-1',
        name: 'Alex Turner',
        email: 'alex@example.com',
        role: client_1.UserRole.EMPLOYEE,
    };
    const mockAsset = {
        id: 'asset-101',
        employeeId: 'emp-101',
        assetName: 'MacBook Pro M3 Max 16"',
        assetType: 'Laptop (MacBook Pro)',
        serialNumber: null,
        assetIdentifier: null,
        status: client_1.AssetStatus.REQUESTED,
        employee: { firstName: 'Alex', lastName: 'Turner' },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                assets_service_1.AssetsService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        employeeAsset: {
                            findUnique: jest.fn().mockImplementation(({ where }) => {
                                if (where.id === 'asset-101')
                                    return mockAsset;
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
        service = module.get(assets_service_1.AssetsService);
    });
    describe('Asset Readiness Lifecycle', () => {
        it('should prepare asset and assign serial number / asset identifier', async () => {
            const result = await service.prepareAsset('asset-101', { status: client_1.AssetStatus.READY, assetIdentifier: 'LAP-2026-9921' }, mockItUser);
            expect(result.status).toBe(client_1.AssetStatus.READY);
            expect(result.assetIdentifier).toBe('LAP-2026-9921');
        });
        it('should assign ready asset to employee', async () => {
            const result = await service.assignAsset('asset-101', mockItUser);
            expect(result.status).toBe(client_1.AssetStatus.ASSIGNED);
        });
        it('should throw BadRequestException if prepare status is invalid', async () => {
            await expect(service.prepareAsset('asset-101', { status: client_1.AssetStatus.ASSIGNED }, mockItUser)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('RBAC Authorization', () => {
        it('should deny employee from modifying asset status (403 Forbidden)', async () => {
            await expect(service.assignAsset('asset-101', mockEmployeeUser)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=assets.service.spec.js.map