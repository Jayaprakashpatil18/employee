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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const readiness_service_1 = require("../readiness/readiness.service");
const client_1 = require("@prisma/client");
const status_resolver_1 = require("../readiness/status-resolver");
const document_readiness_evaluator_1 = require("../readiness/evaluators/document-readiness.evaluator");
const verification_readiness_evaluator_1 = require("../readiness/evaluators/verification-readiness.evaluator");
const task_readiness_evaluator_1 = require("../readiness/evaluators/task-readiness.evaluator");
const asset_readiness_evaluator_1 = require("../readiness/evaluators/asset-readiness.evaluator");
const checklist_readiness_evaluator_1 = require("../readiness/evaluators/checklist-readiness.evaluator");
let DashboardService = class DashboardService {
    constructor(prisma, readinessService) {
        this.prisma = prisma;
        this.readinessService = readinessService;
    }
    buildWhereClause(query) {
        const where = {};
        if (query?.department && query.department !== 'ALL') {
            where.department = { equals: query.department, mode: 'insensitive' };
        }
        if (query?.location && query.location !== 'ALL') {
            where.location = { equals: query.location, mode: 'insensitive' };
        }
        if (query?.employmentType && query.employmentType !== 'ALL') {
            where.employmentType = { equals: query.employmentType, mode: 'insensitive' };
        }
        if (query?.designation && query.designation !== 'ALL') {
            where.designation = { equals: query.designation, mode: 'insensitive' };
        }
        if (query?.status && query.status !== 'ALL') {
            where.onboardingStatus = query.status;
        }
        if (query?.dateRange && query.dateRange !== 'ALL') {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const targetEnd = new Date(now);
            if (query.dateRange === 'TODAY') {
                targetEnd.setDate(now.getDate() + 1);
            }
            else if (query.dateRange === '7_DAYS') {
                targetEnd.setDate(now.getDate() + 7);
            }
            else if (query.dateRange === '14_DAYS') {
                targetEnd.setDate(now.getDate() + 14);
            }
            else if (query.dateRange === '30_DAYS') {
                targetEnd.setDate(now.getDate() + 30);
            }
            where.joiningDate = {
                gte: now,
                lt: targetEnd,
            };
        }
        if (query?.search) {
            const s = query.search;
            where.OR = [
                { firstName: { contains: s, mode: 'insensitive' } },
                { lastName: { contains: s, mode: 'insensitive' } },
                { email: { contains: s, mode: 'insensitive' } },
                { employeeId: { contains: s, mode: 'insensitive' } },
                { designation: { contains: s, mode: 'insensitive' } },
                { department: { contains: s, mode: 'insensitive' } },
            ];
        }
        return where;
    }
    async getSummary(query) {
        const where = this.buildWhereClause(query);
        const employees = await this.prisma.employee.findMany({
            where,
            include: {
                documents: true,
                verifications: true,
                tasks: true,
                assets: true,
                checklist: true,
            },
        });
        let ready = 0;
        let partiallyReady = 0;
        let delayed = 0;
        let blocked = 0;
        let pendingDocuments = 0;
        let pendingVerification = 0;
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
                ready++;
            else if (res.status === client_1.OnboardingStatus.PARTIALLY_READY)
                partiallyReady++;
            else if (res.status === client_1.OnboardingStatus.DELAYED)
                delayed++;
            else if (res.status === client_1.OnboardingStatus.BLOCKED)
                blocked++;
            pendingDocuments += docReqs.filter((r) => !r.isComplete).length;
            pendingVerification += verifReqs.filter((r) => !r.isComplete).length;
            pendingTasks += taskReqs.filter((r) => !r.isComplete).length;
            pendingAssets += assetReqs.filter((r) => !r.isComplete).length;
        }
        return {
            upcomingJoiners: employees.length,
            ready,
            partiallyReady,
            delayed,
            blocked,
            pendingDocuments,
            pendingVerification,
            pendingTasks,
            pendingAssets,
        };
    }
    async getAnalytics(query) {
        const where = this.buildWhereClause(query);
        const employees = await this.prisma.employee.findMany({
            where,
            include: {
                documents: true,
                verifications: true,
                tasks: true,
                assets: true,
                checklist: true,
            },
        });
        const statusCounts = {
            READY: 0,
            PARTIALLY_READY: 0,
            DELAYED: 0,
            BLOCKED: 0,
        };
        const deptMap = new Map();
        const locMap = new Map();
        for (const emp of employees) {
            const docReqs = document_readiness_evaluator_1.DocumentReadinessEvaluator.evaluate(emp.documents || []);
            const verifReqs = verification_readiness_evaluator_1.VerificationReadinessEvaluator.evaluate(emp.verifications || []);
            const taskReqs = task_readiness_evaluator_1.TaskReadinessEvaluator.evaluate(emp.tasks || []);
            const assetReqs = asset_readiness_evaluator_1.AssetReadinessEvaluator.evaluate(emp.assets || []);
            const checklistReqs = checklist_readiness_evaluator_1.ChecklistReadinessEvaluator.evaluate(emp.checklist || []);
            const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
            const res = status_resolver_1.StatusResolver.resolveStatus(all);
            statusCounts[res.status]++;
            const dept = emp.department || 'Other';
            const dData = deptMap.get(dept) || { total: 0, ready: 0, delayed: 0, blocked: 0 };
            dData.total++;
            if (res.status === client_1.OnboardingStatus.READY)
                dData.ready++;
            if (res.status === client_1.OnboardingStatus.DELAYED)
                dData.delayed++;
            if (res.status === client_1.OnboardingStatus.BLOCKED)
                dData.blocked++;
            deptMap.set(dept, dData);
            const loc = emp.location || 'Remote';
            const lData = locMap.get(loc) || { total: 0, ready: 0, delayed: 0, blocked: 0 };
            lData.total++;
            if (res.status === client_1.OnboardingStatus.READY)
                lData.ready++;
            if (res.status === client_1.OnboardingStatus.DELAYED)
                lData.delayed++;
            if (res.status === client_1.OnboardingStatus.BLOCKED)
                lData.blocked++;
            locMap.set(loc, lData);
        }
        const readinessDistribution = [
            { name: 'READY', count: statusCounts.READY, color: '#10B981' },
            { name: 'PARTIALLY READY', count: statusCounts.PARTIALLY_READY, color: '#3B82F6' },
            { name: 'DELAYED', count: statusCounts.DELAYED, color: '#F59E0B' },
            { name: 'BLOCKED', count: statusCounts.BLOCKED, color: '#EF4444' },
        ];
        const departmentOverview = Array.from(deptMap.entries()).map(([department, data]) => ({
            department,
            totalEmployees: data.total,
            readyCount: data.ready,
            delayedCount: data.delayed,
            blockedCount: data.blocked,
        }));
        const locationOverview = Array.from(locMap.entries()).map(([location, data]) => ({
            location,
            totalEmployees: data.total,
            readyCount: data.ready,
            delayedCount: data.delayed,
            blockedCount: data.blocked,
        }));
        return {
            readinessDistribution,
            departmentOverview,
            locationOverview,
        };
    }
    async getAttentionRequired(query) {
        const where = this.buildWhereClause(query);
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
        const attentionList = [];
        for (const emp of employees) {
            const docReqs = document_readiness_evaluator_1.DocumentReadinessEvaluator.evaluate(emp.documents || []);
            const verifReqs = verification_readiness_evaluator_1.VerificationReadinessEvaluator.evaluate(emp.verifications || []);
            const taskReqs = task_readiness_evaluator_1.TaskReadinessEvaluator.evaluate(emp.tasks || []);
            const assetReqs = asset_readiness_evaluator_1.AssetReadinessEvaluator.evaluate(emp.assets || []);
            const checklistReqs = checklist_readiness_evaluator_1.ChecklistReadinessEvaluator.evaluate(emp.checklist || []);
            const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
            const res = status_resolver_1.StatusResolver.resolveStatus(all);
            if (res.status === client_1.OnboardingStatus.BLOCKED || res.status === client_1.OnboardingStatus.DELAYED || res.blockedCount > 0 || res.overdueCount > 0) {
                const issues = all.filter((r) => r.isBlocked || r.isOverdue || r.status === 'REJECTED' || r.status === 'NEEDS_REVIEW');
                attentionList.push({
                    id: emp.id,
                    employeeId: emp.employeeId,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    department: emp.department,
                    designation: emp.designation,
                    joiningDate: emp.joiningDate,
                    status: res.status,
                    readinessPercentage: res.readinessPercentage,
                    reason: res.reason,
                    issues: issues.map((i) => ({ category: i.category, name: i.name, reason: i.reason, severity: i.severity })),
                });
            }
        }
        attentionList.sort((a, b) => {
            if (a.status === 'BLOCKED' && b.status !== 'BLOCKED')
                return -1;
            if (a.status !== 'BLOCKED' && b.status === 'BLOCKED')
                return 1;
            return new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
        });
        return attentionList;
    }
    async getPendingRequirements(query) {
        const where = this.buildWhereClause(query);
        const employees = await this.prisma.employee.findMany({
            where,
            include: {
                documents: true,
                verifications: true,
                tasks: true,
                assets: true,
            },
        });
        const pendingDocs = [];
        const pendingVerifs = [];
        const pendingTasksList = [];
        const pendingAssetsList = [];
        for (const emp of employees) {
            (emp.documents || []).forEach((d) => {
                if (d.verificationStatus !== 'VERIFIED') {
                    pendingDocs.push({
                        id: d.id,
                        employeeId: emp.id,
                        employeeName: `${emp.firstName} ${emp.lastName}`,
                        employeeCode: emp.employeeId,
                        documentType: d.documentType,
                        submissionStatus: d.submissionStatus,
                        verificationStatus: d.verificationStatus,
                        joiningDate: emp.joiningDate,
                    });
                }
            });
            (emp.verifications || []).forEach((v) => {
                if (v.status !== 'COMPLETED' || v.result !== 'CLEAR') {
                    pendingVerifs.push({
                        id: v.id,
                        employeeId: emp.id,
                        employeeName: `${emp.firstName} ${emp.lastName}`,
                        employeeCode: emp.employeeId,
                        verificationType: v.verificationType,
                        status: v.status,
                        result: v.result || 'Pending',
                        joiningDate: emp.joiningDate,
                    });
                }
            });
            (emp.tasks || []).forEach((t) => {
                if (t.status !== 'COMPLETED') {
                    const isOverdue = t.dueDate ? new Date(t.dueDate) < new Date() : false;
                    pendingTasksList.push({
                        id: t.id,
                        employeeId: emp.id,
                        employeeName: `${emp.firstName} ${emp.lastName}`,
                        employeeCode: emp.employeeId,
                        title: t.title,
                        department: t.assignedDepartment,
                        status: isOverdue ? 'OVERDUE' : t.status,
                        priority: t.priority || 'MEDIUM',
                        dueDate: t.dueDate,
                        joiningDate: emp.joiningDate,
                    });
                }
            });
            (emp.assets || []).forEach((a) => {
                if (a.status !== 'READY' && a.status !== 'ASSIGNED') {
                    pendingAssetsList.push({
                        id: a.id,
                        employeeId: emp.id,
                        employeeName: `${emp.firstName} ${emp.lastName}`,
                        employeeCode: emp.employeeId,
                        assetName: a.assetName,
                        assetType: a.assetType,
                        status: a.status,
                        joiningDate: emp.joiningDate,
                    });
                }
            });
        }
        return {
            pendingDocuments: pendingDocs,
            pendingVerifications: pendingVerifs,
            pendingTasks: pendingTasksList,
            pendingAssets: pendingAssetsList,
        };
    }
    async getUpcomingJoiners(query) {
        const where = this.buildWhereClause(query);
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
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const joiners = [];
        for (const emp of employees) {
            const docReqs = document_readiness_evaluator_1.DocumentReadinessEvaluator.evaluate(emp.documents || []);
            const verifReqs = verification_readiness_evaluator_1.VerificationReadinessEvaluator.evaluate(emp.verifications || []);
            const taskReqs = task_readiness_evaluator_1.TaskReadinessEvaluator.evaluate(emp.tasks || []);
            const assetReqs = asset_readiness_evaluator_1.AssetReadinessEvaluator.evaluate(emp.assets || []);
            const checklistReqs = checklist_readiness_evaluator_1.ChecklistReadinessEvaluator.evaluate(emp.checklist || []);
            const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
            const res = status_resolver_1.StatusResolver.resolveStatus(all);
            const empJoiningDate = new Date(emp.joiningDate);
            empJoiningDate.setHours(0, 0, 0, 0);
            const diffTime = empJoiningDate.getTime() - currentDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            let joiningUrgency = '';
            if (diffDays === 0)
                joiningUrgency = 'Joining Today';
            else if (diffDays === 1)
                joiningUrgency = 'Joining Tomorrow';
            else if (diffDays > 1)
                joiningUrgency = `In ${diffDays} Days`;
            else if (diffDays === -1)
                joiningUrgency = 'Joined Yesterday';
            else
                joiningUrgency = `${Math.abs(diffDays)} Days Ago`;
            const criticalIssues = all.filter((r) => r.isBlocked || r.isOverdue).length;
            joiners.push({
                id: emp.id,
                employeeId: emp.employeeId,
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                department: emp.department,
                designation: emp.designation,
                location: emp.location,
                joiningDate: emp.joiningDate,
                joiningUrgency,
                status: res.status,
                readinessPercentage: res.readinessPercentage,
                criticalIssues,
            });
        }
        return joiners;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        readiness_service_1.OnboardingReadinessService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map