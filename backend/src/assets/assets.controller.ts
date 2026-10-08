import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  AssetsService,
  CreateAssetDto,
  QueryAssetsDto,
  PrepareAssetDto,
} from './assets.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('assets')
@Controller('assets')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'List employee assets with optional search & filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'assetType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  async findAll(@Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'List assets assigned to specific employee' })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.assetsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details by ID' })
  async findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.IT, UserRole.ADMINISTRATION)
  @ApiOperation({ summary: 'Request asset for employee' })
  async create(@Body() dto: CreateAssetDto, @CurrentUser() user: User) {
    return this.assetsService.create(dto, user);
  }

  @Post(':id/prepare')
  @ApiOperation({ summary: 'Update asset preparation status (IN_PREPARATION or READY)' })
  async prepareAsset(
    @Param('id') id: string,
    @Body() dto: PrepareAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.prepareAsset(id, dto, user);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign ready asset to employee (status -> ASSIGNED)' })
  async assignAsset(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetsService.assignAsset(id, user);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Mark asset as BLOCKED with reason' })
  async blockAsset(
    @Param('id') id: string,
    @Body('remarks') remarks: string,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.blockAsset(id, remarks, user);
  }
}
