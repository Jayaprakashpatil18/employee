"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationReadinessEvaluator = void 0;
const client_1 = require("@prisma/client");
class VerificationReadinessEvaluator {
    static evaluate(verifications) {
        return verifications.map((v) => {
            const isMandatory = v.isMandatory !== undefined ? v.isMandatory : true;
            const isComplete = v.status === client_1.VerificationStatus.COMPLETED && v.result === client_1.VerificationResult.CLEAR;
            const isFailed = v.result === client_1.VerificationResult.FAILED;
            const isNeedsReview = v.result === client_1.VerificationResult.NEEDS_REVIEW;
            const isBlocked = isMandatory && isFailed;
            let reason;
            if (isFailed) {
                reason = v.remarks
                    ? `Background verification '${v.verificationType}' failed: ${v.remarks}`
                    : `Background verification '${v.verificationType}' failed`;
            }
            else if (isNeedsReview) {
                reason = `Background verification '${v.verificationType}' needs HR review`;
            }
            else if (!isComplete) {
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
exports.VerificationReadinessEvaluator = VerificationReadinessEvaluator;
//# sourceMappingURL=verification-readiness.evaluator.js.map