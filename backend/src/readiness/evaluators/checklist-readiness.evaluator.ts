import { JoiningChecklistItem } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';

export class ChecklistReadinessEvaluator {
  static evaluate(items: JoiningChecklistItem[]): EvaluatedRequirement[] {
    return items.map((c) => {
      const title = c.title || c.item;
      const isMandatory = c.isMandatory !== undefined ? c.isMandatory : true;
      const isComplete = c.isCompleted;

      let reason: string | undefined;
      if (!isComplete) {
        reason = `Checklist item '${title}' is incomplete`;
      }

      return {
        category: 'CHECKLIST',
        name: title,
        mandatory: isMandatory,
        status: isComplete ? 'COMPLETED' : 'PENDING',
        isComplete,
        isOverdue: false,
        isBlocked: false,
        reason,
        severity: !isComplete && isMandatory ? 'MEDIUM' : 'LOW',
      };
    });
  }
}
