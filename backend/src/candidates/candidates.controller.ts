import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  CandidatesService,
  CreateCandidateDto,
  QueryCandidatesDto,
} from './candidates.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('candidates')
@Controller('candidates')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: 'List candidates with optional filtering and search' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'employmentType', required: false })
  async findAll(@Query() query: QueryCandidatesDto) {
    return this.candidatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID with timeline & details' })
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create new candidate (HR Admin & Manager)' })
  async create(@Body() dto: CreateCandidateDto, @CurrentUser() user: User) {
    return this.candidatesService.create(dto, user?.id);
  }

  @Patch(':id')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update candidate information' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCandidateDto>,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.update(id, dto, user?.id);
  }

  @Post(':id/convert')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Convert candidate to employee & generate onboarding requirements' })
  async convertCandidate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.candidatesService.convertCandidateToEmployee(id, user?.id);
  }
}
