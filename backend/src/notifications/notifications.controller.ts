import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService, QueryNotificationsDto } from './notifications.service';
import { DeadlineReminderService } from './reminders/deadline-reminder.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notifications & Deadline Reminders')
@Controller('notifications')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly reminderService: DeadlineReminderService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for current user' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of user notifications.' })
  async getUserNotifications(
    @CurrentUser() currentUser: User,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.getUserNotifications(currentUser.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count object.' })
  async getUnreadCount(@CurrentUser() currentUser: User) {
    return this.notificationsService.getUnreadCount(currentUser.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
  async markAllAsRead(@CurrentUser() currentUser: User) {
    return this.notificationsService.markAllAsRead(currentUser.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.notificationsService.markAsRead(id, currentUser.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted.' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.notificationsService.deleteNotification(id, currentUser.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences for current user' })
  @ApiResponse({ status: 200, description: 'User notification preferences.' })
  async getPreferences(@CurrentUser() currentUser: User) {
    return this.notificationsService.getUserPreferences(currentUser.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences for current user' })
  @ApiResponse({ status: 200, description: 'Updated notification preferences.' })
  async updatePreferences(
    @CurrentUser() currentUser: User,
    @Body() dto: any,
  ) {
    return this.notificationsService.updateUserPreferences(currentUser.id, dto);
  }

  @Post('trigger-reminders')
  @ApiOperation({ summary: 'Manually trigger scheduled deadline & overdue reminder scan' })
  @ApiResponse({ status: 200, description: 'Reminder scan results.' })
  async triggerReminders() {
    return this.reminderService.processDeadlineReminders();
  }
}
