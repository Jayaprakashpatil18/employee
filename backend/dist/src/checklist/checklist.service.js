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
exports.ChecklistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const readiness_service_1 = require("../readiness/readiness.service");
let ChecklistService = class ChecklistService {
    constructor(prisma, readinessService) {
        this.prisma = prisma;
        this.readinessService = readinessService;
    }
    async findByEmployee(employeeId) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID '${employeeId}' not found`);
        }
        const items = await this.prisma.joiningChecklistItem.findMany({
            where: { employeeId },
            include: { completedBy: true },
            orderBy: { createdAt: 'asc' },
        });
        const total = items.length;
        const completedCount = items.filter((i) => i.isCompleted).length;
        const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        return {
            employeeId,
            items,
            total,
            completedCount,
            progressPercentage,
        };
    }
    async findOne(id) {
        const item = await this.prisma.joiningChecklistItem.findUnique({
            where: { id },
            include: { completedBy: true, employee: true },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Checklist item with ID '${id}' not found`);
        }
        return item;
    }
    async update(id, dto, currentUser) {
        this.assertAuthorizedModifier(currentUser);
        const item = await this.findOne(id);
        const updated = await this.prisma.joiningChecklistItem.update({
            where: { id },
            data: {
                ...(dto.title ? { title: dto.title, item: dto.title } : {}),
                ...(dto.item ? { item: dto.item, title: dto.title || dto.item } : {}),
                ...(dto.category ? { category: dto.category } : {}),
                ...(dto.isMandatory !== undefined ? { isMandatory: dto.isMandatory } : {}),
            },
            include: { completedBy: true },
        });
        await this.readinessService.evaluateReadiness(item.employeeId, currentUser);
        return updated;
    }
    async completeItem(id, currentUser) {
        this.assertAuthorizedModifier(currentUser);
        const item = await this.findOne(id);
        const updated = await this.prisma.joiningChecklistItem.update({
            where: { id },
            data: {
                isCompleted: true,
                completedAt: new Date(),
                completedById: currentUser.id,
            },
            include: { completedBy: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser.id,
                employeeId: item.employeeId,
                action: 'CHECKLIST_COMPLETED',
                entity: 'JoiningChecklistItem',
                entityType: 'JoiningChecklistItem',
                entityId: id,
                oldValue: 'Incomplete',
                newValue: 'Completed',
                details: `Completed checklist item '${item.title || item.item}' by ${currentUser.name}`,
            },
        });
        await this.readinessService.evaluateReadiness(item.employeeId, currentUser);
        return updated;
    }
    async reopenItem(id, currentUser) {
        this.assertAuthorizedModifier(currentUser);
        const item = await this.findOne(id);
        const updated = await this.prisma.joiningChecklistItem.update({
            where: { id },
            data: {
                isCompleted: false,
                completedAt: null,
                completedById: null,
            },
            include: { completedBy: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser.id,
                employeeId: item.employeeId,
                action: 'CHECKLIST_REOPENED',
                entity: 'JoiningChecklistItem',
                entityType: 'JoiningChecklistItem',
                entityId: id,
                oldValue: 'Completed',
                newValue: 'Incomplete',
                details: `Reopened checklist item '${item.title || item.item}' by ${currentUser.name}`,
            },
        });
        await this.readinessService.evaluateReadiness(item.employeeId, currentUser);
        return updated;
    }
    assertAuthorizedModifier(user) {
        if (!user || user.role === client_1.UserRole.EMPLOYEE) {
            throw new common_1.ForbiddenException('Employees are not authorized to modify joining checklist items.');
        }
    }
};
exports.ChecklistService = ChecklistService;
exports.ChecklistService = ChecklistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        readiness_service_1.OnboardingReadinessService])
], ChecklistService);
//# sourceMappingURL=checklist.service.js.map