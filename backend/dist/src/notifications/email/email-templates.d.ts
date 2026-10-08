export interface EmailTemplateData {
    employeeName?: string;
    taskTitle?: string;
    department?: string;
    dueDate?: string;
    documentType?: string;
    rejectionReason?: string;
    joiningDate?: string;
    blockingReason?: string;
    actionUrl?: string;
}
export declare class EmailTemplates {
    private static wrapTemplate;
    static renderTaskAssigned(data: EmailTemplateData): {
        subject: string;
        html: string;
    };
    static renderDocumentPending(data: EmailTemplateData): {
        subject: string;
        html: string;
    };
    static renderDocumentRejected(data: EmailTemplateData): {
        subject: string;
        html: string;
    };
    static renderTaskOverdue(data: EmailTemplateData): {
        subject: string;
        html: string;
    };
    static renderJoiningReminder(data: EmailTemplateData): {
        subject: string;
        html: string;
    };
    static renderOnboardingBlocked(data: EmailTemplateData): {
        subject: string;
        html: string;
    };
    static renderOnboardingReady(data: EmailTemplateData): {
        subject: string;
        html: string;
    };
}
