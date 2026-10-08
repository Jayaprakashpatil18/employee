import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { StorageService } from './storage.service';
import { OnboardingRequirementStatusService } from './onboarding-requirement-status.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService, OnboardingRequirementStatusService],
  exports: [DocumentsService, StorageService, OnboardingRequirementStatusService],
})
export class DocumentsModule {}
