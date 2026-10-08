export interface UploadedMulterFile {
    fieldname?: string;
    originalname: string;
    encoding?: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export interface StoredFileResult {
    fileKey: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
}
export declare class StorageService {
    private uploadDir;
    constructor();
    saveFile(file: UploadedMulterFile, employeeId: string): Promise<StoredFileResult>;
    getFileBuffer(fileKey: string): Promise<Buffer>;
    deleteFile(fileKey: string): Promise<void>;
    private getSanitizedFullPath;
}
