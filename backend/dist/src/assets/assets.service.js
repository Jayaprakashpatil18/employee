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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AssetsService = class AssetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, currentUser) {
        const asset = await this.prisma.employeeAsset.create({
            data: {
                employeeId: dto.employeeId,
                assetName: dto.assetName,
                assetType: dto.assetType,
                serialNumber: dto.serialNumber || dto.assetIdentifier || null,
                assetIdentifier: dto.assetIdentifier || dto.serialNumber || null,
                status: client_1.AssetStatus.REQUESTED,
                remarks: dto.remarks || null,
            },
            include: { employee: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id,
                employeeId: dto.employeeId,
                action: 'ASSET_CREATED',
                entity: 'EmployeeAsset',
                entityType: 'EmployeeAsset',
                entityId: asset.id,
                details: `Requested asset '${asset.assetName}' (${asset.assetType})`,
            },
        });
        return asset;
    }
    async findAll(query) {
        const where = {};
        if (query?.assetType) {
            where.assetType = { equals: query.assetType, mode: 'insensitive' };
        }
        if (query?.status) {
            where.status = query.status;
        }
        if (query?.employeeId) {
            where.employeeId = query.employeeId;
        }
        if (query?.search) {
            const s = query.search;
            where.OR = [
                { assetName: { contains: s, mode: 'insensitive' } },
                { assetType: { contains: s, mode: 'insensitive' } },
                { serialNumber: { contains: s, mode: 'insensitive' } },
                { assetIdentifier: { contains: s, mode: 'insensitive' } },
                { employee: { firstName: { contains: s, mode: 'insensitive' } } },
                { employee: { lastName: { contains: s, mode: 'insensitive' } } },
            ];
        }
        return this.prisma.employeeAsset.findMany({
            where,
            include: { employee: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByEmployee(employeeId) {
        return this.prisma.employeeAsset.findMany({
            where: { employeeId },
            include: { employee: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const asset = await this.prisma.employeeAsset.findUnique({
            where: { id },
            include: { employee: true },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Asset record with ID '${id}' not found`);
        }
        return asset;
    }
    async prepareAsset(id, dto, currentUser) {
        const asset = await this.findOne(id);
        this.assertAssetRoleAccess(asset, currentUser);
        if (dto.status !== client_1.AssetStatus.IN_PREPARATION && dto.status !== client_1.AssetStatus.READY) {
            throw new common_1.BadRequestException("Prepare asset status must be either 'IN_PREPARATION' or 'READY'.");
        }
        const updated = await this.prisma.employeeAsset.update({
            where: { id },
            data: {
                status: dto.status,
                serialNumber: dto.serialNumber || dto.assetIdentifier || asset.serialNumber,
                assetIdentifier: dto.assetIdentifier || dto.serialNumber || asset.assetIdentifier,
                preparedAt: dto.status === client_1.AssetStatus.READY ? new Date() : asset.preparedAt,
                remarks: dto.remarks || asset.remarks,
            },
            include: { employee: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id,
                employeeId: asset.employeeId,
                action: 'ASSET_PREPARED',
                entity: 'EmployeeAsset',
                entityType: 'EmployeeAsset',
                entityId: id,
                oldValue: asset.status,
                newValue: dto.status,
                details: `Updated asset '${asset.assetName}' status to ${dto.status}. Identifier: ${updated.assetIdentifier || 'N/A'}`,
            },
        });
        return updated;
    }
    async assignAsset(id, currentUser) {
        const asset = await this.findOne(id);
        this.assertAssetRoleAccess(asset, currentUser);
        const updated = await this.prisma.employeeAsset.update({
            where: { id },
            data: {
                status: client_1.AssetStatus.ASSIGNED,
                assignedAt: new Date(),
            },
            include: { employee: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id,
                employeeId: asset.employeeId,
                action: 'ASSET_ASSIGNED',
                entity: 'EmployeeAsset',
                entityType: 'EmployeeAsset',
                entityId: id,
                oldValue: asset.status,
                newValue: client_1.AssetStatus.ASSIGNED,
                details: `Assigned asset '${asset.assetName}' to employee ${asset.employee.firstName} ${asset.employee.lastName}`,
            },
        });
        return updated;
    }
    async blockAsset(id, remarks, currentUser) {
        const asset = await this.findOne(id);
        this.assertAssetRoleAccess(asset, currentUser);
        const updated = await this.prisma.employeeAsset.update({
            where: { id },
            data: {
                status: client_1.AssetStatus.BLOCKED,
                remarks: remarks || 'Asset preparation is blocked.',
            },
            include: { employee: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id,
                employeeId: asset.employeeId,
                action: 'ASSET_BLOCKED',
                entity: 'EmployeeAsset',
                entityType: 'EmployeeAsset',
                entityId: id,
                oldValue: asset.status,
                newValue: client_1.AssetStatus.BLOCKED,
                details: `Blocked asset '${asset.assetName}'. Reason: ${remarks}`,
            },
        });
        return updated;
    }
    assertAssetRoleAccess(asset, user) {
        if (!user)
            throw new common_1.ForbiddenException('User identity missing.');
        if (user.role === client_1.UserRole.EMPLOYEE) {
            throw new common_1.ForbiddenException('Employees are not authorized to update or assign hardware assets.');
        }
        if (user.role === client_1.UserRole.HR_ADMIN || user.role === client_1.UserRole.HR_MANAGER) {
            return true;
        }
        if (user.role === client_1.UserRole.IT) {
            const itTypes = ['laptop', 'credentials', 'access', 'computer', 'workstation'];
            if (itTypes.some((type) => asset.assetType.toLowerCase().includes(type))) {
                return true;
            }
        }
        if (user.role === client_1.UserRole.ADMINISTRATION) {
            const adminTypes = ['id card', 'badge', 'card', 'workstation', 'desk', 'physical'];
            if (adminTypes.some((type) => asset.assetType.toLowerCase().includes(type))) {
                return true;
            }
        }
        throw new common_1.ForbiddenException(`Your role '${user.role}' is not authorized to update assets of type '${asset.assetType}'.`);
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map