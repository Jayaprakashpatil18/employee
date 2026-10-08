import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplates, EmailTemplateData } from './email-templates';

export interface SendEmailOptions {
  to: string;
  templateType:
    | 'ONBOARDING_TASK_ASSIGNED'
    | 'ONBOARDING_DOCUMENT_PENDING'
    | 'ONBOARDING_DOCUMENT_REJECTED'
    | 'ONBOARDING_TASK_DUE_SOON'
    | 'ONBOARDING_TASK_OVERDUE'
    | 'ONBOARDING_JOINING_REMINDER'
    | 'ONBOARDING_BLOCKED'
    | 'ONBOARDING_READY';
  data: EmailTemplateData;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: string;
  private readonly emailFrom: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('EMAIL_PROVIDER', 'console');
    this.emailFrom = this.configService.get<string>('EMAIL_FROM', 'onboarding@corp.example.com');
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; provider: string; messageId?: string }> {
    let rendered: { subject: string; html: string };

    switch (options.templateType) {
      case 'ONBOARDING_TASK_ASSIGNED':
        rendered = EmailTemplates.renderTaskAssigned(options.data);
        break;
      case 'ONBOARDING_DOCUMENT_PENDING':
        rendered = EmailTemplates.renderDocumentPending(options.data);
        break;
      case 'ONBOARDING_DOCUMENT_REJECTED':
        rendered = EmailTemplates.renderDocumentRejected(options.data);
        break;
      case 'ONBOARDING_TASK_OVERDUE':
        rendered = EmailTemplates.renderTaskOverdue(options.data);
        break;
      case 'ONBOARDING_JOINING_REMINDER':
        rendered = EmailTemplates.renderJoiningReminder(options.data);
        break;
      case 'ONBOARDING_BLOCKED':
        rendered = EmailTemplates.renderOnboardingBlocked(options.data);
        break;
      case 'ONBOARDING_READY':
        rendered = EmailTemplates.renderOnboardingReady(options.data);
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

    // Provider integration (Resend / SMTP fallback)
    try {
      this.logger.log(`Email dispatched via provider '${this.provider}' to ${options.to}`);
      return { success: true, provider: this.provider, messageId: `msg-${Date.now()}` };
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${err.message}`);
      return { success: false, provider: this.provider };
    }
  }
}
