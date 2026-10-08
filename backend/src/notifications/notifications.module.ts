import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './email/email.service';
import { DeadlineReminderService } from './reminders/deadline-reminder.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, DeadlineReminderService],
  exports: [NotificationsService, EmailService, DeadlineReminderService],
})
export class NotificationsModule {}
