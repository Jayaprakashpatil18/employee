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
exports.VerificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const verifications_service_1 = require("./verifications.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const client_1 = require("@prisma/client");
let VerificationsController = class VerificationsController {
    constructor(verificationsService) {
        this.verificationsService = verificationsService;
    }
    async findByEmployee(employeeId) {
        return this.verificationsService.findByEmployee(employeeId);
    }
    async findOne(id) {
        return this.verificationsService.findOne(id);
    }
    async create(dto, user) {
        return this.verificationsService.create(dto, user);
    }
    async startVerification(id, user) {
        return this.verificationsService.startVerification(id, user);
    }
    async completeVerification(id, dto, user) {
        return this.verificationsService.completeVerification(id, dto, user);
    }
};
exports.VerificationsController = VerificationsController;
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'List background verifications for employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get background verification by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create background verification check (HR Only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Start background verification check (status -> IN_PROGRESS)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "startVerification", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Complete background verification check with result (CLEAR, FAILED, NEEDS_REVIEW)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "completeVerification", null);
exports.VerificationsController = VerificationsController = __decorate([
    (0, swagger_1.ApiTags)('verifications'),
    (0, common_1.Controller)('verifications'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [verifications_service_1.VerificationsService])
], VerificationsController);
//# sourceMappingURL=verifications.controller.js.map