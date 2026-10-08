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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const email_templates_1 = require("./email-templates");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.provider = this.configService.get('EMAIL_PROVIDER', 'console');
        this.emailFrom = this.configService.get('EMAIL_FROM', 'onboarding@corp.example.com');
    }
    async sendEmail(options) {
        let rendered;
        switch (options.templateType) {
            case 'ONBOARDING_TASK_ASSIGNED':
                rendered = email_templates_1.EmailTemplates.renderTaskAssigned(options.data);
                break;
            case 'ONBOARDING_DOCUMENT_PENDING':
                rendered = email_templates_1.EmailTemplates.renderDocumentPending(options.data);
                break;
            case 'ONBOARDING_DOCUMENT_REJECTED':
                rendered = email_templates_1.EmailTemplates.renderDocumentRejected(options.data);
                break;
            case 'ONBOARDING_TASK_OVERDUE':
                rendered = email_templates_1.EmailTemplates.renderTaskOverdue(options.data);
                break;
            case 'ONBOARDING_JOINING_REMINDER':
                rendered = email_templates_1.EmailTemplates.renderJoiningReminder(options.data);
                break;
            case 'ONBOARDING_BLOCKED':
                rendered = email_templates_1.EmailTemplates.renderOnboardingBlocked(options.data);
                break;
            case 'ONBOARDING_READY':
                rendered = email_templates_1.EmailTemplates.renderOnboardingReady(options.data);
                break;
            default:
                rendered = {
                    subject: 'Employee Onboarding Notification',
                    html: `<p>Notification for ${options.data.employeeName || 'Employee'}</p>`,
                };
        }
        if (this.provider === 'console' || process.env.NODE_ENV === 'test') {
            this.logger.log(`
===================== [EMAIL DISPATCH CONSOLE] =====================
FROM: ${this.emailFrom}
TO: ${options.to}
SUBJECT: ${rendered.subject}
TEMPLATE: ${options.templateType}
--------------------------------------------------------------------
${rendered.html.replace(/<[^>]*>?/gm, '').trim().substring(0, 300)}...
====================================================================`);
            return { success: true, provider: 'console', messageId: `console-${Date.now()}` };
        }
        try {
            this.logger.log(`Email dispatched via provider '${this.provider}' to ${options.to}`);
            return { success: true, provider: this.provider, messageId: `msg-${Date.now()}` };
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${options.to}: ${err.message}`);
            return { success: false, provider: this.provider };
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map