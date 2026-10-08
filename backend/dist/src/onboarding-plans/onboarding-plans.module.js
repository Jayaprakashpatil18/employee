"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingPlansModule = void 0;
const common_1 = require("@nestjs/common");
const onboarding_plans_service_1 = require("./onboarding-plans.service");
const onboarding_plan_matching_service_1 = require("./onboarding-plan-matching.service");
const onboarding_plans_controller_1 = require("./onboarding-plans.controller");
let OnboardingPlansModule = class OnboardingPlansModule {
};
exports.OnboardingPlansModule = OnboardingPlansModule;
exports.OnboardingPlansModule = OnboardingPlansModule = __decorate([
    (0, common_1.Module)({
        controllers: [onboarding_plans_controller_1.OnboardingPlansController],
        providers: [onboarding_plans_service_1.OnboardingPlansService, onboarding_plan_matching_service_1.OnboardingPlanMatchingService],
        exports: [onboarding_plans_service_1.OnboardingPlansService, onboarding_plan_matching_service_1.OnboardingPlanMatchingService],
    })
], OnboardingPlansModule);
//# sourceMappingURL=onboarding-plans.module.js.map