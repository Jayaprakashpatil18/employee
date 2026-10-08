import { ConfigService } from '@nestjs/config';
import { EmailTemplateData } from './email-templates';
export interface SendEmailOptions {
    to: string;
    templateType: 'ONBOARDING_TASK_ASSIGNED' | 'ONBOARDING_DOCUMENT_PENDING' | 'ONBOARDING_DOCUMENT_REJECTED' | 'ONBOARDING_TASK_DUE_SOON' | 'ONBOARDING_TASK_OVERDUE' | 'ONBOARDING_JOINING_REMINDER' | 'ONBOARDING_BLOCKED' | 'ONBOARDING_READY';
    data: EmailTemplateData;
}
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly provider;
    private readonly emailFrom;
    constructor(configService: ConfigService);
    sendEmail(options: SendEmailOptions): Promise<{
        success: boolean;
        provider: string;
        messageId?: string;
    }>;
}
