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
exports.ReadinessController = void 0;
const common_1 = require("@nestjs/common");
const readiness_service_1 = require("./readiness.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let ReadinessController = class ReadinessController {
    constructor(readinessService) {
        this.readinessService = readinessService;
    }
    async getComplianceSummary() {
        return this.readinessService.getComplianceSummary();
    }
    async getUpcomingJoiners(search, status, department) {
        return this.readinessService.getUpcomingJoiners({ search, status, department });
    }
    async getEmployeeReadiness(employeeId, currentUser) {
        return this.readinessService.evaluateReadiness(employeeId, currentUser);
    }
};
exports.ReadinessController = ReadinessController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform-wide compliance summary for HR dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance summary metrics.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReadinessController.prototype, "getComplianceSummary", null);
__decorate([
    (0, common_1.Get)('upcoming-joiners'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming joiners with evaluated readiness metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.OnboardingStatus }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of upcoming joiners with readiness scores.' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReadinessController.prototype, "getUpcomingJoiners", null);
__decorate([
    (0, common_1.Get)('employees/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get onboarding readiness details for a specific employee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Structured readiness evaluation response.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReadinessController.prototype, "getEmployeeReadiness", null);
exports.ReadinessController = ReadinessController = __decorate([
    (0, swagger_1.ApiTags)('Readiness & Compliance Engine'),
    (0, common_1.Controller)('readiness'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [readiness_service_1.OnboardingReadinessService])
], ReadinessController);
//# sourceMappingURL=readiness.controller.js.map