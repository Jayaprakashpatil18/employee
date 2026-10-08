import { JoiningChecklistItem } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';
export declare class ChecklistReadinessEvaluator {
    static evaluate(items: JoiningChecklistItem[]): EvaluatedRequirement[];
}
