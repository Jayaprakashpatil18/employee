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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
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
let StorageService = class StorageService {
    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async saveFile(file, employeeId) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (BLOCKED_EXTENSIONS.includes(ext)) {
            throw new common_1.BadRequestException(`File extension '${ext}' is strictly prohibited for security reasons.`);
        }
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            throw new common_1.BadRequestException(`File extension '${ext}' is not supported. Allowed formats: PDF, JPG, PNG, WEBP, DOC, DOCX.`);
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
    async getFileBuffer(fileKey) {
        const fullPath = this.getSanitizedFullPath(fileKey);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File with key '${fileKey}' not found on storage.`);
        }
        return fs.promises.readFile(fullPath);
    }
    async deleteFile(fileKey) {
        const fullPath = this.getSanitizedFullPath(fileKey);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    }
    getSanitizedFullPath(fileKey) {
        const safeKey = path.normalize(fileKey).replace(/^(\.\.[\/\\])+/, '');
        const resolvedPath = path.resolve(this.uploadDir, safeKey);
        if (!resolvedPath.startsWith(path.resolve(this.uploadDir))) {
            throw new common_1.BadRequestException('Security Violation: Invalid file path traversal detected.');
        }
        return resolvedPath;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map