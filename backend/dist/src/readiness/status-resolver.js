"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusResolver = void 0;
const client_1 = require("@prisma/client");
class StatusResolver {
    static resolveStatus(requirements) {
        const mandatoryReqs = requirements.filter((r) => r.mandatory);
        const totalMandatory = mandatoryReqs.length;
        const completedMandatory = mandatoryReqs.filter((r) => r.isComplete).length;
        let readinessPercentage = 0;
        if (totalMandatory > 0) {
            readinessPercentage = Math.round((completedMandatory / totalMandatory) * 100);
        }
        else if (requirements.length > 0) {
            const allOptionalComplete = requirements.every((r) => r.isComplete);
            readinessPercentage = allOptionalComplete ? 100 : 0;
        }
        else {
            readinessPercentage = 0;
        }
        const blockedReqs = requirements.filter((r) => r.isBlocked);
        const overdueReqs = requirements.filter((r) => r.mandatory && r.isOverdue && !r.isComplete);
        if (blockedReqs.length > 0) {
            const mainBlocker = blockedReqs[0];
            return {
                status: client_1.OnboardingStatus.BLOCKED,
                reason: mainBlocker.reason || `Blocked due to critical ${mainBlocker.category.toLowerCase()} issue: '${mainBlocker.name}'`,
                blockedCount: blockedReqs.length,
                overdueCount: overdueReqs.length,
                totalMandatory,
                completedMandatory,
                readinessPercentage,
            };
        }
        if (overdueReqs.length > 0) {
            const mainOverdue = overdueReqs[0];
            return {
                status: client_1.OnboardingStatus.DELAYED,
                reason: `Delayed due to overdue mandatory ${mainOverdue.category.toLowerCase()} requirement: '${mainOverdue.name}'`,
                blockedCount: 0,
                overdueCount: overdueReqs.length,
                totalMandatory,
                completedMandatory,
                readinessPercentage,
            };
        }
        if (requirements.length === 0) {
            return {
                status: client_1.OnboardingStatus.PARTIALLY_READY,
                reason: 'No onboarding requirements configured for employee',
                blockedCount: 0,
                overdueCount: 0,
                totalMandatory: 0,
                completedMandatory: 0,
                readinessPercentage: 0,
            };
        }
        if (totalMandatory === 0 || completedMandatory === totalMandatory) {
            return {
                status: client_1.OnboardingStatus.READY,
                reason: 'All mandatory onboarding requirements completed successfully',
                blockedCount: 0,
                overdueCount: 0,
                totalMandatory,
                completedMandatory,
                readinessPercentage: 100,
            };
        }
        return {
            status: client_1.OnboardingStatus.PARTIALLY_READY,
            reason: `${totalMandatory - completedMandatory} mandatory onboarding requirement(s) pending`,
            blockedCount: 0,
            overdueCount: 0,
            totalMandatory,
            completedMandatory,
            readinessPercentage,
        };
    }
}
exports.StatusResolver = StatusResolver;
//# sourceMappingURL=status-resolver.js.map