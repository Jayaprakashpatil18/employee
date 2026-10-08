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
exports.OnboardingRequirementStatusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OnboardingRequirementStatusService = class OnboardingRequirementStatusService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployeeRequirementMetrics(employeeId) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                documents: true,
                verifications: true,
            },
        });
        if (!employee) {
            throw new Error(`Employee with ID '${employeeId}' not found.`);
        }
        const docs = employee.documents;
        const totalDocs = docs.length;
        const submittedDocs = docs.filter((d) => d.submissionStatus === 'SUBMITTED').length;
        const verifiedDocs = docs.filter((d) => d.verificationStatus === 'VERIFIED').length;
        const rejectedDocs = docs.filter((d) => d.verificationStatus === 'REJECTED').length;
        const resubmissionRequiredDocs = docs.filter((d) => d.verificationStatus === 'RESUBMISSION_REQUIRED').length;
        const docProgress = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 100;
        const verifs = employee.verifications;
        const totalVerifs = verifs.length;
        const completedVerifs = verifs.filter((v) => v.status === 'COMPLETED').length;
        const clearVerifs = verifs.filter((v) => v.result === 'CLEAR').length;
        const failedVerifs = verifs.filter((v) => v.result === 'FAILED').length;
        const needsReviewVerifs = verifs.filter((v) => v.result === 'NEEDS_REVIEW').length;
        const verifProgress = totalVerifs > 0 ? Math.round((completedVerifs / totalVerifs) * 100) : 100;
        const hasBlockingFailure = failedVerifs > 0 || rejectedDocs > 0;
        const areAllMandatoryRequirementsMet = verifiedDocs === totalDocs && completedVerifs === totalVerifs && !hasBlockingFailure;
        return {
            totalDocuments: totalDocs,
            submittedDocuments: submittedDocs,
            verifiedDocuments: verifiedDocs,
            rejectedDocuments: rejectedDocs,
            resubmissionRequiredDocuments: resubmissionRequiredDocs,
            documentProgressPercentage: docProgress,
            totalVerifications: totalVerifs,
            completedVerifications: completedVerifs,
            clearVerifications: clearVerifs,
            failedVerifications: failedVerifs,
            needsReviewVerifications: needsReviewVerifs,
            verificationProgressPercentage: verifProgress,
            hasBlockingFailure,
            areAllMandatoryRequirementsMet,
        };
    }
};
exports.OnboardingRequirementStatusService = OnboardingRequirementStatusService;
exports.OnboardingRequirementStatusService = OnboardingRequirementStatusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OnboardingRequirementStatusService);
//# sourceMappingURL=onboarding-requirement-status.service.js.map