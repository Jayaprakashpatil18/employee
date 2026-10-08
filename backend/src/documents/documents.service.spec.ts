import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('DocumentsService', () => {
  let service: DocumentsService;

  const mockHrUser: any = {
    id: 'user-hr-1',
    name: 'HR Admin',
    email: 'hr@example.com',
    role: UserRole.HR_ADMIN,
  };

  const mockEmployeeUser: any = {
    id: 'user-emp-1',
    name: 'Alex Turner',
    email: 'alex.turner@corp.example.com',
    role: UserRole.EMPLOYEE,
  };

  const mockOtherUser: any = {
    id: 'user-emp-2',
    name: 'Other Person',
    email: 'other@example.com',
    role: UserRole.EMPLOYEE,
  };

  const mockEmployee: any = {
    id: 'emp-101',
    userId: 'user-emp-1',
    email: 'alex.turner@corp.example.com',
  };

  const mockDocument: any = {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: StorageService,
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
          provide: PrismaService,
          useValue: {
            employeeDocument: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === 'doc-101') return mockDocument;
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
                if (where.id === 'emp-101') return mockEmployee;
                return null;
              }),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({ id: 'log-1' }),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
            notifyDocumentRejected: jest.fn().mockResolvedValue({ id: 'notif-1' }),
            notifyDocumentUploaded: jest.fn().mockResolvedValue({ id: 'notif-1' }),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  describe('uploadDocument', () => {
    const validFile: any = {
      originalname: 'aadhaar_scan.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('test'),
    };

    it('should successfully upload a valid PDF document for authorized employee', async () => {
      const result = await service.uploadDocument('doc-101', validFile, mockEmployeeUser);
      expect(result.submissionStatus).toBe('SUBMITTED');
      expect(result.verificationStatus).toBe('PENDING');
    });

    it('should reject file upload with unsupported MIME type', async () => {
      const invalidFile: any = { ...validFile, mimetype: 'text/plain' };
      await expect(
        service.uploadDocument('doc-101', invalidFile, mockEmployeeUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject file upload exceeding 10 MB limit', async () => {
      const oversizedFile: any = { ...validFile, size: 11 * 1024 * 1024 };
      await expect(
        service.uploadDocument('doc-101', oversizedFile, mockEmployeeUser),
      ).rejects.toThrow(BadRequestException);
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
      await expect(service.findOne('doc-101', mockOtherUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('HR Verification & Rejection', () => {
    it('should allow HR to verify a submitted document', async () => {
      const result = await service.verifyDocument('doc-101', { remarks: 'Valid scan' }, mockHrUser);
      expect(result.verificationStatus).toBe('VERIFIED');
    });

    it('should throw BadRequestException when rejecting document without rejectionReason', async () => {
      await expect(
        service.rejectDocument('doc-101', { rejectionReason: '' }, mockHrUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow HR to reject document with valid reason', async () => {
      const result = await service.rejectDocument('doc-101', { rejectionReason: 'Blurry copy' }, mockHrUser);
      expect(result.verificationStatus).toBe('REJECTED');
      expect(result.rejectionReason).toBe('Blurry copy');
    });

    it('should deny non-HR user from verifying document', async () => {
      await expect(
        service.verifyDocument('doc-101', {}, mockEmployeeUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
