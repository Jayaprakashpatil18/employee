import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { ChecklistModule } from '../checklist/checklist.module';
import { ReadinessModule } from '../readiness/readiness.module';

@Module({
  imports: [ChecklistModule, ReadinessModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
