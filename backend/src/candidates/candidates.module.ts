import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { OnboardingPlansModule } from '../onboarding-plans/onboarding-plans.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [OnboardingPlansModule, NotificationsModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
