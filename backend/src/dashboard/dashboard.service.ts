import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingReadinessService } from '../readiness/readiness.service';
import { OnboardingStatus } from '@prisma/client';
import { StatusResolver } from '../readiness/status-resolver';
import { DocumentReadinessEvaluator } from '../readiness/evaluators/document-readiness.evaluator';
import { VerificationReadinessEvaluator } from '../readiness/evaluators/verification-readiness.evaluator';
import { TaskReadinessEvaluator } from '../readiness/evaluators/task-readiness.evaluator';
import { AssetReadinessEvaluator } from '../readiness/evaluators/asset-readiness.evaluator';
import { ChecklistReadinessEvaluator } from '../readiness/evaluators/checklist-readiness.evaluator';

export interface DashboardFilterDto {
  dateRange?: 'TODAY' | '7_DAYS' | '14_DAYS' | '30_DAYS' | 'ALL';
  department?: string;
  location?: string;
  employmentType?: string;
  designation?: string;
  status?: OnboardingStatus | 'ALL';
  search?: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readinessService: OnboardingReadinessService,
  ) {}

  private buildWhereClause(query?: DashboardFilterDto) {
    const where: any = {};

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
      } else if (query.dateRange === '7_DAYS') {
        targetEnd.setDate(now.getDate() + 7);
      } else if (query.dateRange === '14_DAYS') {
        targetEnd.setDate(now.getDate() + 14);
      } else if (query.dateRange === '30_DAYS') {
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

  async getSummary(query?: DashboardFilterDto) {
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
      const docReqs = DocumentReadinessEvaluator.evaluate(emp.documents || []);
      const verifReqs = VerificationReadinessEvaluator.evaluate(emp.verifications || []);
      const taskReqs = TaskReadinessEvaluator.evaluate(emp.tasks || []);
      const assetReqs = AssetReadinessEvaluator.evaluate(emp.assets || []);
      const checklistReqs = ChecklistReadinessEvaluator.evaluate(emp.checklist || []);

      const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
      const res = StatusResolver.resolveStatus(all);

      if (res.status === OnboardingStatus.READY) ready++;
      else if (res.status === OnboardingStatus.PARTIALLY_READY) partiallyReady++;
      else if (res.status === OnboardingStatus.DELAYED) delayed++;
      else if (res.status === OnboardingStatus.BLOCKED) blocked++;

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

  async getAnalytics(query?: DashboardFilterDto) {
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

    const deptMap: Map<string, { total: number; ready: number; delayed: number; blocked: number }> = new Map();
    const locMap: Map<string, { total: number; ready: number; delayed: number; blocked: number }> = new Map();

    for (const emp of employees) {
      const docReqs = DocumentReadinessEvaluator.evaluate(emp.documents || []);
      const verifReqs = VerificationReadinessEvaluator.evaluate(emp.verifications || []);
      const taskReqs = TaskReadinessEvaluator.evaluate(emp.tasks || []);
      const assetReqs = AssetReadinessEvaluator.evaluate(emp.assets || []);
      const checklistReqs = ChecklistReadinessEvaluator.evaluate(emp.checklist || []);

      const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
      const res = StatusResolver.resolveStatus(all);

      statusCounts[res.status]++;

      // Department aggregate
      const dept = emp.department || 'Other';
      const dData = deptMap.get(dept) || { total: 0, ready: 0, delayed: 0, blocked: 0 };
      dData.total++;
      if (res.status === OnboardingStatus.READY) dData.ready++;
      if (res.status === OnboardingStatus.DELAYED) dData.delayed++;
      if (res.status === OnboardingStatus.BLOCKED) dData.blocked++;
      deptMap.set(dept, dData);

      // Location aggregate
      const loc = emp.location || 'Remote';
      const lData = locMap.get(loc) || { total: 0, ready: 0, delayed: 0, blocked: 0 };
      lData.total++;
      if (res.status === OnboardingStatus.READY) lData.ready++;
      if (res.status === OnboardingStatus.DELAYED) lData.delayed++;
      if (res.status === OnboardingStatus.BLOCKED) lData.blocked++;
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

  async getAttentionRequired(query?: DashboardFilterDto) {
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

    const attentionList: any[] = [];

    for (const emp of employees) {
      const docReqs = DocumentReadinessEvaluator.evaluate(emp.documents || []);
      const verifReqs = VerificationReadinessEvaluator.evaluate(emp.verifications || []);
      const taskReqs = TaskReadinessEvaluator.evaluate(emp.tasks || []);
      const assetReqs = AssetReadinessEvaluator.evaluate(emp.assets || []);
      const checklistReqs = ChecklistReadinessEvaluator.evaluate(emp.checklist || []);

      const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
      const res = StatusResolver.resolveStatus(all);

      if (res.status === OnboardingStatus.BLOCKED || res.status === OnboardingStatus.DELAYED || res.blockedCount > 0 || res.overdueCount > 0) {
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

    // Sort by precedence: BLOCKED first, then DELAYED, then by closest joining date
    attentionList.sort((a, b) => {
      if (a.status === 'BLOCKED' && b.status !== 'BLOCKED') return -1;
      if (a.status !== 'BLOCKED' && b.status === 'BLOCKED') return 1;
      return new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
    });

    return attentionList;
  }

  async getPendingRequirements(query?: DashboardFilterDto) {
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

    const pendingDocs: any[] = [];
    const pendingVerifs: any[] = [];
    const pendingTasksList: any[] = [];
    const pendingAssetsList: any[] = [];

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

  async getUpcomingJoiners(query?: DashboardFilterDto) {
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
      const docReqs = DocumentReadinessEvaluator.evaluate(emp.documents || []);
      const verifReqs = VerificationReadinessEvaluator.evaluate(emp.verifications || []);
      const taskReqs = TaskReadinessEvaluator.evaluate(emp.tasks || []);
      const assetReqs = AssetReadinessEvaluator.evaluate(emp.assets || []);
      const checklistReqs = ChecklistReadinessEvaluator.evaluate(emp.checklist || []);

      const all = [...docReqs, ...verifReqs, ...taskReqs, ...assetReqs, ...checklistReqs];
      const res = StatusResolver.resolveStatus(all);

      const empJoiningDate = new Date(emp.joiningDate);
      empJoiningDate.setHours(0, 0, 0, 0);

      const diffTime = empJoiningDate.getTime() - currentDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let joiningUrgency = '';
      if (diffDays === 0) joiningUrgency = 'Joining Today';
      else if (diffDays === 1) joiningUrgency = 'Joining Tomorrow';
      else if (diffDays > 1) joiningUrgency = `In ${diffDays} Days`;
      else if (diffDays === -1) joiningUrgency = 'Joined Yesterday';
      else joiningUrgency = `${Math.abs(diffDays)} Days Ago`;

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
}
