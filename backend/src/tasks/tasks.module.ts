import { Module, Injectable, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() { return this.prisma.departmentTask.findMany({ include: { employee: true, assignedUser: true } }); }
  async findOne(id: string) { return this.prisma.departmentTask.findUnique({ where: { id }, include: { employee: true, assignedUser: true } }); }
}

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Get() @ApiOperation({ summary: 'List all department tasks' }) async findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOperation({ summary: 'Get task by ID' }) async findOne(@Param('id') id: string) { return this.service.findOne(id); }
}

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
