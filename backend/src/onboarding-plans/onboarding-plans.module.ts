import { Module } from '@nestjs/common';
import { OnboardingPlansService } from './onboarding-plans.service';
import { OnboardingPlanMatchingService } from './onboarding-plan-matching.service';
import { OnboardingPlansController } from './onboarding-plans.controller';

@Module({
  controllers: [OnboardingPlansController],
  providers: [OnboardingPlansService, OnboardingPlanMatchingService],
  exports: [OnboardingPlansService, OnboardingPlanMatchingService],
})
export class OnboardingPlansModule {}
