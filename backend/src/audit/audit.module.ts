import { Module, Injectable, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() { return this.prisma.auditLog.findMany({ include: { user: true, employee: true } }); }
  async findOne(id: string) { return this.prisma.auditLog.findUnique({ where: { id }, include: { user: true, employee: true } }); }
}

@ApiTags('audit')
@Controller('audit')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly service: AuditService) {}
  @Get() @ApiOperation({ summary: 'List audit logs' }) async findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOperation({ summary: 'Get audit log entry by ID' }) async findOne(@Param('id') id: string) { return this.service.findOne(id); }
}

@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
