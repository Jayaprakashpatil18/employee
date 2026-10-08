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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary(query) {
        return this.dashboardService.getSummary(query);
    }
    async getAnalytics(query) {
        return this.dashboardService.getAnalytics(query);
    }
    async getAttentionRequired(query) {
        return this.dashboardService.getAttentionRequired(query);
    }
    async getPendingRequirements(query) {
        return this.dashboardService.getPendingRequirements(query);
    }
    async getUpcomingJoiners(query) {
        return this.dashboardService.getUpcomingJoiners(query);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top-level onboarding KPI counts' }),
    (0, swagger_1.ApiQuery)({ name: 'dateRange', required: false, enum: ['TODAY', '7_DAYS', '14_DAYS', '30_DAYS', 'ALL'] }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'location', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'employmentType', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Summary KPI card counts.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get readiness distribution charts and department/location breakdowns' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics chart data and table metrics.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('attention-required'),
    (0, swagger_1.ApiOperation)({ summary: 'Get high-priority attention required alerts sorted by urgency' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of employees requiring urgent HR intervention.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAttentionRequired", null);
__decorate([
    (0, common_1.Get)('pending-requirements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending documents, verifications, tasks, and assets breakdown' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grouped lists of pending onboarding items.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPendingRequirements", null);
__decorate([
    (0, common_1.Get)('upcoming-joiners'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming joiners table with urgency indicators and readiness metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.OnboardingStatus }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upcoming joiners list.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUpcomingJoiners", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('HR Dashboard & Management Analytics'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map