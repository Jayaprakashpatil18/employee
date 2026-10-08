"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistReadinessEvaluator = void 0;
class ChecklistReadinessEvaluator {
    static evaluate(items) {
        return items.map((c) => {
            const title = c.title || c.item;
            const isMandatory = c.isMandatory !== undefined ? c.isMandatory : true;
            const isComplete = c.isCompleted;
            let reason;
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
exports.ChecklistReadinessEvaluator = ChecklistReadinessEvaluator;
//# sourceMappingURL=checklist-readiness.evaluator.js.map