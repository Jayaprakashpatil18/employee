"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const deadline_reminder_service_1 = require("./reminders/deadline-reminder.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let NotificationsController = class NotificationsController {
    constructor(notificationsService, reminderService) {
        this.notificationsService = notificationsService;
        this.reminderService = reminderService;
    }
    async getUserNotifications(currentUser, query) {
        return this.notificationsService.getUserNotifications(currentUser.id, query);
    }
    async getUnreadCount(currentUser) {
        return this.notificationsService.getUnreadCount(currentUser.id);
    }
    async markAllAsRead(currentUser) {
        return this.notificationsService.markAllAsRead(currentUser.id);
    }
    async markAsRead(id, currentUser) {
        return this.notificationsService.markAsRead(id, currentUser.id);
    }
    async deleteNotification(id, currentUser) {
        return this.notificationsService.deleteNotification(id, currentUser.id);
    }
    async getPreferences(currentUser) {
        return this.notificationsService.getUserPreferences(currentUser.id);
    }
    async updatePreferences(currentUser, dto) {
        return this.notificationsService.updateUserPreferences(currentUser.id, dto);
    }
    async triggerReminders() {
        return this.reminderService.processDeadlineReminders();
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated notifications for current user' }),
    (0, swagger_1.ApiQuery)({ name: 'unreadOnly', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of user notifications.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notifications count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unread count object.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications marked as read.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark single notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification preferences for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User notification preferences.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Patch)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update notification preferences for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated notification preferences.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('trigger-reminders'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger scheduled deadline & overdue reminder scan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reminder scan results.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "triggerReminders", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications & Deadline Reminders'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        deadline_reminder_service_1.DeadlineReminderService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map