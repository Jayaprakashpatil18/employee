# Database Documentation & Prisma Schema Reference

The database layer is managed via Prisma ORM 5 with PostgreSQL 14+.

---

## 1. Primary Entity Models

### User (`User`)
Represents system actors and Clerk authenticated users.
- Fields: `id` (UUID), `clerkUserId` (Unique), `email` (Unique), `name`, `role` (Enum), `department`, `createdAt`, `updatedAt`.
- Relations: `employee`, `candidatesCreated`, `assignedDepartmentTasks`, `completedChecklistItems`, `notifications`, `auditLogs`.

### Candidate (`Candidate`)
Tracks prospective hires prior to formal onboarding.
- Fields: `id`, `firstName`, `lastName`, `email` (Unique), `phone`, `department`, `designation`, `location`, `employmentType`, `expectedJoiningDate`, `status` (`ACTIVE`, `SELECTED`, `REJECTED`, `CONVERTED`), `createdById`.
- Relations: `createdBy`, `employee`.

### Employee (`Employee`)
Central record representing converted onboardees.
- Fields: `id`, `candidateId` (Unique), `userId` (Unique), `employeeId` (Unique), `firstName`, `lastName`, `email` (Unique), `phone`, `department`, `designation`, `location`, `employmentType`, `joiningDate`, `onboardingStatus` (`READY`, `PARTIALLY_READY`, `DELAYED`, `BLOCKED`), `onboardingPlanId`.
- Indexes: `joiningDate`, `department`, `location`, `onboardingStatus`.
- Relations: `documents`, `verifications`, `tasks`, `assets`, `checklist`, `notifications`, `auditLogs`.

### OnboardingPlan (`OnboardingPlan`)
Templates defining onboarding requirements by department/role.
- Relations: `documentRequirements`, `taskRequirements`, `assetRequirements`, `checklistRequirements`, `employees`.

### EmployeeDocument (`EmployeeDocument`)
Tracks required document submission and HR verification state.
- Fields: `id`, `employeeId`, `documentType`, `documentName`, `fileUrl`, `fileKey`, `fileSize`, `mimeType`, `isRequired`, `submissionStatus` (`NOT_SUBMITTED`, `SUBMITTED`), `verificationStatus` (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `RESUBMISSION_REQUIRED`), `submittedAt`, `rejectionReason`, `remarks`, `verifiedAt`, `verifiedById`.
- Indexes: `verificationStatus`.

### BackgroundVerification (`BackgroundVerification`)
Background check tracking.
- Fields: `id`, `employeeId`, `verificationType`, `agencyName`, `isMandatory`, `status` (`REQUESTED`, `IN_PROGRESS`, `COMPLETED`), `result` (`CLEAR`, `FAILED`, `NEEDS_REVIEW`), `notes`, `remarks`, `completedAt`.
- Indexes: `status`.

### DepartmentTask (`DepartmentTask`)
Workflows assigned to IT, Finance, Admin, or Managers.
- Fields: `id`, `employeeId`, `title`, `description`, `assignedDepartment`, `assignedUserId`, `status` (`TODO`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`, `OVERDUE`), `priority`, `isMandatory`, `dueDate`, `completedAt`, `completionRemarks`.
- Indexes: `status`, `dueDate`.

### EmployeeAsset (`EmployeeAsset`)
Hardware asset preparation tracking.
- Fields: `id`, `employeeId`, `assetName`, `assetType`, `serialNumber`, `assetIdentifier`, `isMandatory`, `status` (`REQUESTED`, `IN_PREPARATION`, `READY`, `ASSIGNED`, `BLOCKED`), `preparedAt`, `assignedAt`, `remarks`.

### JoiningChecklistItem (`JoiningChecklistItem`)
Pre-joining compliance sign-off checklist items.
- Fields: `id`, `employeeId`, `title`, `item`, `category`, `isMandatory`, `isCompleted`, `completedAt`, `completedById`.

### Notification (`Notification`)
System alerts and reminder logs.
- Fields: `id`, `recipientUserId`, `userId`, `employeeId`, `candidateId`, `type`, `channel` (`IN_APP`, `EMAIL`), `title`, `message`, `relatedEntityType`, `relatedEntityId`, `priority`, `status`, `isRead`, `readAt`, `sentAt`, `failedAt`, `failureReason`, `scheduledFor`.
- Indexes: `recipientUserId`, `userId`, `employeeId`, `status`, `isRead`, `type`, `scheduledFor`, `createdAt`.

### AuditLog (`AuditLog`)
Immutable audit log record.
- Fields: `id`, `userId`, `employeeId`, `actorRole`, `action`, `entity`, `entityType`, `entityId`, `description`, `oldValue`, `newValue`, `details`, `metadata` (Json), `ipAddress`, `userAgent`, `createdAt`.
- Indexes: `userId`, `employeeId`, `action`, `entityType`, `createdAt`.
