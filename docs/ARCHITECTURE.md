# Architecture Documentation — System & Async Architecture

This document describes the end-to-end technical architecture of the **Employee Onboarding & Pre-Joining Compliance Platform**.

---

## 1. System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                           Client Browser                                  │
│                 Next.js 14 Web Application (TypeScript)                  │
│                Tailwind CSS + shadcn/ui + Recharts + Axios               │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     │ HTTPS / REST API (JWT Bearer / Clerk)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            NestJS Backend API                             │
│       Controllers ──► Services ──► Guards (Clerk / Roles) ──► ORM       │
└──────────────┬─────────────────────┬──────────────────────┬──────────────┘
               │                     │                      │
               │ Prisma ORM          │ Redis / BullMQ       │ Storage Service
               ▼                     ▼                      ▼
┌──────────────────────────┐ ┌──────────────┐ ┌───────────────────────────┐
│   PostgreSQL Database    │ │ Redis Cache  │ │ Private Storage / S3      │
│  Users, Employees, Plans │ │ & Queue      │ │ Documents, Scans, Uploads │
│  Tasks, Audits, Checks   │ └──────┬───────┘ └─────────────┬─────────────┘
└──────────────────────────┘        │                     │
                                    │                     │ Stream / Signed URL
                                    ▼                     ▼
                             ┌──────────────┐   ┌───────────────────────────┐
                             │ Notification │   │  Secure Browser Viewer    │
                             │ Worker       │   └───────────────────────────┘
                             └──────┬───────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │ Email Adapter│
                             │ (Console/Resend/SMTP)
                             └──────────────┘
```

---

## 2. Onboarding Readiness Engine Logic

The core compliance engine (`OnboardingReadinessService`) calculates real-time onboarding readiness using deterministic business rules:

```text
                               ┌───────────────────────────┐
                               │  Employee Onboarding Data │
                               └─────────────┬─────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               │                             │                             │
               ▼                             ▼                             ▼
    ┌────────────────────┐        ┌────────────────────┐        ┌────────────────────┐
    │ Required Documents │        ┌ Background Checks  │        │ Department Tasks   │
    │  - Submitted?      │        │  - Completed?      │        │  - Completed?      │
    │  - Verified?       │        │  - Clear/Failed?   │        │  - Overdue?        │
    └──────────┬─────────┘        └──────────┬─────────┘        └──────────┬─────────┘
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               │                                                           │
               ▼                                                           ▼
    ┌────────────────────┐                                      ┌────────────────────┐
    │ Hardware Assets    │                                      │ Joining Checklist  │
    │  - Ready/Assigned? │                                      │  - Mandatory Done? │
    └──────────┬─────────┘                                      └──────────┬─────────┘
               │                                                           │
               └─────────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │ Onboarding Readiness      │
                               │ Evaluator                 │
                               └─────────────┬─────────────┘
                                             │
           ┌─────────────────────────────────┼─────────────────────────────────┐
           │                                 │                                 │
           ▼                                 ▼                                 ▼
┌─────────────────────┐           ┌─────────────────────┐           ┌─────────────────────┐
│       READY         │           │   PARTIALLY_READY   │           │       BLOCKED       │
│ All documents       │           │ Documents uploaded, │           │ Any document        │
│ verified, checks    │           │ non-critical tasks  │           │ rejected, BGV       │
│ clear, tasks &      │           │ in progress, no     │           │ failed, or mandatory│
│ assets ready.       │           │ blocking conditions.│           │ task overdue.       │
└─────────────────────┘           └─────────────────────┘           └─────────────────────┘
```

### Readiness Evaluation Criteria
1. **`BLOCKED`**:
   - Any required document is `REJECTED` or `RESUBMISSION_REQUIRED`.
   - Any background verification result is `FAILED`.
   - Any mandatory task is `BLOCKED` or `OVERDUE`.
   - Any mandatory asset status is `BLOCKED`.
2. **`DELAYED`**:
   - Joining date is within 3 days and mandatory documents or checks are still `PENDING`.
3. **`PARTIALLY_READY`**:
   - Documents submitted but pending review; tasks in progress; no blocking failures.
4. **`READY`**:
   - 100% of required documents verified, all BGV checks clear, all mandatory department tasks completed, hardware assets ready/assigned, and mandatory joining checklist items completed.

---

## 3. Document Management & Private Storage

```text
Browser Upload ──► NestJS DocumentsController ──► MIME/Extension Whitelist
                                                           │
                                                           ▼
StorageService ◄── Validated Buffer ◄── Path Traversal Check (Uploads Directory)
      │
      ▼
Save File Key (documents/{employeeId}/{timestamp}_{name}.pdf)
      │
      ▼
Stream Endpoint (`GET /api/documents/stream/*`) ──► Identity & IDOR Authorization ──► Stream to Browser
```

---

## 4. Async Notification & Reminder Pipeline

```text
Cron Trigger / API Event ──► DeadlineReminderService
                                   │
                                   ├─► Deduplication Check (Has reminder been sent for target date?)
                                   │
                                   ▼
                       NotificationsService.createNotification()
                                   │
               ┌───────────────────┴───────────────────┐
               │                                       │
               ▼                                       ▼
     In-App Notification                      Email Service Adapter
   (Prisma Notification DB)                  (Console / SMTP / Resend)
               │                                       │
               ▼                                       ▼
  Header Notification Bell                     HTML Email Delivery
  & Notification Center                        To Recipient Inbox
```
