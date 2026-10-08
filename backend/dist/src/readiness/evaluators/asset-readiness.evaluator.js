"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetReadinessEvaluator = void 0;
const client_1 = require("@prisma/client");
class AssetReadinessEvaluator {
    static evaluate(assets) {
        return assets.map((a) => {
            const isMandatory = a.isMandatory !== undefined ? a.isMandatory : true;
            const isComplete = a.status === client_1.AssetStatus.READY || a.status === client_1.AssetStatus.ASSIGNED;
            const isAssetBlocked = a.status === client_1.AssetStatus.BLOCKED;
            const isBlocked = isMandatory && isAssetBlocked;
            let reason;
            if (isAssetBlocked) {
                reason = a.remarks
                    ? `Asset '${a.assetName}' provisioning blocked: ${a.remarks}`
                    : `Asset '${a.assetName}' provisioning blocked`;
            }
            else if (!isComplete) {
                reason = `Asset '${a.assetName}' is not ready (status: ${a.status})`;
            }
            return {
                category: 'ASSET',
                name: a.assetName,
                mandatory: isMandatory,
                status: a.status,
                isComplete,
                isOverdue: false,
                isBlocked,
                reason,
                severity: isBlocked ? 'CRITICAL' : !isComplete ? 'MEDIUM' : 'LOW',
            };
        });
    }
}
exports.AssetReadinessEvaluator = AssetReadinessEvaluator;
//# sourceMappingURL=asset-readiness.evaluator.js.map