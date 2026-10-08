import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ChecklistService, UpdateChecklistItemDto } from './checklist.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Joining Checklist')
@Controller('checklist')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get single checklist item details' })
  @ApiResponse({ status: 200, description: 'Checklist item details with user attribution.' })
  async getChecklistItem(@Param('id') id: string) {
    return this.checklistService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update checklist item metadata' })
  @ApiResponse({ status: 200, description: 'Checklist item updated.' })
  async updateChecklistItem(
    @Param('id') id: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.checklistService.update(id, dto, currentUser);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark checklist item as completed' })
  @ApiResponse({ status: 200, description: 'Checklist item completed successfully.' })
  async completeChecklistItem(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.checklistService.completeItem(id, currentUser);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: 'Reopen checklist item' })
  @ApiResponse({ status: 200, description: 'Checklist item reopened.' })
  async reopenChecklistItem(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.checklistService.reopenItem(id, currentUser);
  }
}
