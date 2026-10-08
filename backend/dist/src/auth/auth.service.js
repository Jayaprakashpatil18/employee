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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async syncUser(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { clerkUserId: dto.clerkUserId },
        });
        if (existingUser) {
            return this.prisma.user.update({
                where: { clerkUserId: dto.clerkUserId },
                data: {
                    email: dto.email,
                    name: dto.name,
                    ...(dto.department ? { department: dto.department } : {}),
                },
            });
        }
        return this.prisma.user.create({
            data: {
                clerkUserId: dto.clerkUserId,
                email: dto.email,
                name: dto.name,
                role: dto.role || client_1.UserRole.EMPLOYEE,
                department: dto.department || 'General',
            },
        });
    }
    async getCurrentUser(clerkUserId) {
        return this.prisma.user.findUnique({
            where: { clerkUserId },
            include: {
                employee: true,
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map