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
exports.CandidatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const onboarding_plan_matching_service_1 = require("../onboarding-plans/onboarding-plan-matching.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let CandidatesService = class CandidatesService {
    constructor(prisma, matchingService, notificationsService) {
        this.prisma = prisma;
        this.matchingService = matchingService;
        this.notificationsService = notificationsService;
    }
    async create(dto, currentUserId) {
        const existing = await this.prisma.candidate.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Candidate with email '${dto.email}' already exists.`);
        }
        const candidate = await this.prisma.candidate.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                designation: dto.designation,
                department: dto.department,
                location: dto.location || 'Remote',
                employmentType: dto.employmentType || 'Full Time',
                expectedJoiningDate: new Date(dto.expectedJoiningDate),
                status: dto.status || client_1.CandidateStatus.ACTIVE,
                createdById: currentUserId,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUserId,
                action: 'CANDIDATE_CREATED',
                entity: 'Candidate',
                entityType: 'Candidate',
                entityId: candidate.id,
                newValue: JSON.stringify(candidate),
                details: `Created candidate ${candidate.firstName} ${candidate.lastName}`,
            },
        });
        return candidate;
    }
    async findAll(query) {
        const where = {};
        if (query?.status) {
            where.status = query.status;
        }
        if (query?.department) {
            where.department = { equals: query.department, mode: 'insensitive' };
        }
        if (query?.location) {
            where.location = { equals: query.location, mode: 'insensitive' };
        }
        if (query?.employmentType) {
            where.employmentType = { equals: query.employmentType, mode: 'insensitive' };
        }
        if (query?.search) {
            const s = query.search;
            where.OR = [
                { firstName: { contains: s, mode: 'insensitive' } },
                { lastName: { contains: s, mode: 'insensitive' } },
                { email: { contains: s, mode: 'insensitive' } },
                { designation: { contains: s, mode: 'insensitive' } },
                { department: { contains: s, mode: 'insensitive' } },
            ];
        }
        return this.prisma.candidate.findMany({
            where,
            include: {
                createdBy: true,
                employee: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                createdBy: true,
                employee: {
                    include: {
                        onboardingPlan: true,
                        documents: true,
                        verifications: true,
                        tasks: true,
                        assets: true,
                        checklist: true,
                    },
                },
            },
        });
        if (!candidate) {
            throw new common_1.NotFoundException(`Candidate with ID '${id}' not found`);
        }
        return candidate;
    }
    async update(id, dto, currentUserId) {
        const candidate = await this.findOne(id);
        const updated = await this.prisma.candidate.update({
            where: { id },
            data: {
                ...(dto.firstName ? { firstName: dto.firstName } : {}),
                ...(dto.lastName ? { lastName: dto.lastName } : {}),
                ...(dto.email ? { email: dto.email } : {}),
                ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
                ...(dto.designation ? { designation: dto.designation } : {}),
                ...(dto.department ? { department: dto.department } : {}),
                ...(dto.location ? { location: dto.location } : {}),
                ...(dto.employmentType ? { employmentType: dto.employmentType } : {}),
                ...(dto.expectedJoiningDate ? { expectedJoiningDate: new Date(dto.expectedJoiningDate) } : {}),
                ...(dto.status ? { status: dto.status } : {}),
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUserId,
                action: 'CANDIDATE_UPDATED',
                entity: 'Candidate',
                entityType: 'Candidate',
                entityId: id,
                oldValue: JSON.stringify(candidate),
                newValue: JSON.stringify(updated),
                details: `Updated candidate details for ${updated.firstName} ${updated.lastName}`,
            },
        });
        return updated;
    }
    async convertCandidateToEmployee(candidateId, currentUserId) {
        const candidate = await this.findOne(candidateId);
        if (candidate.status === client_1.CandidateStatus.CONVERTED) {
            throw new common_1.BadRequestException(`Candidate '${candidate.firstName} ${candidate.lastName}' has already been converted to an employee.`);
        }
        const matchingPlan = await this.matchingService.findMatchingPlan({
            department: candidate.department,
            designation: candidate.designation,
            location: candidate.location,
            employmentType: candidate.employmentType,
        });
        return this.prisma.$transaction(async (tx) => {
            const employeeCount = await tx.employee.count();
            const employeeCode = `EMP-${new Date().getFullYear()}-${String(employeeCount + 1).padStart(4, '0')}`;
            const employee = await tx.employee.create({
                data: {
                    candidateId: candidate.id,
                    employeeId: employeeCode,
                    firstName: candidate.firstName,
                    lastName: candidate.lastName,
                    email: candidate.email,
                    phone: candidate.phone,
                    department: candidate.department,
                    designation: candidate.designation,
                    location: candidate.location,
                    employmentType: candidate.employmentType,
                    joiningDate: candidate.expectedJoiningDate,
                    onboardingStatus: 'READY',
                    onboardingPlanId: matchingPlan.id,
                },
            });
            const documentPromises = matchingPlan.documentRequirements.map((req) => tx.employeeDocument.create({
                data: {
                    employeeId: employee.id,
                    documentType: req.documentType,
                    documentName: `${req.documentType} Document`,
                    isRequired: req.isRequired !== undefined ? req.isRequired : true,
                    submissionStatus: 'NOT_SUBMITTED',
                    verificationStatus: 'PENDING',
                },
            }));
            const verificationReqs = matchingPlan.documentRequirements.filter((req) => req.verificationRequired);
            const verificationPromises = verificationReqs.map((req) => tx.backgroundVerification.create({
                data: {
                    employeeId: employee.id,
                    verificationType: `${req.documentType} Verification`,
                    isMandatory: req.isRequired !== undefined ? req.isRequired : true,
                    status: 'REQUESTED',
                },
            }));
            const taskPromises = matchingPlan.taskRequirements.map((req) => {
                const dueDate = new Date(candidate.expectedJoiningDate);
                dueDate.setDate(dueDate.getDate() + req.dueDaysFromJoining);
                return tx.departmentTask.create({
                    data: {
                        employeeId: employee.id,
                        title: req.title,
                        description: req.description,
                        assignedDepartment: req.assignedDepartment,
                        isMandatory: req.isMandatory,
                        status: 'TODO',
                        dueDate,
                    },
                });
            });
            const assetPromises = matchingPlan.assetRequirements.map((req) => tx.employeeAsset.create({
                data: {
                    employeeId: employee.id,
                    assetName: req.assetType,
                    assetType: req.assetType,
                    isMandatory: req.isMandatory,
                    status: 'REQUESTED',
                },
            }));
            const checklistPromises = matchingPlan.checklistRequirements.map((req) => tx.joiningChecklistItem.create({
                data: {
                    employeeId: employee.id,
                    title: req.title,
                    item: req.title,
                    category: req.category || 'GENERAL',
                    isMandatory: req.isMandatory,
                    isCompleted: false,
                },
            }));
            const [documents, verifications, tasks, assets, checklist] = await Promise.all([
                Promise.all(documentPromises),
                Promise.all(verificationPromises),
                Promise.all(taskPromises),
                Promise.all(assetPromises),
                Promise.all(checklistPromises),
            ]);
            await tx.candidate.update({
                where: { id: candidate.id },
                data: { status: client_1.CandidateStatus.CONVERTED },
            });
            await tx.auditLog.create({
                data: {
                    userId: currentUserId,
                    employeeId: employee.id,
                    action: 'EMPLOYEE_CREATED_FROM_CANDIDATE',
                    entity: 'Employee',
                    entityType: 'Candidate',
                    entityId: candidate.id,
                    oldValue: client_1.CandidateStatus.SELECTED,
                    newValue: client_1.CandidateStatus.CONVERTED,
                    details: `Candidate ${candidate.firstName} ${candidate.lastName} converted to Employee ${employeeCode} with plan '${matchingPlan.title}'.`,
                },
            });
            await this.notificationsService.createNotification({
                recipientUserId: currentUserId,
                employeeId: employee.id,
                candidateId: candidate.id,
                type: 'ONBOARDING_CREATED',
                channel: 'IN_APP',
                title: `Onboarding Initialized: ${employee.firstName} ${employee.lastName}`,
                message: `Candidate ${employee.firstName} ${employee.lastName} was converted to Employee (${employeeCode}). Plan '${matchingPlan.title}' assigned.`,
                priority: 'MEDIUM',
                relatedEntityType: 'Employee',
                relatedEntityId: employee.id,
            }).catch(() => null);
            return {
                success: true,
                message: 'Candidate converted to employee successfully',
                employeeCode,
                employee,
                onboardingPlan: matchingPlan,
                requirementsGenerated: {
                    documentsCount: documents.length,
                    verificationsCount: verifications.length,
                    tasksCount: tasks.length,
                    assetsCount: assets.length,
                    checklistCount: checklist.length,
                },
            };
        });
    }
};
exports.CandidatesService = CandidatesService;
exports.CandidatesService = CandidatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        onboarding_plan_matching_service_1.OnboardingPlanMatchingService,
        notifications_service_1.NotificationsService])
], CandidatesService);
//# sourceMappingURL=candidates.service.js.map