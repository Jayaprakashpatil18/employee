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
exports.OnboardingPlansController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const onboarding_plans_service_1 = require("./onboarding-plans.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let OnboardingPlansController = class OnboardingPlansController {
    constructor(plansService) {
        this.plansService = plansService;
    }
    async findAll() {
        return this.plansService.findAll();
    }
    async findOne(id) {
        return this.plansService.findOne(id);
    }
    async create(dto) {
        return this.plansService.create(dto);
    }
    async update(id, dto) {
        return this.plansService.update(id, dto);
    }
    async activate(id) {
        return this.plansService.setPlanStatus(id, true);
    }
    async deactivate(id) {
        return this.plansService.setPlanStatus(id, false);
    }
    async remove(id) {
        return this.plansService.remove(id);
    }
};
exports.OnboardingPlansController = OnboardingPlansController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all onboarding plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OnboardingPlansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get onboarding plan by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingPlansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create new onboarding plan (HR Admin & HR Manager)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnboardingPlansController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update onboarding plan (HR Admin & HR Manager)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OnboardingPlansController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Activate onboarding plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingPlansController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN, client_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate onboarding plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingPlansController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete onboarding plan (HR Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingPlansController.prototype, "remove", null);
exports.OnboardingPlansController = OnboardingPlansController = __decorate([
    (0, swagger_1.ApiTags)('onboarding-plans'),
    (0, common_1.Controller)('onboarding-plans'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [onboarding_plans_service_1.OnboardingPlansService])
], OnboardingPlansController);
//# sourceMappingURL=onboarding-plans.controller.js.map