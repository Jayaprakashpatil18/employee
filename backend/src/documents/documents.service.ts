import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { User, UserRole } from '@prisma/client';

export interface VerifyDocumentDto {
  remarks?: string;
}

export interface RejectDocumentDto {
  rejectionReason: string;
  remarks?: string;
}

export interface ResubmitRequestDto {
  remarks: string;
}

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByEmployee(employeeId: string, currentUser: User) {
    await this.validateEmployeeDocumentAccess(employeeId, currentUser);
    return this.prisma.employeeDocument.findMany({
      where: { employeeId },
      include: { employee: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, currentUser: User) {
    const doc = await this.prisma.employeeDocument.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!doc) {
      throw new NotFoundException(`Document with ID '${id}' not found`);
    }

    await this.validateEmployeeDocumentAccess(doc.employeeId, currentUser);
    return doc;
  }

  async uploadDocument(
    documentId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    currentUser: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    // Backend MIME Validation
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(
        `Invalid file format '${file.mimetype}'. Only PDF, JPG, and PNG files are allowed.`,
      );
    }

    // Backend Size Validation (10 MB limit)
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException(
        `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 10 MB.`,
      );
    }

    const doc = await this.prisma.employeeDocument.findUnique({
      where: { id: documentId },
      include: { employee: true },
    });
    if (!doc) {
      throw new NotFoundException(`Document requirement with ID '${documentId}' not found.`);
    }

    // RBAC ownership check: Employee can upload only for their own profile unless HR
    await this.validateEmployeeDocumentAccess(doc.employeeId, currentUser);

    // Save File via Storage Service
    const stored = await this.storageService.saveFile(file, doc.employeeId);

    // Update Employee Document Record
    const updated = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        documentName: file.originalname,
        fileUrl: stored.fileUrl,
        fileKey: stored.fileKey,
        fileSize: stored.fileSize,
        mimeType: stored.mimeType,
        submissionStatus: 'SUBMITTED',
        verificationStatus: 'PENDING',
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });

    // Record Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: doc.employeeId,
        action: 'DOCUMENT_UPLOADED',
        entity: 'EmployeeDocument',
        entityType: 'EmployeeDocument',
        entityId: doc.id,
        details: `Uploaded document '${doc.documentType}' (${file.originalname})`,
      },
    });

    return updated;
  }

  async downloadDocumentStream(documentId: string, currentUser: User) {
    const doc = await this.findOne(documentId, currentUser);
    if (!doc.fileKey) {
      throw new BadRequestException('No uploaded file exists for this document record.');
    }

    const buffer = await this.storageService.getFileBuffer(doc.fileKey);

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: doc.employeeId,
        action: 'DOCUMENT_VIEWED',
        entity: 'EmployeeDocument',
        entityType: 'EmployeeDocument',
        entityId: doc.id,
        details: `Downloaded/Viewed document '${doc.documentType}'`,
      },
    });

    return {
      buffer,
      fileName: doc.documentName,
      mimeType: doc.mimeType || 'application/octet-stream',
    };
  }

  async verifyDocument(documentId: string, dto: VerifyDocumentDto, currentUser: User) {
    this.assertHrRole(currentUser);

    const doc = await this.prisma.employeeDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException(`Document with ID '${documentId}' not found`);

    if (doc.submissionStatus !== 'SUBMITTED') {
      throw new BadRequestException('Cannot verify a document that has not been submitted yet.');
    }

    const updated = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: currentUser?.id,
        remarks: dto.remarks || null,
        rejectionReason: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: doc.employeeId,
        action: 'DOCUMENT_VERIFIED',
        entity: 'EmployeeDocument',
        entityType: 'EmployeeDocument',
        entityId: doc.id,
        oldValue: doc.verificationStatus,
        newValue: 'VERIFIED',
        details: `Verified document '${doc.documentType}' by ${currentUser.name}`,
      },
    });

    return updated;
  }

  async rejectDocument(documentId: string, dto: RejectDocumentDto, currentUser: User) {
    this.assertHrRole(currentUser);

    if (!dto.rejectionReason || dto.rejectionReason.trim() === '') {
      throw new BadRequestException('Rejection reason is required when rejecting a document.');
    }

    const doc = await this.prisma.employeeDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException(`Document with ID '${documentId}' not found`);

    const updated = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: 'REJECTED',
        rejectionReason: dto.rejectionReason,
        remarks: dto.remarks || null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: doc.employeeId,
        action: 'DOCUMENT_REJECTED',
        entity: 'EmployeeDocument',
        entityType: 'EmployeeDocument',
        entityId: doc.id,
        oldValue: doc.verificationStatus,
        newValue: 'REJECTED',
        details: `Rejected document '${doc.documentType}'. Reason: ${dto.rejectionReason}`,
      },
    });

    await this.notificationsService.createNotification({
      employeeId: doc.employeeId,
      type: 'DOCUMENT_REJECTED',
      channel: 'EMAIL',
      title: `Action Required: Document Rejected (${doc.documentType})`,
      message: `Your document '${doc.documentType}' was rejected. Reason: ${dto.rejectionReason}`,
      priority: 'HIGH',
      relatedEntityType: 'EmployeeDocument',
      relatedEntityId: doc.id,
    }).catch(() => null);

    return updated;
  }

  async requestResubmission(documentId: string, dto: ResubmitRequestDto, currentUser: User) {
    this.assertHrRole(currentUser);

    if (!dto.remarks || dto.remarks.trim() === '') {
      throw new BadRequestException('Remarks are required when requesting document resubmission.');
    }

    const doc = await this.prisma.employeeDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException(`Document with ID '${documentId}' not found`);

    const updated = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: 'RESUBMISSION_REQUIRED',
        remarks: dto.remarks,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser?.id,
        employeeId: doc.employeeId,
        action: 'DOCUMENT_RESUBMISSION_REQUESTED',
        entity: 'EmployeeDocument',
        entityType: 'EmployeeDocument',
        entityId: doc.id,
        oldValue: doc.verificationStatus,
        newValue: 'RESUBMISSION_REQUIRED',
        details: `Requested resubmission for '${doc.documentType}'. Remarks: ${dto.remarks}`,
      },
    });

    return updated;
  }

  private async validateEmployeeDocumentAccess(employeeId: string, currentUser: User) {
    if (!currentUser) throw new ForbiddenException('User identity not provided.');

    // HR roles can access any employee's document
    if (currentUser.role === UserRole.HR_ADMIN || currentUser.role === UserRole.HR_MANAGER) {
      return true;
    }

    // Employees can access ONLY their own documents
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (employee && (employee.userId === currentUser.id || employee.email === currentUser.email)) {
      return true;
    }

    throw new ForbiddenException('You are not authorized to view or modify documents for this employee.');
  }

  private assertHrRole(user: User) {
    if (!user || (user.role !== UserRole.HR_ADMIN && user.role !== UserRole.HR_MANAGER)) {
      throw new ForbiddenException('Only HR Admins and HR Managers can perform document verification actions.');
    }
  }
}
