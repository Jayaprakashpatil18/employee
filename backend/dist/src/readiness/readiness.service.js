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
exports.OnboardingReadinessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const document_readiness_evaluator_1 = require("./evaluators/document-readiness.evaluator");
const verification_readiness_evaluator_1 = require("./evaluators/verification-readiness.evaluator");
const task_readiness_evaluator_1 = require("./evaluators/task-readiness.evaluator");
const asset_readiness_evaluator_1 = require("./evaluators/asset-readiness.evaluator");
const checklist_readiness_evaluator_1 = require("./evaluators/checklist-readiness.evaluator");
const status_resolver_1 = require("./status-resolver");
let OnboardingReadinessService = class OnboardingReadinessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluateReadiness(employeeId, currentUser) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                documents: true,
                verifications: true,
                tasks: true,
                assets: true,
                checklist: true,
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID '${employeeId}' not found`);
        }
        const docReqs = document_readiness_evaluator_1.DocumentReadinessEvaluator.evaluate(employee.documents || []);
        const verifReqs = verification_readiness_evaluator_1.VerificationReadinessEvaluator.evaluate(employee.verifications || []);
        const taskReqs = task_readiness_evaluator_1.TaskReadinessEvaluator.evaluate(employee.tasks || []);
        const assetReqs = asset_readiness_evaluator_1.AssetReadinessEvaluator.evaluate(employee.assets || []);
        const checklistReqs = checklist_readiness_evaluator_1.ChecklistReadinessEvaluator.evaluate(employee.checklist || []);
        const allRequirements = [
            ...docReqs,
            ...verifReqs,
            ...taskReqs,
            ...assetReqs,
            ...checklistReqs,
        ];
        const resolved = status_resolver_1.StatusResolver.resolveStatus(allRequirements);
        const buildCategorySummary = (reqs) => ({
            total: reqs.length,
            completed: reqs.filter((r) => r.isComplete).length,
            pending: reqs.filter((r) => !r.isComplete).length,
        });
        const categories = {
            documents: buildCategorySummary(docReqs),
            verifications: buildCategorySummary(verifReqs),
            tasks: buildCategorySummary(taskReqs),
            assets: buildCategorySummary(assetReqs),
            checklist: buildCategorySummary(checklistReqs),
        };
        const issues = [];
        allRequirements.forEach((r) => {
            if (r.isBlocked) {
                issues.push({
                    category: r.category,
                    name: r.name,
                    severity: 'CRITICAL',
                    type: 'BLOCKED',
                    message: r.reason || `Critical blocker in ${r.category.toLowerCase()}: ${r.name}`,
                });
            }
            else if (r.isOverdue) {
                issues.push({
                    category: r.category,
                    name: r.name,
                    severity: 'HIGH',
                    type: 'OVERDUE',
                    message: r.reason || `Overdue ${r.category.toLowerCase()}: ${r.name}`,
                });
            }
            else if (r.status === 'REJECTED' || r.status === 'RESUBMISSION_REQUIRED') {
                issues.push({
                    category: r.category,
                    name: r.name,
                    severity: 'CRITICAL',
                    type: 'REJECTED',
                    message: r.reason || `Document '${r.name}' requires resubmission`,
                });
            }
            else if (r.status === 'NEEDS_REVIEW') {
                issues.push({
                    category: r.category,
                    name: r.name,
                    severity: 'HIGH',
                    type: 'NEEDS_REVIEW',
                    message: r.reason || `Verification '${r.name}' requires HR review`,
                });
            }
            else if (!r.isComplete && r.mandatory) {
                issues.push({
                    category: r.category,
                    name: r.name,
                    severity: 'MEDIUM',
                    type: 'PENDING',
                    message: r.reason || `Pending mandatory ${r.category.toLowerCase()}: ${r.name}`,
                });
            }
        });
        if (employee.onboardingStatus !== resolved.status) {
            await this.prisma.employee.update({
                where: { id: employeeId },
                data: { onboardingStatus: resolved.status },
            });
            await this.prisma.auditLog.create({
                data: {
                    userId: currentUser?.id,
                    employeeId: employee.id,
                    action: 'READINESS_STATUS_CHANGED',
                    entity: 'Employee',
                    entityType: 'Employee',
                    entityId: employee.id,
                    oldValue: employee.onboardingStatus,
                    newValue: resolved.status,
                    details: `Onboarding status automatically updated from ${employee.onboardingStatus} to ${resolved.status}. Reason: ${resolved.reason}`,
                },
            });
        }
        const totalRequirements = allRequirements.length;
        const completedRequirements = allRequirements.filter((r) => r.isComplete).length;
        const pendingRequirements = totalRequirements - completedRequirements;
        return {
            employeeId: employee.id,
            status: resolved.status,
            readinessPercentage: resolved.readinessPercentage,
            summary: {
                totalRequirements,
                completedRequirements,
                pendingRequirements,
                overdueRequirements: resolved.overdueCount,
                blockedRequirements: resolved.blockedCount,
            },
            categories,
            issues,
        };
    }
    async getComplianceSummary() {
        const employees = await this.prisma.employee.findMany({
            include: {
                documents: true,
                verifications: true,
                tasks: true,
                assets: true,
                checklist: true,
            },
        });
        let readyCount = 0;
        let partiallyReadyCount = 0;
        let delayedCount = 0;
        let blockedCount = 0;
        let pendingDocuments = 0;
        let pendingVerifications = 0;
        let pendingTasks = 0;
        let pendingAssets = 0;
        for (const emp of employees) {
            const docReqs = document_readiness_evaluator_1.DocumentReadinessEvaluator.evaluate(emp.documents || []);
            const verifReqs = verification_readiness_evaluator_1.VerificationReadinessEvaluator.evaluate(emp.verifications || []);
            const taskReqs = task_readiness_evaluator_1.TaskReadinessEvaluator.evaluate(emp.tasks || []);
            const assetReqs = asset_readiness_evaluator_1.AssetReadinessEvaluator.evaluate(emp.assets || []);
            const checklistReqs = checklist_readiness_evaluator_1.ChecklistReadinessEvaluator.evaluate(emp.checklist || []);
            const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
            const res = status_resolver_1.StatusResolver.resolveStatus(all);
            if (res.status === client_1.OnboardingStatus.READY)
                readyCount++;
            else if (res.status === client_1.OnboardingStatus.PARTIALLY_READY)
                partiallyReadyCount++;
            else if (res.status === client_1.OnboardingStatus.DELAYED)
                delayedCount++;
            else if (res.status === client_1.OnboardingStatus.BLOCKED)
                blockedCount++;
            pendingDocuments += docReqs.filter((r) => !r.isComplete).length;
            pendingVerifications += verifReqs.filter((r) => !r.isComplete).length;
            pendingTasks += taskReqs.filter((r) => !r.isComplete).length;
            pendingAssets += assetReqs.filter((r) => !r.isComplete).length;
        }
        return {
            totalUpcomingJoiners: employees.length,
            readyCount,
            partiallyReadyCount,
            delayedCount,
            blockedCount,
            pendingDocuments,
            pendingVerifications,
            pendingTasks,
            pendingAssets,
        };
    }
    async getUpcomingJoiners(query) {
        const where = {};
        if (query?.status) {
            where.onboardingStatus = query.status;
        }
        if (query?.department) {
            where.department = { equals: query.department, mode: 'insensitive' };
        }
        if (query?.search) {
            const s = query.search;
            where.OR = [
                { firstName: { contains: s, mode: 'insensitive' } },
                { lastName: { contains: s, mode: 'insensitive' } },
                { employeeId: { contains: s, mode: 'insensitive' } },
                { department: { contains: s, mode: 'insensitive' } },
                { designation: { contains: s, mode: 'insensitive' } },
            ];
        }
        const employees = await this.prisma.employee.findMany({
            where,
            include: {
                documents: true,
                verifications: true,
                tasks: true,
                assets: true,
                checklist: true,
            },
            orderBy: { joiningDate: 'asc' },
        });
        const results = [];
        for (const emp of employees) {
            const docReqs = document_readiness_evaluator_1.DocumentReadinessEvaluator.evaluate(emp.documents || []);
            const verifReqs = verification_readiness_evaluator_1.VerificationReadinessEvaluator.evaluate(emp.verifications || []);
            const taskReqs = task_readiness_evaluator_1.TaskReadinessEvaluator.evaluate(emp.tasks || []);
            const assetReqs = asset_readiness_evaluator_1.AssetReadinessEvaluator.evaluate(emp.assets || []);
            const checklistReqs = checklist_readiness_evaluator_1.ChecklistReadinessEvaluator.evaluate(emp.checklist || []);
            const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
            const res = status_resolver_1.StatusResolver.resolveStatus(all);
            const criticalIssues = all.filter((r) => r.isBlocked || r.isOverdue).length;
            results.push({
                id: emp.id,
                employeeId: emp.employeeId,
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                department: emp.department,
                designation: emp.designation,
                joiningDate: emp.joiningDate,
                status: res.status,
                readinessPercentage: res.readinessPercentage,
                criticalIssues,
            });
        }
        return results;
    }
};
exports.OnboardingReadinessService = OnboardingReadinessService;
exports.OnboardingReadinessService = OnboardingReadinessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OnboardingReadinessService);
//# sourceMappingURL=readiness.service.js.map