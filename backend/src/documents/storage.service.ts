import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

const BLOCKED_EXTENSIONS = [
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.js',
  '.html',
  '.htm',
  '.svg',
  '.vbs',
  '.ps1',
  '.dll',
  '.com',
  '.msi',
  '.scr',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];

@Injectable()
export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: UploadedMulterFile,
    employeeId: string,
  ): Promise<StoredFileResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check against blocked script/executable extensions
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(`File extension '${ext}' is strictly prohibited for security reasons.`);
    }

    // Check against allowed document extensions
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `File extension '${ext}' is not supported. Allowed formats: PDF, JPG, PNG, WEBP, DOC, DOCX.`,
      );
    }

    const timestamp = Date.now();
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const relativeKey = `documents/${employeeId}/${timestamp}_${safeBaseName}${ext}`;

    const targetSubDir = path.join(this.uploadDir, 'documents', employeeId);
    if (!fs.existsSync(targetSubDir)) {
      fs.mkdirSync(targetSubDir, { recursive: true });
    }

    const fullPath = this.getSanitizedFullPath(relativeKey);
    await fs.promises.writeFile(fullPath, file.buffer);

    return {
      fileKey: relativeKey,
      fileUrl: `/api/documents/stream/${encodeURIComponent(relativeKey)}`,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async getFileBuffer(fileKey: string): Promise<Buffer> {
    const fullPath = this.getSanitizedFullPath(fileKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File with key '${fileKey}' not found on storage.`);
    }
    return fs.promises.readFile(fullPath);
  }

  async deleteFile(fileKey: string): Promise<void> {
    const fullPath = this.getSanitizedFullPath(fileKey);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  /**
   * Prevents directory traversal attacks by validating that the resolved full path
   * resides strictly inside the configured root uploads directory.
   */
  private getSanitizedFullPath(fileKey: string): string {
    const safeKey = path.normalize(fileKey).replace(/^(\.\.[\/\\])+/, '');
    const resolvedPath = path.resolve(this.uploadDir, safeKey);

    if (!resolvedPath.startsWith(path.resolve(this.uploadDir))) {
      throw new BadRequestException('Security Violation: Invalid file path traversal detected.');
    }

    return resolvedPath;
  }
}
