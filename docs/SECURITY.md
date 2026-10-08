# Security & Compliance Documentation

This document describes the security controls, access models, and hardening rules implemented across the platform.

---

## 1. Authentication & JWT Identity
- Authentication is anchored by Clerk Identity (`@clerk/backend`).
- Requests require a valid `Authorization: Bearer <JWT>` token.
- `ClerkAuthGuard` validates token authenticity and maps Clerk identities to local `User` database records.

---

## 2. Server-Side Role-Based Access Control (RBAC)
- Authorization is enforced on every controller endpoint using `RolesGuard` and `@Roles(...)` metadata.
- Frontend navigation elements reflect permissions, but API authorization is enforced strictly server-side.
- Attempting unauthorized API access returns `403 Forbidden`.

---

## 3. Insecure Direct Object Reference (IDOR) Protection
- All resource endpoints (documents, employee details, department tasks, notifications) enforce ownership verification:
  - An `EMPLOYEE` user can strictly access only their own records (`employee.userId === currentUser.id`).
  - Access to another employee's private profile or documents by a non-administrative user returns `403 Forbidden`.
  - Administrative roles (`HR_ADMIN`, `HR_MANAGER`) are granted scoped access required for platform oversight.

---

## 4. File Upload & Storage Hardening (`storage.service.ts`)
- **MIME Whitelist**: Restricts file uploads to `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- **Executable & Script Rejection**: Explicitly rejects `.exe`, `.sh`, `.bat`, `.cmd`, `.js`, `.html`, `.htm`, `.svg`, `.ps1`, `.dll`, `.vbs`.
- **Path Traversal Protection**: Ensures that resolved file storage paths remain strictly inside the root `uploads/` directory using `path.resolve` validation.
- **Safe Keys**: Filenames are sanitized and assigned safe timestamped keys (`documents/{employeeId}/{timestamp}_{name}.pdf`).
- **Private Stream Endpoint**: Document files are stored outside public web server roots. Downloads require authentication and authorization via `GET /api/documents/stream/*`.

---

## 5. Security Headers, CORS, & Rate Limiting
- **CORS Configuration**: Restricts origins to configured frontend domain (`process.env.FRONTEND_URL` / `http://localhost:3000`). Wildcard `*` CORS with credentials is explicitly disallowed in production.
- **Helmet Headers**: Configured via NestJS middleware for `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
- **Rate Limiting**: Configured via `@nestjs/throttler` to prevent brute-force attacks on sensitive endpoints.

---

## 6. Centralized Error Sanitization (`all-exceptions.filter.ts`)
- Global NestJS filter intercepts unhandled exceptions.
- Formats errors consistently as `{ success: false, statusCode, message, code, path, timestamp }`.
- In production, internal database exceptions, stack traces, and filesystem paths are redacted from client HTTP responses and logged securely on the server.

---

## 7. Audit Trail & Sensitive Data Redaction (`audit.service.ts`)
- Centralized `AuditService.record()` logs state-changing operations.
- Automatically redacts sensitive metadata keys (`password`, `token`, `secret`, `apiKey`, `creditCard`, `authorization`, `fileBuffer`).
- Audit log dashboard (`/dashboard/audit`) is restricted to authorized HR/Admin roles.
