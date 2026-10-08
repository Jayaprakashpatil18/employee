import { DepartmentTask, TaskStatus } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';

export class TaskReadinessEvaluator {
  static evaluate(tasks: DepartmentTask[], currentDate = new Date()): EvaluatedRequirement[] {
    return tasks.map((t) => {
      const isMandatory = t.isMandatory !== undefined ? t.isMandatory : true;
      const isComplete = t.status === TaskStatus.COMPLETED;
      const isTaskBlocked = t.status === TaskStatus.BLOCKED;

      // Calculate dynamic overdue status: past due date and not completed
      const isOverdue = !isComplete && t.dueDate ? new Date(t.dueDate) < currentDate : false;
      const isBlocked = isMandatory && isTaskBlocked;

      let reason: string | undefined;
      if (isTaskBlocked) {
        reason = t.completionRemarks
          ? `Department task '${t.title}' is blocked: ${t.completionRemarks}`
          : `Department task '${t.title}' is blocked`;
      } else if (isOverdue) {
        reason = `Department task '${t.title}' is overdue (due date: ${new Date(t.dueDate!).toLocaleDateString()})`;
      } else if (!isComplete) {
        reason = `Department task '${t.title}' is pending (status: ${t.status})`;
      }

      return {
        category: 'TASK',
        name: t.title,
        mandatory: isMandatory,
        status: isOverdue ? 'OVERDUE' : t.status,
        isComplete,
        isOverdue,
        isBlocked,
        reason,
        severity: isBlocked ? 'CRITICAL' : isOverdue ? 'HIGH' : !isComplete ? 'MEDIUM' : 'LOW',
      };
    });
  }
}
