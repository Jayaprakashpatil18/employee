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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("./storage.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let DocumentsService = class DocumentsService {
    constructor(prisma, storageService, notificationsService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.notificationsService = notificationsService;
    }
    async findByEmployee(employeeId, currentUser) {
        await this.validateEmployeeDocumentAccess(employeeId, currentUser);
        return this.prisma.employeeDocument.findMany({
            where: { employeeId },
            include: { employee: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id, currentUser) {
        const doc = await this.prisma.employeeDocument.findUnique({
            where: { id },
            include: { employee: true },
        });
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID '${id}' not found`);
        }
        await this.validateEmployeeDocumentAccess(doc.employeeId, currentUser);
        return doc;
    }
    async uploadDocument(documentId, file, currentUser) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided for upload.');
        }
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
            throw new common_1.BadRequestException(`Invalid file format '${file.mimetype}'. Only PDF, JPG, and PNG files are allowed.`);
        }
        const maxSizeInBytes = 10 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            throw new common_1.BadRequestException(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 10 MB.`);
        }
        const doc = await this.prisma.employeeDocument.findUnique({
            where: { id: documentId },
            include: { employee: true },
        });
        if (!doc) {
            throw new common_1.NotFoundException(`Document requirement with ID '${documentId}' not found.`);
        }
        await this.validateEmployeeDocumentAccess(doc.employeeId, currentUser);
        const stored = await this.storageService.saveFile(file, doc.employeeId);
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
    async downloadDocumentStream(documentId, currentUser) {
        const doc = await this.findOne(documentId, currentUser);
        if (!doc.fileKey) {
            throw new common_1.BadRequestException('No uploaded file exists for this document record.');
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
    async verifyDocument(documentId, dto, currentUser) {
        this.assertHrRole(currentUser);
        const doc = await this.prisma.employeeDocument.findUnique({ where: { id: documentId } });
        if (!doc)
            throw new common_1.NotFoundException(`Document with ID '${documentId}' not found`);
        if (doc.submissionStatus !== 'SUBMITTED') {
            throw new common_1.BadRequestException('Cannot verify a document that has not been submitted yet.');
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
    async rejectDocument(documentId, dto, currentUser) {
        this.assertHrRole(currentUser);
        if (!dto.rejectionReason || dto.rejectionReason.trim() === '') {
            throw new common_1.BadRequestException('Rejection reason is required when rejecting a document.');
        }
        const doc = await this.prisma.employeeDocument.findUnique({ where: { id: documentId } });
        if (!doc)
            throw new common_1.NotFoundException(`Document with ID '${documentId}' not found`);
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
    async requestResubmission(documentId, dto, currentUser) {
        this.assertHrRole(currentUser);
        if (!dto.remarks || dto.remarks.trim() === '') {
            throw new common_1.BadRequestException('Remarks are required when requesting document resubmission.');
        }
        const doc = await this.prisma.employeeDocument.findUnique({ where: { id: documentId } });
        if (!doc)
            throw new common_1.NotFoundException(`Document with ID '${documentId}' not found`);
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
    async validateEmployeeDocumentAccess(employeeId, currentUser) {
        if (!currentUser)
            throw new common_1.ForbiddenException('User identity not provided.');
        if (currentUser.role === client_1.UserRole.HR_ADMIN || currentUser.role === client_1.UserRole.HR_MANAGER) {
            return true;
        }
        const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (employee && (employee.userId === currentUser.id || employee.email === currentUser.email)) {
            return true;
        }
        throw new common_1.ForbiddenException('You are not authorized to view or modify documents for this employee.');
    }
    assertHrRole(user) {
        if (!user || (user.role !== client_1.UserRole.HR_ADMIN && user.role !== client_1.UserRole.HR_MANAGER)) {
            throw new common_1.ForbiddenException('Only HR Admins and HR Managers can perform document verification actions.');
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        notifications_service_1.NotificationsService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map