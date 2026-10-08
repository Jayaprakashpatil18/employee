import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { User } from '@prisma/client';
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
export declare class DocumentsService {
    private readonly prisma;
    private readonly storageService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, storageService: StorageService, notificationsService: NotificationsService);
    findByEmployee(employeeId: string, currentUser: User): Promise<({
        employee: {
            id: string;
            email: string;
            department: string;
            createdAt: Date;
            updatedAt: Date;
            designation: string;
            location: string;
            employmentType: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            employeeId: string;
            joiningDate: Date;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            candidateId: string | null;
            userId: string | null;
            onboardingPlanId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        isRequired: boolean;
        employeeId: string;
        documentName: string;
        fileUrl: string | null;
        fileKey: string | null;
        fileSize: number | null;
        mimeType: string | null;
        submissionStatus: import(".prisma/client").$Enums.DocumentSubmissionStatus;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
        submittedAt: Date | null;
        rejectionReason: string | null;
        remarks: string | null;
        verifiedAt: Date | null;
        verifiedById: string | null;
    })[]>;
    findOne(id: string, currentUser: User): Promise<{
        employee: {
            id: string;
            email: string;
            department: string;
            createdAt: Date;
            updatedAt: Date;
            designation: string;
            location: string;
            employmentType: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            employeeId: string;
            joiningDate: Date;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            candidateId: string | null;
            userId: string | null;
            onboardingPlanId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        isRequired: boolean;
        employeeId: string;
        documentName: string;
        fileUrl: string | null;
        fileKey: string | null;
        fileSize: number | null;
        mimeType: string | null;
        submissionStatus: import(".prisma/client").$Enums.DocumentSubmissionStatus;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
        submittedAt: Date | null;
        rejectionReason: string | null;
        remarks: string | null;
        verifiedAt: Date | null;
        verifiedById: string | null;
    }>;
    uploadDocument(documentId: string, file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }, currentUser: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        isRequired: boolean;
        employeeId: string;
        documentName: string;
        fileUrl: string | null;
        fileKey: string | null;
        fileSize: number | null;
        mimeType: string | null;
        submissionStatus: import(".prisma/client").$Enums.DocumentSubmissionStatus;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
        submittedAt: Date | null;
        rejectionReason: string | null;
        remarks: string | null;
        verifiedAt: Date | null;
        verifiedById: string | null;
    }>;
    downloadDocumentStream(documentId: string, currentUser: User): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        fileName: string;
        mimeType: string;
    }>;
    verifyDocument(documentId: string, dto: VerifyDocumentDto, currentUser: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        isRequired: boolean;
        employeeId: string;
        documentName: string;
        fileUrl: string | null;
        fileKey: string | null;
        fileSize: number | null;
        mimeType: string | null;
        submissionStatus: import(".prisma/client").$Enums.DocumentSubmissionStatus;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
        submittedAt: Date | null;
        rejectionReason: string | null;
        remarks: string | null;
        verifiedAt: Date | null;
        verifiedById: string | null;
    }>;
    rejectDocument(documentId: string, dto: RejectDocumentDto, currentUser: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        isRequired: boolean;
        employeeId: string;
        documentName: string;
        fileUrl: string | null;
        fileKey: string | null;
        fileSize: number | null;
        mimeType: string | null;
        submissionStatus: import(".prisma/client").$Enums.DocumentSubmissionStatus;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
        submittedAt: Date | null;
        rejectionReason: string | null;
        remarks: string | null;
        verifiedAt: Date | null;
        verifiedById: string | null;
    }>;
    requestResubmission(documentId: string, dto: ResubmitRequestDto, currentUser: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        isRequired: boolean;
        employeeId: string;
        documentName: string;
        fileUrl: string | null;
        fileKey: string | null;
        fileSize: number | null;
        mimeType: string | null;
        submissionStatus: import(".prisma/client").$Enums.DocumentSubmissionStatus;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
        submittedAt: Date | null;
        rejectionReason: string | null;
        remarks: string | null;
        verifiedAt: Date | null;
        verifiedById: string | null;
    }>;
    private validateEmployeeDocumentAccess;
    private assertHrRole;
}
