# API Inventory & Specification

The Employee Onboarding & Pre-Joining Compliance Platform provides a RESTful API built on NestJS with Swagger OpenAPI documentation available at `http://localhost:4000/api/docs`.

---

## 1. Authentication & System Health
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/health` | GET | Public | System and database health status ping |
| `POST /api/auth/sync` | POST | Authenticated | Synchronize Clerk user identity into database |
| `GET /api/auth/me` | GET | Authenticated | Get current authenticated user profile |

---

## 2. Candidate Management
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/candidates` | GET | HR_ADMIN, HR_MANAGER | Query candidates with search & filters |
| `GET /api/candidates/:id` | GET | HR_ADMIN, HR_MANAGER | Get candidate details by ID |
| `POST /api/candidates` | POST | HR_ADMIN, HR_MANAGER | Create new candidate profile |
| `PUT /api/candidates/:id` | PUT | HR_ADMIN, HR_MANAGER | Update candidate details |
| `PATCH /api/candidates/:id/status` | PATCH | HR_ADMIN, HR_MANAGER | Update candidate status (`ACTIVE`, `SELECTED`, `REJECTED`) |
| `POST /api/candidates/:id/convert` | POST | HR_ADMIN, HR_MANAGER | Convert candidate to employee & auto-assign onboarding plan |

---

## 3. Employee Management
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/employees` | GET | HR_ADMIN, HR_MANAGER, IT, FINANCE, ADMIN | Query employees with search, department & status filters |
| `GET /api/employees/:id` | GET | Authenticated | Get employee profile details & onboarding summary |
| `PUT /api/employees/:id` | PUT | HR_ADMIN, HR_MANAGER | Update employee profile information |

---

## 4. Onboarding Plans
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/onboarding-plans` | GET | HR_ADMIN, HR_MANAGER | List all onboarding templates |
| `GET /api/onboarding-plans/:id` | GET | HR_ADMIN, HR_MANAGER | Get onboarding plan template details |
| `POST /api/onboarding-plans` | POST | HR_ADMIN | Create new onboarding plan template |
| `PUT /api/onboarding-plans/:id` | PUT | HR_ADMIN | Update onboarding plan template |

---

## 5. Document Management & Verification
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/documents/employee/:employeeId` | GET | Authenticated (IDOR) | Get required documents for an employee |
| `POST /api/documents/:id/upload` | POST | Authenticated (IDOR) | Upload employee document file (PDF, JPG, PNG) |
| `PATCH /api/documents/:id/verify` | PATCH | HR_ADMIN, HR_MANAGER | Approve and mark document verified |
| `PATCH /api/documents/:id/reject` | PATCH | HR_ADMIN, HR_MANAGER | Reject document with mandatory reason |
| `GET /api/documents/stream/*` | GET | Authenticated (IDOR) | Stream/download document file safely |

---

## 6. Background Verification
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/verifications/employee/:employeeId` | GET | HR_ADMIN, HR_MANAGER | List background checks for an employee |
| `POST /api/verifications` | POST | HR_ADMIN, HR_MANAGER | Request new background check |
| `PATCH /api/verifications/:id/start` | PATCH | HR_ADMIN, HR_MANAGER | Mark background check in progress |
| `PATCH /api/verifications/:id/complete` | PATCH | HR_ADMIN, HR_MANAGER | Complete check with result (`CLEAR`, `FAILED`) |

---

## 7. Department Task Management
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/tasks` | GET | Authenticated | List department tasks (filtered by department/role) |
| `POST /api/tasks` | POST | HR_ADMIN, HR_MANAGER | Create new onboarding department task |
| `PATCH /api/tasks/:id/status` | PATCH | Task Owner, HR | Update task status (`TODO`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`) |

---

## 8. Asset Readiness
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/assets` | GET | IT, ADMIN, HR | List employee assets |
| `POST /api/assets` | POST | HR_ADMIN, HR_MANAGER | Request hardware or access asset |
| `PATCH /api/assets/:id/status` | PATCH | IT, ADMIN, HR | Update asset status (`REQUESTED`, `IN_PREPARATION`, `READY`, `ASSIGNED`) |

---

## 9. Joining Checklist
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/checklist/employee/:employeeId` | GET | Authenticated | Get checklist items for employee |
| `PATCH /api/checklist/:id/complete` | PATCH | HR, Manager | Mark checklist item completed |
| `PATCH /api/checklist/:id/reopen` | PATCH | HR, Manager | Reopen completed checklist item |

---

## 10. Onboarding Readiness Engine
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/readiness/employee/:employeeId` | GET | Authenticated | Calculate and fetch real-time readiness metrics |
| `POST /api/readiness/recalculate-all` | POST | HR_ADMIN | Trigger bulk readiness recalculation |

---

## 11. HR Management Dashboard
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/dashboard/summary` | GET | HR_ADMIN, HR_MANAGER | Get KPI summary metrics |
| `GET /api/dashboard/analytics` | GET | HR_ADMIN, HR_MANAGER | Get readiness status distributions |
| `GET /api/dashboard/attention-required` | GET | HR_ADMIN, HR_MANAGER | List high-priority blocked/delayed joiners |
| `GET /api/dashboard/upcoming-joiners` | GET | HR_ADMIN, HR_MANAGER | List upcoming joiners with urgency labels |

---

## 12. Notifications & Reminders
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/notifications` | GET | Authenticated | Get user notifications with pagination |
| `GET /api/notifications/unread-count` | GET | Authenticated | Get unread badge count |
| `PATCH /api/notifications/:id/read` | PATCH | Authenticated | Mark notification read |
| `POST /api/notifications/read-all` | POST | Authenticated | Mark all notifications read |
| `POST /api/notifications/trigger-reminders` | POST | HR_ADMIN | Trigger manual deadline reminder scan |

---

## 13. Audit Trail History
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `GET /api/audit` | GET | HR_ADMIN, HR_MANAGER | Query system audit logs with filters |
| `GET /api/audit/employee/:employeeId` | GET | Authenticated | Get audit activity timeline for employee |
