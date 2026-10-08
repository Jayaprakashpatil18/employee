"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskReadinessEvaluator = void 0;
const client_1 = require("@prisma/client");
class TaskReadinessEvaluator {
    static evaluate(tasks, currentDate = new Date()) {
        return tasks.map((t) => {
            const isMandatory = t.isMandatory !== undefined ? t.isMandatory : true;
            const isComplete = t.status === client_1.TaskStatus.COMPLETED;
            const isTaskBlocked = t.status === client_1.TaskStatus.BLOCKED;
            const isOverdue = !isComplete && t.dueDate ? new Date(t.dueDate) < currentDate : false;
            const isBlocked = isMandatory && isTaskBlocked;
            let reason;
            if (isTaskBlocked) {
                reason = t.completionRemarks
                    ? `Department task '${t.title}' is blocked: ${t.completionRemarks}`
                    : `Department task '${t.title}' is blocked`;
            }
            else if (isOverdue) {
                reason = `Department task '${t.title}' is overdue (due date: ${new Date(t.dueDate).toLocaleDateString()})`;
            }
            else if (!isComplete) {
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
exports.TaskReadinessEvaluator = TaskReadinessEvaluator;
//# sourceMappingURL=task-readiness.evaluator.js.map