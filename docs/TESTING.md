# Testing Strategy & Automated Test Suite

This document describes the testing strategy, test coverage, and execution commands for the platform.

---

## 1. Test Architecture & Coverage

The backend includes 11 dedicated Jest test suites covering core business logic:

| Test Suite | File Path | Test Focus |
|---|---|---|
| **Candidates Service** | `src/candidates/candidates.service.spec.ts` | Candidate creation, status updates, conversion to employee, onboarding plan matching |
| **Documents Service** | `src/documents/documents.service.spec.ts` | File upload MIME validation, size limits, HR verification, rejection, resubmissions |
| **Tasks Service** | `src/tasks/tasks.service.spec.ts` | Department task creation, status transitions (`TODO` -> `IN_PROGRESS` -> `COMPLETED`), overdue checks |
| **Background Check Service** | `src/verifications/verifications.service.spec.ts` | BGV requests, in-progress updates, clear/failed result completions |
| **Assets Service** | `src/assets/assets.service.spec.ts` | IT hardware asset requests, preparation, ready/assigned transitions |
| **Checklist Service** | `src/checklist/checklist.service.spec.ts` | Joining checklist item completions and re-open workflows |
| **Readiness Engine** | `src/readiness/readiness.service.spec.ts` | Compliance status rules (`READY`, `PARTIALLY_READY`, `BLOCKED`, `DELAYED`), issue detection |
| **Dashboard Analytics** | `src/dashboard/dashboard.service.spec.ts` | Summary KPI calculations, status distributions, attention required prioritization |
| **Notification Engine** | `src/notifications/notifications.service.spec.ts` | In-app alerts, email dispatches, unread badge counter, user preference toggles |
| **Onboarding Plan Matching** | `src/onboarding-plans/onboarding-plan-matching.service.spec.ts` | Automatic template selection by department, role, location |
| **Audit Service** | `src/audit/audit.service.spec.ts` | Audit recording, sensitive metadata auto-redaction, paginated search |

---

## 2. Running Automated Tests

### Run All Backend Unit Tests
```bash
cd backend
npm test
```

Expected Output:
```text
Test Suites: 11 passed, 11 total
Tests:       59 passed, 59 total
Snapshots:   0 total
Time:        ~20 s
```

---

## 3. End-to-End & Build Verification Commands

### Prisma Schema Validation
```bash
cd backend
npx prisma validate
```

### NestJS Backend Production Build
```bash
cd backend
npm run build
```

### Next.js Frontend Production Build
```bash
cd frontend
npm run build
```
