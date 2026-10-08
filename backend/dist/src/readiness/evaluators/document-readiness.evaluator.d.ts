import { EmployeeDocument } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';
export declare class DocumentReadinessEvaluator {
    static evaluate(documents: EmployeeDocument[]): EvaluatedRequirement[];
}
