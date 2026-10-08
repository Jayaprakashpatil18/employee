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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthController = class HealthController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check(res) {
        let dbStatus = 'down';
        let isHealthy = false;
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            dbStatus = 'up';
            isHealthy = true;
        }
        catch (err) {
            dbStatus = `degraded: ${err.message}`;
        }
        const payload = {
            status: isHealthy ? 'ok' : 'degraded',
            service: 'employee-onboarding-api',
            database: dbStatus,
            timestamp: new Date().toISOString(),
            uptimeSeconds: process.uptime(),
        };
        return res
            .status(isHealthy ? common_1.HttpStatus.OK : common_1.HttpStatus.SERVICE_UNAVAILABLE)
            .json(payload);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'System and database health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service and database are healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service or database is degraded/down' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map