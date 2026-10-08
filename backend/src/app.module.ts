import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { CandidatesModule } from './candidates/candidates.module';
import { EmployeesModule } from './employees/employees.module';
import { OnboardingPlansModule } from './onboarding-plans/onboarding-plans.module';
import { DocumentsModule } from './documents/documents.module';
import { VerificationsModule } from './verifications/verifications.module';
import { TasksModule } from './tasks/tasks.module';
import { AssetsModule } from './assets/assets.module';
import { ChecklistModule } from './checklist/checklist.module';
import { ReadinessModule } from './readiness/readiness.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CandidatesModule,
    EmployeesModule,
    OnboardingPlansModule,
    DocumentsModule,
    VerificationsModule,
    TasksModule,
    AssetsModule,
    ChecklistModule,
    ReadinessModule,
    DashboardModule,
    NotificationsModule,
    AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
