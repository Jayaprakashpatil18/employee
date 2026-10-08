import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RequirementMetricsSummary {
  totalDocuments: number;
  submittedDocuments: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
  resubmissionRequiredDocuments: number;
  documentProgressPercentage: number;

  totalVerifications: number;
  completedVerifications: number;
  clearVerifications: number;
  failedVerifications: number;
  needsReviewVerifications: number;
  verificationProgressPercentage: number;

  hasBlockingFailure: boolean;
  areAllMandatoryRequirementsMet: boolean;
}

@Injectable()
export class OnboardingRequirementStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeRequirementMetrics(employeeId: string): Promise<RequirementMetricsSummary> {
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
    const resubmissionRequiredDocs = docs.filter(
      (d) => d.verificationStatus === 'RESUBMISSION_REQUIRED',
    ).length;

    const docProgress = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 100;

    const verifs = employee.verifications;
    const totalVerifs = verifs.length;
    const completedVerifs = verifs.filter((v) => v.status === 'COMPLETED').length;
    const clearVerifs = verifs.filter((v) => v.result === 'CLEAR').length;
    const failedVerifs = verifs.filter((v) => v.result === 'FAILED').length;
    const needsReviewVerifs = verifs.filter((v) => v.result === 'NEEDS_REVIEW').length;

    const verifProgress =
      totalVerifs > 0 ? Math.round((completedVerifs / totalVerifs) * 100) : 100;

    const hasBlockingFailure = failedVerifs > 0 || rejectedDocs > 0;
    const areAllMandatoryRequirementsMet =
      verifiedDocs === totalDocs && completedVerifs === totalVerifs && !hasBlockingFailure;

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
}
