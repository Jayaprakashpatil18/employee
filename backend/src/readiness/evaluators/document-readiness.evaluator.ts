import { EmployeeDocument, DocumentVerificationStatus } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';

export class DocumentReadinessEvaluator {
  static evaluate(documents: EmployeeDocument[]): EvaluatedRequirement[] {
    return documents.map((doc) => {
      const isMandatory = doc.isRequired !== undefined ? doc.isRequired : true;
      const isVerified = doc.verificationStatus === DocumentVerificationStatus.VERIFIED;
      const isRejected =
        doc.verificationStatus === DocumentVerificationStatus.REJECTED ||
        doc.verificationStatus === DocumentVerificationStatus.RESUBMISSION_REQUIRED;

      const isBlocked = isMandatory && isRejected;

      let reason: string | undefined;
      if (isRejected) {
        reason = doc.rejectionReason
          ? `Document '${doc.documentType}' rejected: ${doc.rejectionReason}`
          : `Document '${doc.documentType}' requires resubmission or was rejected`;
      } else if (!isVerified) {
        reason = `Document '${doc.documentType}' is not verified (status: ${doc.verificationStatus})`;
      }

      return {
        category: 'DOCUMENT',
        name: doc.documentType,
        mandatory: isMandatory,
        status: doc.verificationStatus,
        isComplete: isVerified,
        isOverdue: false,
        isBlocked,
        reason,
        severity: isBlocked ? 'CRITICAL' : !isVerified ? 'HIGH' : 'LOW',
      };
    });
  }
}
