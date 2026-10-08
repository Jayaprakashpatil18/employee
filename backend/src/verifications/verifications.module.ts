import { Module, Injectable, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Injectable()
export class VerificationsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() { return this.prisma.backgroundVerification.findMany({ include: { employee: true } }); }
  async findOne(id: string) { return this.prisma.backgroundVerification.findUnique({ where: { id }, include: { employee: true } }); }
}

@ApiTags('verifications')
@Controller('verifications')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class VerificationsController {
  constructor(private readonly service: VerificationsService) {}
  @Get() @ApiOperation({ summary: 'List background verifications' }) async findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOperation({ summary: 'Get background verification by ID' }) async findOne(@Param('id') id: string) { return this.service.findOne(id); }
}

@Module({
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
