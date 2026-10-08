import { Module } from '@nestjs/common';
import { OnboardingReadinessService } from './readiness.service';
import { ReadinessController } from './readiness.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReadinessController],
  providers: [OnboardingReadinessService],
  exports: [OnboardingReadinessService],
})
export class ReadinessModule {}
