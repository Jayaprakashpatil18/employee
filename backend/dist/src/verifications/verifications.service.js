"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let VerificationsService = class VerificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, currentUser) {
        const verification = await this.prisma.backgroundVerification.create({
            data: {
                employeeId: dto.employeeId,
                verificationType: dto.verificationType,
                agencyName: dto.agencyName || 'Internal Verification Agency',
                status: client_1.VerificationStatus.REQUESTED,
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
    async findByEmployee(employeeId) {
        return this.prisma.backgroundVerification.findMany({
            where: { employeeId },
            include: { employee: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const v = await this.prisma.backgroundVerification.findUnique({
            where: { id },
            include: { employee: true },
        });
        if (!v) {
            throw new common_1.NotFoundException(`Background verification record with ID '${id}' not found`);
        }
        return v;
    }
    async startVerification(id, currentUser) {
        const v = await this.findOne(id);
        if (v.status === client_1.VerificationStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot start a background verification that is already COMPLETED.');
        }
        const updated = await this.prisma.backgroundVerification.update({
            where: { id },
            data: {
                status: client_1.VerificationStatus.IN_PROGRESS,
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
                newValue: client_1.VerificationStatus.IN_PROGRESS,
                details: `Started background check '${v.verificationType}'`,
            },
        });
        return updated;
    }
    async completeVerification(id, dto, currentUser) {
        const v = await this.findOne(id);
        if (!dto.result) {
            throw new common_1.BadRequestException('A completion result (CLEAR, FAILED, or NEEDS_REVIEW) is required to complete background verification.');
        }
        if (!Object.values(client_1.VerificationResult).includes(dto.result)) {
            throw new common_1.BadRequestException(`Invalid verification result '${dto.result}'. Allowed values: CLEAR, FAILED, NEEDS_REVIEW.`);
        }
        const updated = await this.prisma.backgroundVerification.update({
            where: { id },
            data: {
                status: client_1.VerificationStatus.COMPLETED,
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
};
exports.VerificationsService = VerificationsService;
exports.VerificationsService = VerificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VerificationsService);
//# sourceMappingURL=verifications.service.js.map