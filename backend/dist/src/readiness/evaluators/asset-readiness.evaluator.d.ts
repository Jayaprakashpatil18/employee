import { EmployeeAsset } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';
export declare class AssetReadinessEvaluator {
    static evaluate(assets: EmployeeAsset[]): EvaluatedRequirement[];
}
