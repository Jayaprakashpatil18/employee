"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentReadinessEvaluator = void 0;
const client_1 = require("@prisma/client");
class DocumentReadinessEvaluator {
    static evaluate(documents) {
        return documents.map((doc) => {
            const isMandatory = doc.isRequired !== undefined ? doc.isRequired : true;
            const isVerified = doc.verificationStatus === client_1.DocumentVerificationStatus.VERIFIED;
            const isRejected = doc.verificationStatus === client_1.DocumentVerificationStatus.REJECTED ||
                doc.verificationStatus === client_1.DocumentVerificationStatus.RESUBMISSION_REQUIRED;
            const isBlocked = isMandatory && isRejected;
            let reason;
            if (isRejected) {
                reason = doc.rejectionReason
                    ? `Document '${doc.documentType}' rejected: ${doc.rejectionReason}`
                    : `Document '${doc.documentType}' requires resubmission or was rejected`;
            }
            else if (!isVerified) {
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
exports.DocumentReadinessEvaluator = DocumentReadinessEvaluator;
//# sourceMappingURL=document-readiness.evaluator.js.map