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

export class EmailTemplates {
  private static wrapTemplate(title: string, bodyContent: string, actionUrl?: string, actionText?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; color: #0f172a; margin: 0; }
    .content { font-size: 14px; line-height: 1.6; color: #334155; }
    .card { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 16px; }
    .footer { font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Employee Onboarding & Pre-Joining Compliance</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${bodyContent}
      ${actionUrl ? `<a href="${actionUrl}" class="btn">${actionText || 'View in Portal'}</a>` : ''}
    </div>
    <div class="footer">
      <p>This is an automated notification from the Employee Onboarding Platform.</p>
    </div>
  </div>
</body>
</html>`;
  }

  static renderTaskAssigned(data: EmailTemplateData): { subject: string; html: string } {
    const subject = `New onboarding task assigned: ${data.taskTitle || 'Task'}`;
    const body = `
      <p>Hello,</p>
      <p>A new onboarding department task has been assigned for <strong>${data.employeeName || 'Employee'}</strong>.</p>
      <div class="card">
        <p><strong>Task:</strong> ${data.taskTitle || 'Task'}</p>
        <p><strong>Department:</strong> ${data.department || 'IT'}</p>
        <p><strong>Due Date:</strong> ${data.dueDate || 'ASAP'}</p>
      </div>
      <p>Please complete this task prior to the employee's joining date.</p>
    `;
    return { subject, html: this.wrapTemplate(subject, body, data.actionUrl || 'http://localhost:3000/tasks', 'Open Task Board') };
  }

  static renderDocumentPending(data: EmailTemplateData): { subject: string; html: string } {
    const subject = `Action Required: Document pending for ${data.employeeName || 'Employee'}`;
    const body = `
      <p>Hello,</p>
      <p>The compliance document <strong>${data.documentType || 'Document'}</strong> is required for candidate <strong>${data.employeeName || 'Employee'}</strong>.</p>
      <div class="card">
        <p><strong>Document:</strong> ${data.documentType}</p>
        <p><strong>Status:</strong> Pending Verification</p>
      </div>
    `;
    return { subject, html: this.wrapTemplate(subject, body, data.actionUrl, 'Upload Document') };
  }

  static renderDocumentRejected(data: EmailTemplateData): { subject: string; html: string } {
    const subject = `Action Required: Document rejected for ${data.employeeName || 'Employee'}`;
    const body = `
      <p>Hello,</p>
      <p>The compliance document <strong>${data.documentType || 'Document'}</strong> for <strong>${data.employeeName || 'Employee'}</strong> was rejected during verification.</p>
      <div class="card">
        <p><strong>Document:</strong> ${data.documentType}</p>
        <p><strong>Rejection Reason:</strong> ${data.rejectionReason || 'Document unreadable or invalid'}</p>
      </div>
      <p>Please re-upload a clear original copy immediately.</p>
    `;
    return { subject, html: this.wrapTemplate(subject, body, data.actionUrl, 'Resubmit Document') };
  }

  static renderTaskOverdue(data: EmailTemplateData): { subject: string; html: string } {
    const subject = `[OVERDUE ESCALATION] Onboarding task: ${data.taskTitle || 'Task'}`;
    const body = `
      <p>Hello,</p>
      <p><strong style="color:#e11d48;">ATTENTION:</strong> The onboarding task <strong>${data.taskTitle || 'Task'}</strong> for <strong>${data.employeeName || 'Employee'}</strong> has passed its due date.</p>
      <div class="card">
        <p><strong>Task:</strong> ${data.taskTitle}</p>
        <p><strong>Department:</strong> ${data.department}</p>
        <p><strong>Due Date:</strong> ${data.dueDate}</p>
      </div>
    `;
    return { subject, html: this.wrapTemplate(subject, body, data.actionUrl, 'View Task') };
  }

  static renderJoiningReminder(data: EmailTemplateData): { subject: string; html: string } {
    const subject = `Upcoming joining reminder: ${data.employeeName || 'Employee'}`;
    const body = `
      <p>Hello,</p>
      <p>Employee <strong>${data.employeeName}</strong> is scheduled to join the <strong>${data.department}</strong> department on <strong>${data.joiningDate}</strong>.</p>
      <p>Please ensure all documents, background checks, tasks, and assets are fully verified.</p>
    `;
    return { subject, html: this.wrapTemplate(subject, body, data.actionUrl, 'Check Onboarding Status') };
  }

  static renderOnboardingBlocked(data: EmailTemplateData): { subject: string; html: string } {
    const subject = `[CRITICAL ALERT] Employee onboarding blocked: ${data.employeeName || 'Employee'}`;
    const body = `
      <p>Hello,</p>
      <p><strong style="color:#e11d48;">CRITICAL ESCALATION:</strong> Onboarding for <strong>${data.employeeName}</strong> (Joining: ${data.joiningDate}) has been BLOCKED.</p>
      <div class="card">
        <p><strong>Blocking Reason:</strong> ${data.blockingReason || 'Critical compliance blocker detected'}</p>
      </div>
      <p>HR intervention is urgently required to resolve this blocker.</p>
    `;
    return { subject, html: this.wrapTemplate(subject, body, data.actionUrl, 'Open Executive Dashboard') };
  }

  static renderOnboardingReady(data: EmailTemplateData): { subject: string; html: string } {
    const subject = `Confirmation: ${data.employeeName || 'Employee'} is READY for joining`;
    const body = `
      <p>Hello,</p>
      <p>Great news! <strong>${data.employeeName}</strong> has completed 100% of pre-joining compliance requirements and is <strong>READY</strong> for joining on <strong>${data.joiningDate}</strong>.</p>
    `;
    return { subject, html: this.wrapTemplate(subject, body, data.actionUrl, 'View Employee Profile') };
  }
}
