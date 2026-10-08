import { DepartmentTask } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';
export declare class TaskReadinessEvaluator {
    static evaluate(tasks: DepartmentTask[], currentDate?: Date): EvaluatedRequirement[];
}
