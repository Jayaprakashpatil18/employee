"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const health_controller_1 = require("./health/health.controller");
const users_module_1 = require("./users/users.module");
const candidates_module_1 = require("./candidates/candidates.module");
const employees_module_1 = require("./employees/employees.module");
const onboarding_plans_module_1 = require("./onboarding-plans/onboarding-plans.module");
const documents_module_1 = require("./documents/documents.module");
const verifications_module_1 = require("./verifications/verifications.module");
const tasks_module_1 = require("./tasks/tasks.module");
const assets_module_1 = require("./assets/assets.module");
const checklist_module_1 = require("./checklist/checklist.module");
const readiness_module_1 = require("./readiness/readiness.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_module_1 = require("./audit/audit.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            candidates_module_1.CandidatesModule,
            employees_module_1.EmployeesModule,
            onboarding_plans_module_1.OnboardingPlansModule,
            documents_module_1.DocumentsModule,
            verifications_module_1.VerificationsModule,
            tasks_module_1.TasksModule,
            assets_module_1.AssetsModule,
            checklist_module_1.ChecklistModule,
            readiness_module_1.ReadinessModule,
            dashboard_module_1.DashboardModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map