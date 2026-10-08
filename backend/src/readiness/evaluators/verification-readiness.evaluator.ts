import { BackgroundVerification, VerificationStatus, VerificationResult } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';

export class VerificationReadinessEvaluator {
  static evaluate(verifications: BackgroundVerification[]): EvaluatedRequirement[] {
    return verifications.map((v) => {
      const isMandatory = v.isMandatory !== undefined ? v.isMandatory : true;
      const isComplete = v.status === VerificationStatus.COMPLETED && v.result === VerificationResult.CLEAR;
      const isFailed = v.result === VerificationResult.FAILED;
      const isNeedsReview = v.result === VerificationResult.NEEDS_REVIEW;

      const isBlocked = isMandatory && isFailed;

      let reason: string | undefined;
      if (isFailed) {
        reason = v.remarks
          ? `Background verification '${v.verificationType}' failed: ${v.remarks}`
          : `Background verification '${v.verificationType}' failed`;
      } else if (isNeedsReview) {
        reason = `Background verification '${v.verificationType}' needs HR review`;
      } else if (!isComplete) {
        reason = `Background verification '${v.verificationType}' is pending (status: ${v.status})`;
      }

      return {
        category: 'VERIFICATION',
        name: v.verificationType,
        mandatory: isMandatory,
        status: v.result || v.status,
        isComplete,
        isOverdue: false,
        isBlocked,
        reason,
        severity: isBlocked ? 'CRITICAL' : isNeedsReview ? 'HIGH' : !isComplete ? 'MEDIUM' : 'LOW',
      };
    });
  }
}
