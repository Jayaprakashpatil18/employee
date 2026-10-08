"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const documents_service_1 = require("./documents.service");
const storage_service_1 = require("./storage.service");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
describe('DocumentsService', () => {
    let service;
    const mockHrUser = {
        id: 'user-hr-1',
        name: 'HR Admin',
        email: 'hr@example.com',
        role: client_1.UserRole.HR_ADMIN,
    };
    const mockEmployeeUser = {
        id: 'user-emp-1',
        name: 'Alex Turner',
        email: 'alex.turner@corp.example.com',
        role: client_1.UserRole.EMPLOYEE,
    };
    const mockOtherUser = {
        id: 'user-emp-2',
        name: 'Other Person',
        email: 'other@example.com',
        role: client_1.UserRole.EMPLOYEE,
    };
    const mockEmployee = {
        id: 'emp-101',
        userId: 'user-emp-1',
        email: 'alex.turner@corp.example.com',
    };
    const mockDocument = {
        id: 'doc-101',
        employeeId: 'emp-101',
        documentType: 'Aadhaar Card',
        documentName: 'aadhaar.pdf',
        submissionStatus: 'SUBMITTED',
        verificationStatus: 'PENDING',
        fileKey: 'documents/emp-101/123456_aadhaar.pdf',
        mimeType: 'application/pdf',
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                documents_service_1.DocumentsService,
                {
                    provide: storage_service_1.StorageService,
                    useValue: {
                        saveFile: jest.fn().mockResolvedValue({
                            fileKey: 'documents/emp-101/123_test.pdf',
                            fileUrl: '/api/documents/stream/test',
                            fileSize: 1024,
                            mimeType: 'application/pdf',
                        }),
                        getFileBuffer: jest.fn().mockResolvedValue(Buffer.from('fake pdf content')),
                    },
                },
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        employeeDocument: {
                            findUnique: jest.fn().mockImplementation(({ where }) => {
                                if (where.id === 'doc-101')
                                    return mockDocument;
                                if (where.id === 'doc-unsubmitted') {
                                    return { ...mockDocument, id: 'doc-unsubmitted', submissionStatus: 'NOT_SUBMITTED' };
                                }
                                return null;
                            }),
                            findMany: jest.fn().mockResolvedValue([mockDocument]),
                            update: jest.fn().mockImplementation(({ where, data }) => ({ ...mockDocument, ...data })),
                        },
                        employee: {
                            findUnique: jest.fn().mockImplementation(({ where }) => {
                                if (where.id === 'emp-101')
                                    return mockEmployee;
                                return null;
                            }),
                        },
                        auditLog: {
                            create: jest.fn().mockResolvedValue({ id: 'log-1' }),
                        },
                    },
                },
                {
                    provide: notifications_service_1.NotificationsService,
                    useValue: {
                        createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
                        notifyDocumentRejected: jest.fn().mockResolvedValue({ id: 'notif-1' }),
                        notifyDocumentUploaded: jest.fn().mockResolvedValue({ id: 'notif-1' }),
                    },
                },
            ],
        }).compile();
        service = module.get(documents_service_1.DocumentsService);
    });
    describe('uploadDocument', () => {
        const validFile = {
            originalname: 'aadhaar_scan.pdf',
            mimetype: 'application/pdf',
            size: 1024 * 1024,
            buffer: Buffer.from('test'),
        };
        it('should successfully upload a valid PDF document for authorized employee', async () => {
            const result = await service.uploadDocument('doc-101', validFile, mockEmployeeUser);
            expect(result.submissionStatus).toBe('SUBMITTED');
            expect(result.verificationStatus).toBe('PENDING');
        });
        it('should reject file upload with unsupported MIME type', async () => {
            const invalidFile = { ...validFile, mimetype: 'text/plain' };
            await expect(service.uploadDocument('doc-101', invalidFile, mockEmployeeUser)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should reject file upload exceeding 10 MB limit', async () => {
            const oversizedFile = { ...validFile, size: 11 * 1024 * 1024 };
            await expect(service.uploadDocument('doc-101', oversizedFile, mockEmployeeUser)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Document Access & RBAC Security', () => {
        it('should allow employee to access their own document', async () => {
            const result = await service.findOne('doc-101', mockEmployeeUser);
            expect(result.id).toBe('doc-101');
        });
        it('should allow HR Admin to access employee document', async () => {
            const result = await service.findOne('doc-101', mockHrUser);
            expect(result.id).toBe('doc-101');
        });
        it('should deny unauthorized cross-employee document access (403 Forbidden)', async () => {
            await expect(service.findOne('doc-101', mockOtherUser)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    describe('HR Verification & Rejection', () => {
        it('should allow HR to verify a submitted document', async () => {
            const result = await service.verifyDocument('doc-101', { remarks: 'Valid scan' }, mockHrUser);
            expect(result.verificationStatus).toBe('VERIFIED');
        });
        it('should throw BadRequestException when rejecting document without rejectionReason', async () => {
            await expect(service.rejectDocument('doc-101', { rejectionReason: '' }, mockHrUser)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should allow HR to reject document with valid reason', async () => {
            const result = await service.rejectDocument('doc-101', { rejectionReason: 'Blurry copy' }, mockHrUser);
            expect(result.verificationStatus).toBe('REJECTED');
            expect(result.rejectionReason).toBe('Blurry copy');
        });
        it('should deny non-HR user from verifying document', async () => {
            await expect(service.verifyDocument('doc-101', {}, mockEmployeeUser)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=documents.service.spec.js.map