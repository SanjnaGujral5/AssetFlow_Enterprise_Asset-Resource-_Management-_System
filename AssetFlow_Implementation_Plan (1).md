# AssetFlow — Complete Implementation Plan
### Enterprise Asset & Resource Management System — Hackathon Build Plan

---

## 1. Complete Feature / Module Breakdown

| # | Module | Core Capabilities |
|---|--------|-------------------|
| 1 | **Auth** | Employee-only signup, login, forgot password, session/JWT validation |
| 2 | **Dashboard** | KPI cards, overdue-vs-upcoming split, quick actions |
| 3 | **Organization Setup** (Admin) | Departments (with hierarchy), Asset Categories (with dynamic fields), Employee Directory + role promotion |
| 4 | **Asset Registry** | Asset CRUD, auto Asset Tag, search/filter, per-asset history (allocation + maintenance) |
| 5 | **Allocation & Transfer** | Allocate, block double-allocation, Transfer Request workflow, Return flow with condition notes, overdue auto-flagging |
| 6 | **Resource Booking** | Calendar view, overlap validation, booking status lifecycle, cancel/reschedule, reminders |
| 7 | **Maintenance** | Raise request, approval workflow, auto asset-status sync, technician assignment, history |
| 8 | **Audit** | Audit cycles, auditor assignment, per-asset verification, auto discrepancy report, cycle close (locks + status updates) |
| 9 | **Reports & Analytics** | Utilization trends, maintenance frequency, retirement-due list, department summary, booking heatmap, export |
| 10 | **Notifications & Activity Logs** | Event-driven notifications, full audit trail of actions |

This maps 1:1 to the 10 screens in the PDF — nothing added, nothing dropped.

---

## 2. User Roles & Exact Permissions

| Capability | Admin | Asset Manager | Department Head | Employee |
|---|:---:|:---:|:---:|:---:|
| Signup / self-select role | ❌ (roles never self-assigned) | ❌ | ❌ | ✅ (Employee only) |
| Promote Employee → Dept Head / Asset Manager | ✅ | ❌ | ❌ | ❌ |
| Manage Departments / Categories | ✅ | ❌ | ❌ | ❌ |
| View org-wide analytics | ✅ | Partial (asset-focused) | Dept-only | ❌ |
| Register asset | ❌ | ✅ | ❌ | ❌ |
| Allocate asset | ❌ | ✅ | Approve within dept | Request only |
| Approve transfer | ❌ | ✅ | ✅ (dept-scope) | ❌ |
| Approve maintenance | ❌ | ✅ | ❌ | ❌ |
| Raise maintenance request | ✅ | ✅ | ✅ | ✅ (on own asset) |
| Book shared resource | ✅ | ✅ | ✅ (on behalf of dept) | ✅ |
| Create/assign audit cycle | ✅ | ✅ (as authorized) | ❌ | ❌ |
| Act as auditor / verify assets | ✅ | ✅ | If assigned | If assigned |
| View own allocations | ✅ | ✅ | ✅ | ✅ |

Role is stored server-side only and changed exclusively via the Employee Directory promotion action (Screen 3, Tab C) — enforced at the API layer, never trusted from client input.

---

## 3. Complete Application Workflow

```
Signup (Employee) → Admin sets up Departments/Categories → Admin promotes
select Employees to Dept Head / Asset Manager → Asset Manager registers
Asset (status = Available) → Asset allocated to Employee/Dept OR flagged
shared/bookable →
   ├─ If allocation attempted on a held asset → blocked → Transfer Request
   │  → Approval (Asset Mgr / Dept Head) → Re-allocated (history updated)
   ├─ Shared resource → Booking with overlap validation → status lifecycle
   │  (Upcoming → Ongoing → Completed / Cancelled)
   ├─ Maintenance raised by holder → Pending → Approved/Rejected →
   │  (on Approve: asset → Under Maintenance) → Technician Assigned →
   │  In Progress → Resolved (asset → Available)
   └─ Return flow → condition check-in → asset → Available
Periodically: Admin/Asset Manager creates Audit Cycle → assigns auditors →
auditors verify each in-scope asset (Verified/Missing/Damaged) →
discrepancy report auto-generated → Close Cycle → statuses updated
  (e.g., confirmed-missing → Lost)
Throughout: overdue returns/bookings/maintenance auto-flagged →
Notifications + Activity Log + Dashboard KPIs + Reports
```

---

## 4. Recommended Tech Stack (fast, hackathon-realistic)

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS (utility-first, fast to theme for a premium ERP look)
- shadcn/ui (Radix-based) for tables, dialogs, dropdowns, calendars — avoids building primitives from scratch
- React Router v6
- TanStack Query (server state/caching) + Zustand (lightweight client/UI state — avoid Redux overhead)
- React Hook Form + Zod (forms + validation, shared schema style with backend)
- Recharts (dashboard/reports charts)

**Backend**
- Node.js + Express + TypeScript (fastest to iterate on in a hackathon; same language as frontend)
- Prisma ORM (schema-first, fast migrations, great DX, generates types)
- PostgreSQL (relational integrity matters a lot here — overlaps, FK-heavy schema)
- JWT auth (access token + refresh token), bcrypt for passwords
- Zod for request validation (shared validation mental model with frontend)
- node-cron (or simple scheduled job) for overdue detection / reminders

**Infra / Dev speed**
- Single monorepo (`/client`, `/server`) — simplest for a hackathon
- Docker Compose for Postgres locally (optional but recommended)
- Seed script with demo data (departments, categories, users, assets) so judges see a populated system instantly

**Why this stack:** everyone on a hackathon team can move fast in TS end-to-end, Prisma removes most schema/migration pain, Postgres gives you real transactional guarantees for the two trickiest rules (no double-allocation, no booking overlap), and shadcn/ui gets you an enterprise-grade look without a design system built from zero.

---

## 5. Database Schema (models & relationships)

**Core entities**

- **User** — id, name, email, passwordHash, role (`EMPLOYEE | DEPT_HEAD | ASSET_MANAGER | ADMIN`), departmentId (FK), status (Active/Inactive), createdAt
- **Department** — id, name, headUserId (FK → User, nullable), parentDepartmentId (self-FK, nullable), status
- **AssetCategory** — id, name, customFieldsSchema (JSON — e.g. warranty period), status
- **Asset** — id, assetTag (auto, unique, e.g. AF-0001), name, categoryId (FK), serialNumber, acquisitionDate, acquisitionCost, condition, location, photoUrl, isBookable (bool), status (enum: Available/Allocated/Reserved/UnderMaintenance/Lost/Retired/Disposed), currentHolderUserId (FK, nullable), currentHolderDeptId (FK, nullable), createdAt
- **Allocation** — id, assetId (FK), holderUserId (FK, nullable), holderDeptId (FK, nullable), allocatedAt, expectedReturnDate, actualReturnDate (nullable), returnConditionNotes, status (`ACTIVE | RETURNED | OVERDUE`)
- **TransferRequest** — id, assetId (FK), fromUserId, toUserId, requestedById, status (`REQUESTED | APPROVED | REJECTED | COMPLETED`), approvedById, createdAt
- **Booking** — id, resourceAssetId (FK, isBookable=true), bookedById (FK), departmentId (nullable, if booked on behalf of dept), startTime, endTime, status (`UPCOMING | ONGOING | COMPLETED | CANCELLED`), createdAt
- **MaintenanceRequest** — id, assetId (FK), raisedById (FK), issueDescription, priority (`LOW|MEDIUM|HIGH`), photoUrl, status (`PENDING|APPROVED|REJECTED|TECHNICIAN_ASSIGNED|IN_PROGRESS|RESOLVED`), approvedById, technicianName, createdAt, resolvedAt
- **AuditCycle** — id, scopeDepartmentId (nullable), scopeLocation (nullable), startDate, endDate, status (`OPEN|CLOSED`), createdById
- **AuditCycleAuditor** — id, auditCycleId (FK), auditorUserId (FK)
- **AuditItem** — id, auditCycleId (FK), assetId (FK), verifiedById, result (`VERIFIED|MISSING|DAMAGED`), notes, verifiedAt
- **DiscrepancyReport** — id, auditCycleId (FK), assetId (FK), type (`MISSING|DAMAGED`), resolutionStatus (`OPEN|RESOLVED`)
- **Notification** — id, userId (FK), type, message, isRead, relatedEntityType, relatedEntityId, createdAt
- **ActivityLog** — id, actorUserId (FK), action, entityType, entityId, metadata (JSON), createdAt

**Key relationships**
- Department ↔ Department (self-referential hierarchy)
- User → Department (many-to-one), Department → headUser (one-to-one-ish, nullable FK)
- Asset → AssetCategory (many-to-one)
- Asset → Allocation (one-to-many, but only one `ACTIVE` allocation enforced at app+DB level)
- Asset → Booking (one-to-many; overlap validated per resource on insert)
- Asset → MaintenanceRequest (one-to-many)
- AuditCycle → AuditItem → Asset (many-to-many through AuditItem)
- All major actions → ActivityLog (polymorphic-style entity reference)

**Integrity rules enforced in DB + service layer**
- Partial unique constraint / application-transaction check: only one `Allocation` with `status=ACTIVE` per `assetId`.
- Booking overlap: on insert, check `NOT (newStart >= existingEnd OR newEnd <= existingStart)` for same `resourceAssetId` and status in (`UPCOMING`,`ONGOING`) — reject if any match.
- Maintenance approval is the only trigger that flips Asset.status → `UnderMaintenance`; Resolved is the only trigger that flips it back.

---

## 6. Backend API / Module Architecture

Layered per module: `route → controller → service → prisma`. Each module below is self-contained and reusable.

```
/server
  /src
    /modules
      /auth         (signup, login, forgot-password, refresh)
      /users         (employee directory, role promotion — admin only)
      /departments
      /categories
      /assets        (register, search/filter, history)
      /allocations   (allocate, return, conflict check)
      /transfers     (request, approve, reject)
      /bookings      (create, overlap check, cancel/reschedule)
      /maintenance   (raise, approve/reject, assign tech, resolve)
      /audits        (create cycle, assign auditors, verify, close)
      /reports       (aggregation endpoints)
      /notifications
      /activity-logs
    /middleware      (authGuard, roleGuard(...roles), errorHandler, validate(zodSchema))
    /jobs            (overdue-checker cron: allocations, bookings, maintenance SLAs)
    /lib             (prisma client, jwt utils)
```

Representative endpoints:

```
POST   /auth/signup                 (role forced to EMPLOYEE server-side)
POST   /auth/login
POST   /users/:id/promote           (ADMIN only)
POST   /assets                      (ASSET_MANAGER)
GET    /assets?search=&status=&categoryId=&departmentId=
POST   /allocations                 (conflict check → 409 + holder info if blocked)
POST   /transfers                   /transfers/:id/approve
POST   /bookings                    (overlap check → 409 if conflict)
POST   /maintenance                 /maintenance/:id/approve
POST   /audits                      /audits/:id/items  /audits/:id/close
GET    /dashboard/kpis
GET    /reports/utilization | /reports/maintenance-frequency | ...
```

RBAC enforced via a `roleGuard(['ADMIN','ASSET_MANAGER'])` middleware on every mutating route — never trust the frontend for permission checks.

---

## 7. Frontend Page & Component Structure

```
/client/src
  /pages
    /auth            Login.tsx, Signup.tsx, ForgotPassword.tsx
    /dashboard        Dashboard.tsx
    /org-setup         Departments.tsx, Categories.tsx, EmployeeDirectory.tsx (tabs)
    /assets            AssetList.tsx, AssetDetail.tsx, RegisterAsset.tsx
    /allocations       AllocationBoard.tsx, TransferRequests.tsx
    /bookings          ResourceCalendar.tsx, MyBookings.tsx
    /maintenance       MaintenanceQueue.tsx, RaiseRequest.tsx
    /audits            AuditCycles.tsx, AuditCycleDetail.tsx, DiscrepancyReport.tsx
    /reports           Reports.tsx
    /notifications     NotificationsCenter.tsx, ActivityLog.tsx
  /components
    /ui                (shadcn primitives: Button, Dialog, Table, Badge, Tabs, Select, Calendar...)
    /shared             KpiCard.tsx, StatusBadge.tsx, DataTable.tsx, ConflictBanner.tsx,
                        RoleGuardedRoute.tsx, PageHeader.tsx, EmptyState.tsx
  /features             (per-module hooks: useAssets.ts, useBookings.ts... wrapping TanStack Query)
  /store                 authStore.ts (Zustand)
  /lib                    apiClient.ts, permissions.ts, dateOverlap.ts
  /types                  shared TS types (mirroring Prisma models)
```

`StatusBadge` and `DataTable` are reused across Assets, Bookings, Maintenance, and Audits — this is the main "reusability" win for the judges to see.

---

## 8. Role-Based Access Control Design

- **Server is source of truth.** JWT payload carries `userId` + `role`; every mutating route wrapped in `roleGuard([...])`.
- **Frontend mirrors it for UX only:** a `permissions.ts` map (`canApproveMaintenance(role)`, `canPromoteUser(role)`, etc.) drives conditional rendering of buttons/menus, and `RoleGuardedRoute` blocks page access — but this is convenience, not security.
- **Department scoping:** Department Head endpoints additionally filter by `req.user.departmentId` at the service layer (e.g., can only approve transfers where `asset.currentHolderDeptId === user.departmentId`).
- **Promotion is a privileged, logged action:** `POST /users/:id/promote` is Admin-only, writes an `ActivityLog` entry, and is the *only* code path that can change `User.role`.

---

## 9. Asset Lifecycle State Design

**States:** `Available | Allocated | Reserved | Under Maintenance | Lost | Retired | Disposed`

**Allowed transitions:**

```
Available      → Allocated        (on successful Allocation)
Available      → Reserved         (on Booking created, if resource-type)
Available      → Under Maintenance (on Maintenance request APPROVED)
Allocated      → Available        (on Return processed)
Allocated      → Under Maintenance (holder raises + approved maintenance)
Reserved       → Available        (on Booking completed/cancelled)
Under Maintenance → Available     (on Maintenance RESOLVED)
Under Maintenance → Retired       (Admin/Asset Manager manual decision, e.g. beyond repair)
Available/Allocated → Lost        (via confirmed-missing Audit discrepancy on Cycle Close)
Any non-terminal → Retired        (manual, Asset Manager/Admin)
Retired         → Disposed        (manual, Admin)
```

All transitions are enforced in a single `AssetStateService.transition(assetId, targetState, reason)` function with an explicit allow-list map (`{fromState: [allowedToStates]}`) — this keeps the rules in exactly one place and is trivial to unit-test, which will score well in a hackathon review.

---

## 10. Step-by-Step Development Roadmap

**Phase 0 — Setup (½ day)**
1. Monorepo scaffold, Prisma + Postgres, base Express app, base Vite+React+Tailwind+shadcn app, shared TS types folder.

**Phase 1 — Foundation (Day 1)**
2. Auth module (signup=Employee only, login, JWT) + `authStore` + protected routing shell.
3. Department, AssetCategory, Employee Directory (CRUD) + role promotion — this unlocks everything downstream.
4. Global layout: sidebar nav (role-aware), `RoleGuardedRoute`, `DataTable`, `StatusBadge`.

**Phase 2 — Core Asset Engine (Day 1–2)**
5. Asset registration + auto asset-tag generator + search/filter + Asset Detail page.
6. `AssetStateService` (lifecycle transition engine) — build and unit-test this early since everything depends on it.
7. Allocation module + double-allocation conflict check + Return flow.
8. Transfer Request workflow (Requested → Approved → Re-allocated).

**Phase 3 — Booking & Maintenance (Day 2)**
9. Resource Booking: calendar UI + overlap validation service + status lifecycle + cancel/reschedule.
10. Maintenance module: raise → approve/reject → technician assign → in progress → resolved, wired to `AssetStateService`.

**Phase 4 — Audit & Oversight (Day 2–3)**
11. Audit Cycle creation, auditor assignment, per-asset verification UI, auto discrepancy report generation, Close Cycle (bulk status updates).
12. Notifications (event hooks fired from each module) + Activity Log (single middleware/interceptor writing on every mutation).

**Phase 5 — Insight Layer (Day 3)**
13. Dashboard KPIs (aggregation queries + overdue cron job).
14. Reports & Analytics (Recharts: utilization, maintenance frequency, heatmap, dept summary) + CSV export.

**Phase 6 — Polish (final stretch)**
15. Seed script with realistic demo data across all departments/roles.
16. UI pass: empty states, loading states, toasts, responsive check, consistent premium theme (spacing/typography/color tokens).
17. End-to-end demo script rehearsal: signup → promote → register asset → allocate → block double-allocation → transfer → book resource → overlap block → maintenance approval → audit cycle → dashboard/reports.

This order is deliberate: **Org Setup → Assets → Allocation/Transfer → Booking/Maintenance → Audit → Analytics**, because each phase's data depends on the previous one, and it lets you have a demoable slice after every single phase (important if you run out of time).

---

### Open questions before we start building (your call, not blockers)
- Any preference on hosting/deploy target for the demo (Vercel + Railway/Render, or fully local for judging)?
- Should notifications be real-time (WebSocket/polling) or is a simple polling refresh acceptable for the hackathon scope?
- File uploads (asset photos, maintenance photos) — local disk storage acceptable, or do you want cloud storage (S3-style) wired in?

Once you confirm the plan (and answer the above if you have preferences), we'll start Phase 0 and go module by module, file by file.
