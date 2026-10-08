import { Module, Injectable, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() { return this.prisma.employeeAsset.findMany({ include: { employee: true } }); }
  async findOne(id: string) { return this.prisma.employeeAsset.findUnique({ where: { id }, include: { employee: true } }); }
}

@ApiTags('assets')
@Controller('assets')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly service: AssetsService) {}
  @Get() @ApiOperation({ summary: 'List all employee assets' }) async findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOperation({ summary: 'Get asset by ID' }) async findOne(@Param('id') id: string) { return this.service.findOne(id); }
}

@Module({
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
