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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async findAll(query) {
        return this.auditService.queryAuditLogs(query);
    }
    async findByEntity(entityType, entityId) {
        return this.auditService.getAuditHistoryForEntity(entityType, entityId);
    }
    async findByEmployee(employeeId) {
        return this.auditService.getAuditHistoryForEmployee(employeeId);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'List and filter audit logs with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'dateRange', required: false, enum: ['TODAY', '7_DAYS', '14_DAYS', '30_DAYS', 'ALL'] }),
    (0, swagger_1.ApiQuery)({ name: 'actorUserId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER, client_1.UserRole.IT, client_1.UserRole.FINANCE, client_1.UserRole.ADMINISTRATION),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity timeline for a specific entity' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER, client_1.UserRole.IT, client_1.UserRole.FINANCE, client_1.UserRole.ADMINISTRATION, client_1.UserRole.REPORTING_MANAGER, client_1.UserRole.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity timeline for a specific employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findByEmployee", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('audit'),
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map