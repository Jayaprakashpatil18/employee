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
exports.OnboardingPlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OnboardingPlansService = class OnboardingPlansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        if (dto.isActive !== false) {
            await this.validateUniqueActivePlan(dto.department, dto.designation, dto.location, dto.employmentType);
        }
        return this.prisma.onboardingPlan.create({
            data: {
                title: dto.title,
                description: dto.description,
                department: dto.department,
                designation: dto.designation || null,
                location: dto.location || null,
                employmentType: dto.employmentType || null,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
                documentRequirements: {
                    create: dto.documentRequirements || [],
                },
                taskRequirements: {
                    create: dto.taskRequirements || [],
                },
                assetRequirements: {
                    create: dto.assetRequirements || [],
                },
                checklistRequirements: {
                    create: dto.checklistRequirements || [],
                },
            },
            include: {
                documentRequirements: true,
                taskRequirements: true,
                assetRequirements: true,
                checklistRequirements: true,
            },
        });
    }
    async findAll() {
        return this.prisma.onboardingPlan.findMany({
            include: {
                documentRequirements: true,
                taskRequirements: true,
                assetRequirements: true,
                checklistRequirements: true,
                _count: { select: { employees: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const plan = await this.prisma.onboardingPlan.findUnique({
            where: { id },
            include: {
                documentRequirements: true,
                taskRequirements: true,
                assetRequirements: true,
                checklistRequirements: true,
                employees: true,
            },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Onboarding plan with ID '${id}' not found`);
        }
        return plan;
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        if (dto.isActive === true) {
            await this.validateUniqueActivePlan(dto.department || existing.department, dto.designation !== undefined ? dto.designation : existing.designation, dto.location !== undefined ? dto.location : existing.location, dto.employmentType !== undefined ? dto.employmentType : existing.employmentType, id);
        }
        return this.prisma.onboardingPlan.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                department: dto.department,
                designation: dto.designation,
                location: dto.location,
                employmentType: dto.employmentType,
                isActive: dto.isActive,
            },
            include: {
                documentRequirements: true,
                taskRequirements: true,
                assetRequirements: true,
                checklistRequirements: true,
            },
        });
    }
    async setPlanStatus(id, isActive) {
        const plan = await this.findOne(id);
        if (isActive) {
            await this.validateUniqueActivePlan(plan.department, plan.designation, plan.location, plan.employmentType, id);
        }
        return this.prisma.onboardingPlan.update({
            where: { id },
            data: { isActive },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.onboardingPlan.delete({ where: { id } });
    }
    async validateUniqueActivePlan(department, designation, location, employmentType, excludePlanId) {
        const activeDuplicate = await this.prisma.onboardingPlan.findFirst({
            where: {
                id: excludePlanId ? { not: excludePlanId } : undefined,
                department: { equals: department, mode: 'insensitive' },
                designation: designation ? { equals: designation, mode: 'insensitive' } : null,
                location: location ? { equals: location, mode: 'insensitive' } : null,
                employmentType: employmentType ? { equals: employmentType, mode: 'insensitive' } : null,
                isActive: true,
            },
        });
        if (activeDuplicate) {
            throw new common_1.BadRequestException(`An active onboarding plan ('${activeDuplicate.title}') already exists for this combination of Department, Designation, Location, and Employment Type.`);
        }
    }
};
exports.OnboardingPlansService = OnboardingPlansService;
exports.OnboardingPlansService = OnboardingPlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OnboardingPlansService);
//# sourceMappingURL=onboarding-plans.service.js.map