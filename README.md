# Employee Onboarding & Pre-Joining Compliance Platform

A production-grade, centralized HR pre-joining compliance and onboarding platform designed to track candidates from selection through joining day. Features automated compliance engine rules, onboarding plan generation, document collection & verification, background check tracking, IT/department task management, asset readiness, automated deadline reminders & overdue escalations, interactive HR dashboard analytics, and immutable audit logging.

---

## 🌟 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Recharts, Axios
- **Backend**: NestJS 10, TypeScript, Prisma ORM 5, PostgreSQL 14+, Swagger OpenAPI (`/api/docs`)
- **Authentication & RBAC**: Clerk Identity (`@clerk/backend`), Server-Side RolesGuard (`HR_ADMIN`, `HR_MANAGER`, `IT`, `FINANCE`, `ADMINISTRATION`, `REPORTING_MANAGER`, `EMPLOYEE`)
- **Notifications & Queues**: Multi-Channel Notification Service (In-App & Email), Provider Abstraction (`console`, `smtp`, `sendgrid`, `aws_ses`, `resend`), BullMQ & Redis Deadline Reminder Scheduler
- **Security & Hardening**: IDOR Resource Protections, MIME & Extension Whitelisting, Path Traversal Sanitization, Helmet Security Headers, CORS, Rate Limiting (`@nestjs/throttler`), Sanitized Exceptions Filter

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL (v14+)
- Redis (v7+)
- Docker & Docker Compose (optional)

### 1. Repository Setup
```bash
git clone https://github.com/your-org/employee-onboarding-platform.git
cd employee-onboarding-platform
```

### 2. Environment Configuration
Copy `.env.example` into `backend/.env` and `frontend/.env.local`:
```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

### 3. Containerized Database & Redis (Docker Compose)
Start local PostgreSQL and Redis instances:
```bash
docker compose up -d postgres redis
```

### 4. Backend Setup & Database Seeding
```bash
cd backend
npm install

# Generate Prisma Client & Migrate Database
npx prisma generate
npx prisma db push

# Seed Realistic Demo Data Across Onboarding States (READY, PARTIALLY_READY, BLOCKED, OVERDUE)
npm run prisma:seed

# Run Unit Tests
npm test

# Start NestJS Backend in Development Mode
npm run start:dev
```
Backend API will be running at `http://localhost:4000/api`
Swagger OpenAPI docs available at `http://localhost:4000/api/docs`

### 5. Frontend Setup
```bash
cd ../frontend
npm install

# Start Next.js Frontend Development Server
npm run dev
```
Frontend web application will be accessible at `http://localhost:3000`

---

## 📋 Platform Core Modules

1. **Candidate Management**: Track candidate pipeline from application to `SELECTED` state and convert into employee profiles.
2. **Automatic Onboarding Plan Selection**: Rule-based matching engine that assigns department-specific document, task, asset, and checklist requirements upon candidate conversion.
3. **Document Management & Verification**: Secure upload with MIME validation, path traversal prevention, verification review workflows, and resubmission requests.
4. **Background Verification Engine**: Agency tracking, check completion, and status updates.
5. **Department Task Management**: Workflow assignment for IT, Finance, Administration, and Managers (`TODO` -> `IN_PROGRESS` -> `COMPLETED` / `BLOCKED` / `OVERDUE`).
6. **Asset Readiness**: IT hardware & badge preparation tracking (`REQUESTED` -> `IN_PREPARATION` -> `READY` -> `ASSIGNED`).
7. **Joining Checklist**: Mandatory compliance item completion before employee start date.
8. **Onboarding Readiness & Compliance Engine**: Automatic real-time status calculation (`READY`, `PARTIALLY_READY`, `BLOCKED`, `DELAYED`) based on data completeness and overdue blocking conditions.
9. **HR Management Dashboard**: Real-time KPI scorecards, Donut distribution analytics, high-priority attention alerts, and pending requirement hubs.
10. **Notifications & Overdue Escalations**: Multi-channel alerts (In-App & Email), deadline reminders (7d, 3d, 1d, today), automated task overdue escalation, and user preference controls.
11. **Centralized Audit Trail**: Immutable system audit history (`/dashboard/audit`) with sensitive payload redaction and entity activity timelines.

---

## 🧪 Testing & Build Commands

### Backend Tests & Build
```bash
cd backend
npm test          # Runs 11 Jest unit test suites (59/59 tests passing)
npm run build     # Compiles NestJS backend using tsc/nest build
```

### Frontend Build
```bash
cd frontend
npm run build     # Compiles Next.js 14 static application routes
```

---

## 📚 Documentation

Detailed documentation available in `docs/`:
- [API.md](file:///c:/Users/manju/Desktop/employee/docs/API.md): API Endpoint Inventory & Schemas
- [USER_GUIDE.md](file:///c:/Users/manju/Desktop/employee/docs/USER_GUIDE.md): HR & Employee Usage Manual
- [ADMIN_GUIDE.md](file:///c:/Users/manju/Desktop/employee/docs/ADMIN_GUIDE.md): Administrator & Operations Guide
- [ARCHITECTURE.md](file:///c:/Users/manju/Desktop/employee/docs/ARCHITECTURE.md): Full-Stack System & Async Architecture
- [DATABASE.md](file:///c:/Users/manju/Desktop/employee/docs/DATABASE.md): Database Entity Relationships & Schema
- [SECURITY.md](file:///c:/Users/manju/Desktop/employee/docs/SECURITY.md): Security & Compliance Controls
- [TESTING.md](file:///c:/Users/manju/Desktop/employee/docs/TESTING.md): Test Strategy & Automation Suite
- [DEPLOYMENT.md](file:///c:/Users/manju/Desktop/employee/docs/DEPLOYMENT.md): Cloud Deployment & Infrastructure Guide
- [FINAL_PROJECT_REPORT.md](file:///c:/Users/manju/Desktop/employee/docs/FINAL_PROJECT_REPORT.md): Executive Project Report
- [PRODUCTION_READINESS.md](file:///c:/Users/manju/Desktop/employee/docs/PRODUCTION_READINESS.md): Production Security & Readiness Checklist
