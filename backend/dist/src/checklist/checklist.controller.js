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
exports.ChecklistController = void 0;
const common_1 = require("@nestjs/common");
const checklist_service_1 = require("./checklist.service");
const clerk_auth_guard_1 = require("../auth/clerk-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let ChecklistController = class ChecklistController {
    constructor(checklistService) {
        this.checklistService = checklistService;
    }
    async getChecklistItem(id) {
        return this.checklistService.findOne(id);
    }
    async updateChecklistItem(id, dto, currentUser) {
        return this.checklistService.update(id, dto, currentUser);
    }
    async completeChecklistItem(id, currentUser) {
        return this.checklistService.completeItem(id, currentUser);
    }
    async reopenChecklistItem(id, currentUser) {
        return this.checklistService.reopenItem(id, currentUser);
    }
};
exports.ChecklistController = ChecklistController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single checklist item details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist item details with user attribution.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "getChecklistItem", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update checklist item metadata' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist item updated.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "updateChecklistItem", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark checklist item as completed' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist item completed successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "completeChecklistItem", null);
__decorate([
    (0, common_1.Post)(':id/reopen'),
    (0, swagger_1.ApiOperation)({ summary: 'Reopen checklist item' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist item reopened.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "reopenChecklistItem", null);
exports.ChecklistController = ChecklistController = __decorate([
    (0, swagger_1.ApiTags)('Joining Checklist'),
    (0, common_1.Controller)('checklist'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [checklist_service_1.ChecklistService])
], ChecklistController);
//# sourceMappingURL=checklist.controller.js.map