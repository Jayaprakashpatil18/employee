"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const verifications_service_1 = require("./verifications.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
describe('VerificationsService', () => {
    let service;
    const mockVerification = {
        id: 'verif-101',
        employeeId: 'emp-101',
        verificationType: 'Employment Verification',
        agencyName: 'SafeHire Agency',
        status: client_1.VerificationStatus.REQUESTED,
        result: null,
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                verifications_service_1.VerificationsService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        backgroundVerification: {
                            findUnique: jest.fn().mockImplementation(({ where }) => {
                                if (where.id === 'verif-101')
                                    return mockVerification;
                                if (where.id === 'verif-completed') {
                                    return { ...mockVerification, id: 'verif-completed', status: client_1.VerificationStatus.COMPLETED, result: client_1.VerificationResult.CLEAR };
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
        service = module.get(verifications_service_1.VerificationsService);
    });
    it('should start background verification and transition status to IN_PROGRESS', async () => {
        const result = await service.startVerification('verif-101');
        expect(result.status).toBe(client_1.VerificationStatus.IN_PROGRESS);
    });
    it('should complete background verification with valid CLEAR result', async () => {
        const result = await service.completeVerification('verif-101', {
            result: client_1.VerificationResult.CLEAR,
            remarks: 'Verified prior 3 years employment',
        });
        expect(result.status).toBe(client_1.VerificationStatus.COMPLETED);
        expect(result.result).toBe(client_1.VerificationResult.CLEAR);
    });
    it('should throw BadRequestException if completing verification without result', async () => {
        await expect(service.completeVerification('verif-101', { result: null })).rejects.toThrow(common_1.BadRequestException);
    });
    it('should reject restarting an already COMPLETED verification', async () => {
        await expect(service.startVerification('verif-completed')).rejects.toThrow(common_1.BadRequestException);
    });
});
//# sourceMappingURL=verifications.service.spec.js.map