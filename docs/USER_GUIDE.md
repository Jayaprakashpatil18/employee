# User Guide — HR & Employee Onboarding Platform

Welcome to the **Employee Onboarding & Pre-Joining Compliance Platform**. This guide provides step-by-step instructions for HR Administrators, Department Task Owners, Managers, and Employees.

---

## 1. Candidate Management & Conversion
1. Navigate to **Candidates** (`/candidates`) in the left navigation menu.
2. Click **Add Candidate** (`/candidates/new`) to register a selected applicant.
3. Fill in candidate details: First Name, Last Name, Email, Phone, Department, Designation, Location, Employment Type, and Expected Joining Date.
4. When an offer is accepted, change status to `SELECTED`.
5. Click **Convert to Employee**:
   - The platform generates a unique Employee ID (e.g., `EMP-2026-0001`).
   - The matching engine automatically selects the department's active Onboarding Plan.
   - Required document items, department tasks, hardware asset requests, and joining checklist items are generated instantly.

---

## 2. Managing Employee Onboarding Profiles
1. Navigate to **Employees** (`/employees`) and select an employee profile (`/employees/[id]`).
2. Review the **Onboarding Compliance Summary**:
   - Status Badge: `READY` (Green), `PARTIALLY_READY` (Blue), `BLOCKED` (Red), `DELAYED` (Amber).
   - Readiness Score percentage and category breakdown (Documents, Verifications, Tasks, Assets, Checklist).
   - Actionable compliance issues banner.

---

## 3. Document Verification Workflow
1. Navigate to **Documents** (`/documents`) or open the employee's document tab.
2. **Uploading Documents** (Employee/HR):
   - Click **Upload** on a document requirement (e.g., Aadhaar Card, PAN Card).
   - Select a valid PDF, JPG, or PNG file (Max 10 MB).
3. **Verifying Documents** (HR Admin/Manager):
   - Review uploaded file via secure in-browser streaming.
   - Click **Verify** to mark document approved.
   - Or click **Reject / Resubmit** and enter a mandatory reason (e.g., "Blurry scan"). The employee is notified instantly.

---

## 4. Background Verification Tracking
1. Open the **Background Verification** section on an employee profile.
2. Click **Request Background Check** and specify verification type (e.g., Criminal Background Check, Previous Employment Audit).
3. Click **Start Verification** when handed to the agency (`IN_PROGRESS`).
4. Upon report receipt, click **Complete Verification** and mark result `CLEAR` or `FAILED`.

---

## 5. Department Task Management
1. Department task owners (IT, Finance, Administration) navigate to **Department Tasks** (`/tasks`).
2. Filter tasks by department or assignee.
3. Update task status from `TODO` -> `IN_PROGRESS` -> `COMPLETED`.
4. If a task cannot be completed due to missing dependencies, mark it `BLOCKED` with remarks.

---

## 6. Asset Readiness & Hardware Provisioning
1. IT & Admin teams navigate to **Asset Readiness** (`/assets`).
2. Review requested hardware assets (Laptop, Access Card, Monitor).
3. Progress status from `REQUESTED` -> `IN_PREPARATION` -> `READY` -> `ASSIGNED`.
4. Record asset serial numbers and identifiers.

---

## 7. Final Joining Checklist & Onboarding Sign-Off
1. Reporting managers navigate to the employee's **Joining Checklist** tab.
2. Complete mandatory pre-joining items (e.g., Manager Welcome 1-on-1, Team Buddy assigned, System Accounts provisioned).
3. When all items, documents, verifications, tasks, and assets pass compliance, the Readiness Engine automatically recalculates status to `READY`.

---

## 8. HR Management Dashboard & Analytics
1. Navigate to **Dashboard** (`/dashboard`).
2. Monitor real-time KPI scorecards: Total Upcoming Joiners, Ready Joiners, Partially Ready, Delayed, Blocked, Pending Documents, Pending Checks, Pending Tasks, and Pending Assets.
3. Review the **Donut Distribution Visualizer** and **High-Priority Attention Required** queue for blocked or delayed joiners requiring immediate intervention.

---

## 9. Notification Center & Reminders
1. Click the **Notification Bell** in the header to view unread alerts.
2. Navigate to **Notifications** (`/notifications`) to inspect historical alerts, filter by priority (`CRITICAL`, `HIGH`, `MEDIUM`), or trigger deadline scans manually.

---

## 10. Audit Trail & Compliance Log
1. Authorized HR Admins navigate to **Audit Trail** (`/dashboard/audit`).
2. Search and filter immutable log history by Date Range, Action, Entity, or Actor.
3. Click **View Meta** on any entry to inspect sanitized event payloads.
