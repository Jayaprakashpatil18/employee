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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationsModule = exports.VerificationsController = exports.VerificationsService = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
let VerificationsService = class VerificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() { return this.prisma.backgroundVerification.findMany({ include: { employee: true } }); }
    async findOne(id) { return this.prisma.backgroundVerification.findUnique({ where: { id }, include: { employee: true } }); }
};
exports.VerificationsService = VerificationsService;
exports.VerificationsService = VerificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VerificationsService);
let VerificationsController = class VerificationsController {
    constructor(service) {
        this.service = service;
    }
    async findAll() { return this.service.findAll(); }
    async findOne(id) { return this.service.findOne(id); }
};
exports.VerificationsController = VerificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List background verifications' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get background verification by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "findOne", null);
exports.VerificationsController = VerificationsController = __decorate([
    (0, swagger_1.ApiTags)('verifications'),
    (0, common_1.Controller)('verifications'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [VerificationsService])
], VerificationsController);
let VerificationsModule = class VerificationsModule {
};
exports.VerificationsModule = VerificationsModule;
exports.VerificationsModule = VerificationsModule = __decorate([
    (0, common_1.Module)({
        controllers: [VerificationsController],
        providers: [VerificationsService],
        exports: [VerificationsService],
    })
], VerificationsModule);
//# sourceMappingURL=verifications.module.js.map