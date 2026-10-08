import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetStatus, User, UserRole } from '@prisma/client';

export interface CreateAssetDto {
  employeeId: string;
  assetName: string;
  assetType: string;
  serialNumber?: string;
  assetIdentifier?: string;
  remarks?: string;
}

export interface QueryAssetsDto {
  search?: string;
  assetType?: string;
  status?: AssetStatus;
  employeeId?: string;
}

export interface PrepareAssetDto {
  status: AssetStatus; // IN_PREPARATION or READY
  serialNumber?: string;
  assetIdentifier?: string;
  remarks?: string;
}

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetDto, currentUser?: User) {
    const asset = await this.prisma.employeeAsset.create({
      data: {
        employeeId: dto.employeeId,
        assetName: dto.assetName,
        assetType: dto.assetType,
        serialNumber: dto.serialNumber || dto.assetIdentifier || null,
        assetIdentifier: dto.assetIdentifier || dto.serialNumber || null,
        status: AssetStatus.REQUESTED,
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

  async findAll(query?: QueryAssetsDto) {
    const where: any = {};

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

  async findByEmployee(employeeId: string) {
    return this.prisma.employeeAsset.findMany({
      where: { employeeId },
      include: { employee: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.employeeAsset.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!asset) {
      throw new NotFoundException(`Asset record with ID '${id}' not found`);
    }
    return asset;
  }

  async prepareAsset(id: string, dto: PrepareAssetDto, currentUser: User) {
    const asset = await this.findOne(id);
    this.assertAssetRoleAccess(asset, currentUser);

    if (dto.status !== AssetStatus.IN_PREPARATION && dto.status !== AssetStatus.READY) {
      throw new BadRequestException("Prepare asset status must be either 'IN_PREPARATION' or 'READY'.");
    }

    const updated = await this.prisma.employeeAsset.update({
      where: { id },
      data: {
        status: dto.status,
        serialNumber: dto.serialNumber || dto.assetIdentifier || asset.serialNumber,
        assetIdentifier: dto.assetIdentifier || dto.serialNumber || asset.assetIdentifier,
        preparedAt: dto.status === AssetStatus.READY ? new Date() : asset.preparedAt,
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

  async assignAsset(id: string, currentUser: User) {
    const asset = await this.findOne(id);
    this.assertAssetRoleAccess(asset, currentUser);

    const updated = await this.prisma.employeeAsset.update({
      where: { id },
      data: {
        status: AssetStatus.ASSIGNED,
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
        newValue: AssetStatus.ASSIGNED,
        details: `Assigned asset '${asset.assetName}' to employee ${asset.employee.firstName} ${asset.employee.lastName}`,
      },
    });

    return updated;
  }

  async blockAsset(id: string, remarks: string, currentUser: User) {
    const asset = await this.findOne(id);
    this.assertAssetRoleAccess(asset, currentUser);

    const updated = await this.prisma.employeeAsset.update({
      where: { id },
      data: {
        status: AssetStatus.BLOCKED,
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
        newValue: AssetStatus.BLOCKED,
        details: `Blocked asset '${asset.assetName}'. Reason: ${remarks}`,
      },
    });

    return updated;
  }

  private assertAssetRoleAccess(asset: any, user: User) {
    if (!user) throw new ForbiddenException('User identity missing.');
    if (user.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Employees are not authorized to update or assign hardware assets.');
    }

    if (user.role === UserRole.HR_ADMIN || user.role === UserRole.HR_MANAGER) {
      return true;
    }

    // IT manages Laptop, System Access, Access Credentials
    if (user.role === UserRole.IT) {
      const itTypes = ['laptop', 'credentials', 'access', 'computer', 'workstation'];
      if (itTypes.some((type) => asset.assetType.toLowerCase().includes(type))) {
        return true;
      }
    }

    // Administration manages ID Card, Physical Workstation
    if (user.role === UserRole.ADMINISTRATION) {
      const adminTypes = ['id card', 'badge', 'card', 'workstation', 'desk', 'physical'];
      if (adminTypes.some((type) => asset.assetType.toLowerCase().includes(type))) {
        return true;
      }
    }

    throw new ForbiddenException(`Your role '${user.role}' is not authorized to update assets of type '${asset.assetType}'.`);
  }
}
