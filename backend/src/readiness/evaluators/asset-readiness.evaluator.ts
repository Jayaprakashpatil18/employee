import { EmployeeAsset, AssetStatus } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';

export class AssetReadinessEvaluator {
  static evaluate(assets: EmployeeAsset[]): EvaluatedRequirement[] {
    return assets.map((a) => {
      const isMandatory = a.isMandatory !== undefined ? a.isMandatory : true;
      const isComplete = a.status === AssetStatus.READY || a.status === AssetStatus.ASSIGNED;
      const isAssetBlocked = a.status === AssetStatus.BLOCKED;

      const isBlocked = isMandatory && isAssetBlocked;

      let reason: string | undefined;
      if (isAssetBlocked) {
        reason = a.remarks
          ? `Asset '${a.assetName}' provisioning blocked: ${a.remarks}`
          : `Asset '${a.assetName}' provisioning blocked`;
      } else if (!isComplete) {
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
