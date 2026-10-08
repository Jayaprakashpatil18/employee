# Administrator Guide — Platform Operations & Maintenance

This guide covers platform administration, Role-Based Access Control (RBAC), background worker management, environment configuration, database maintenance, and security monitoring.

---

## 1. System Roles & Access Control (RBAC)

The platform enforces 7 distinct user roles:

| Role | Access Scope | Key Responsibilities |
|---|---|---|
| `HR_ADMIN` | Full System Access | Platform settings, Onboarding Plans, Bulk Operations, Audit Logs, System Triggers |
| `HR_MANAGER` | HR Operations | Candidate Conversion, Document Verification, BGV Tracking, HR Dashboard |
| `IT` | IT Department Tasks & Hardware | Laptop preparation, Email creation, Software licenses, IT Assets |
| `FINANCE` | Finance Department Tasks | Bank account review, Tax documents, Payroll setup |
| `ADMINISTRATION` | Workplace Facilities | Office seating, Proximity ID cards, Workplace access |
| `REPORTING_MANAGER` | Team Onboarding | Welcome 1-on-1, Team buddy allocation, Checklist sign-off |
| `EMPLOYEE` | Self-Service | Document uploads, Personal onboarding progress tracking |

---

## 2. Notification Provider & Worker Management

The platform supports a pluggable email provider abstraction configured via `EMAIL_PROVIDER`:

```env
# Local Development (Logs email output cleanly to console)
EMAIL_PROVIDER=console

# SMTP Server
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_password

# Resend API
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_123456789
```

### Deadline Reminder Engine & Cron Scheduler
The background deadline engine `DeadlineReminderService` runs periodic scans:
- **7 Days / 3 Days / 1 Day / Same Day**: Upcoming joiner reminders dispatched to candidates/employees and HR.
- **Overdue Task Escalations**: Checks pending tasks past their `dueDate`. Upgrades task priority to `HIGH` / `CRITICAL` and alerts task assignees and HR.
- **Manual Trigger**: HR Admins can trigger immediate scans via `POST /api/notifications/trigger-reminders`.

---

## 3. Database Maintenance & Seeding

### Seeding Development & Demo Data
To seed realistic demonstration records across all onboarding compliance states (`READY`, `PARTIALLY_READY`, `BLOCKED`, `OVERDUE`):
```bash
cd backend
npm run prisma:seed
```

### Production Migrations
When deploying database updates, run non-destructive migrations:
```bash
npx prisma generate
npx prisma db push
```
> [!CAUTION]
> Never execute `npx prisma migrate reset` in a production environment as it drops all existing tables and data.

---

## 4. Monitoring & Health Checks

Pings system and PostgreSQL database connectivity:
```http
GET /api/health
```

Sample Healthy Response (`HTTP 200 OK`):
```json
{
  "status": "ok",
  "service": "employee-onboarding-api",
  "database": "up",
  "timestamp": "2026-09-16T17:24:00.000Z",
  "uptimeSeconds": 312.4
}
```

---

## 5. Audit Log Security & Redaction

The centralized `AuditService` logs system events while redacting sensitive attributes:
- Redacted Keys: `password`, `token`, `secret`, `apiKey`, `creditCard`, `authorization`, `fileBuffer`.
- Access Control: Audit logs (`/dashboard/audit`) are strictly restricted to `HR_ADMIN` and `HR_MANAGER` roles.
