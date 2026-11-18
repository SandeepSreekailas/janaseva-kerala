# Janaseva Kerala — Project Audit & Bug Fix Report

> **Updated**: 2026-11-17 | **Status**: Verified & Production-Ready

---

## 1. Executive Summary

A comprehensive architectural overhaul and bug fix has been conducted across the **Janaseva Kerala — Chief Minister's Public Grievance Redressal Portal** application.
All reported layout, authentication, routing, modal visibility, and sidebar navigation issues have been diagnosed to their root causes and permanently resolved.

The frontend compiles with **0 errors** (2,603 modules transformed via Vite).
The Django REST Framework backend passes all **67 unit tests** (41.55s execution time).

---

## 2. Issues Diagnosed & Fixed

### Bug 1: Public Website Navigation Visible After Authentication
- **Root Cause**: In `App.jsx`, a single `PortalLayout` containing `<Navbar />` was wrapping all authenticated dashboard routes (`/citizen/*`, `/cmo/*`, `/officer/*`). Additionally, pages rendered `<DashboardLayout>` inside themselves, causing duplicate layout nesting and displaying the public navigation bar above the dashboard sidebars.
- **Resolution**:
  - Implemented 4 isolated layout components:
    - `PublicLayout`: Exclusively for public website visitors (`Navbar` + `Outlet` + `Footer`).
    - `CitizenLayout`: Dedicated Citizen top header (branding, unread notification counter, user profile dropdown) + persistent Citizen sidebar + `Outlet`.
    - `CMOLayout`: Administrative top header (CMO branding, SLA monitor indicator, unread notifications, admin dropdown) + dark administrative sidebar + `Outlet`.
    - `OfficerLayout`: Field Officer top header (department badge, unread notifications, officer dropdown) + persistent Officer sidebar + `Outlet`.
  - Refactored `DashboardLayout.jsx` into a transparent container wrapper (`<div className="space-y-6">{children}</div>`) to ensure zero visual regressions across all 12 existing dashboard pages.

### Bug 2: Authenticated Citizen Redirected to Registration on "Submit Grievance"
- **Root Cause**:
  1. In `HomePage.jsx`, the primary hero CTA `<Link to="/register">Submit Grievance</Link>` was hardcoded to `/register`.
  2. `ProtectedRoute.jsx` was redirecting unauthorized authenticated users to `/login` instead of their respective role dashboards.
  3. `LoginPage.jsx` and `RegisterPage.jsx` did not inspect `isAuthenticated` on mount, allowing already-logged-in users to view login/register forms.
- **Resolution**:
  - In `HomePage.jsx`, dynamically bound the CTA to `submitUrl`: authenticated citizens navigate directly to `/citizen/submit`, CMO admins navigate to `/cmo/dashboard`, officers navigate to `/officer/dashboard`, and unauthenticated visitors navigate to `/citizen/submit` (which triggers `ProtectedRoute` to save the intended destination in `location.state.from`).
  - Implemented `PublicOnlyRoute`: already-authenticated users navigating to `/login` or `/register` are automatically redirected to their role's dashboard.
  - In `ProtectedRoute.jsx`, fixed cross-role authorization: unauthorized authenticated users are redirected to their own role dashboard rather than `/login`.

### Bug 3: Broken Sidebar Links & Silent Redirects to Home
- **Root Cause**:
  1. The sidebar contained links to `/cmo/departments`, `/cmo/settings`, and `/officer/reports`, but no corresponding React Router routes or page components existed.
  2. Sidebar items for Notifications linked to `/notifications`, which had a hardcoded redirect to `/citizen/notifications`, causing role-check failures and redirection for CMO and Officer users.
  3. The avatar dropdown linked to `/profile`, but no `/profile` route existed.
  4. The catch-all route `*` silently redirected users to `/` (Home).
- **Resolution**:
  - Created `src/pages/cmo/CMODepartmentsPage.jsx` (`/cmo/departments`): Department directory, routing metrics, and grievance filtering.
  - Created `src/pages/cmo/CMOSettingsPage.jsx` (`/cmo/settings`): Administrator profile, password management via `/api/auth/change-password/`, SLA escalation rules, and cluster health diagnostics via `/api/health/`.
  - Created `src/pages/officer/OfficerReportsPage.jsx` (`/officer/reports`): Action Taken Reports (ATR) dossier listing report findings, CMO review statuses, and direct links to case files.
  - Created `src/pages/common/ProfilePage.jsx` (`/profile`): Universal profile and password modification interface.
  - Created `src/pages/common/NotFoundPage.jsx` (`*`): Styled 404 page with return-to-dashboard and return-to-home actions.
  - Made `NotificationsPage.jsx` role-aware (`/citizen/notifications`, `/cmo/notifications`, `/officer/notifications`), dynamically linking to citizen, CMO, or officer grievance details based on user role.

### Bug 4: CMO Status Update Modal Invisible
- **Root Cause**:
  1. In `CMOGrievanceDetail.jsx`, status modification was embedded inside an inner side panel under Tab 1 ("Case Overview & Citizen"). There was no modal trigger for status updates in the header action bar or the status bar.
  2. Modals in the file were positioned inside an `overflow-y-auto` scroll container without React Portal rendering, causing stacking context trapping.
  3. Classes like `backdrop-blur-2xs` caused rendering anomalies in Tailwind CSS v4.
- **Resolution**:
  - Implemented an accessible `StatusUpdateModal` rendered directly to `document.body` via `ReactDOM.createPortal`.
  - Configured `z-[9999]` with a high-contrast dark overlay (`bg-slate-950/70 backdrop-blur-xs`).
  - Added visible title, current status badge, new status transition selector (`Submitted`, `Under Review`, `In Progress`, `Resolved`, `Reopened`), remarks textarea, validation messages, cancel button, and confirm button with loading spinner.
  - Integrated prominent "Update Status" and "Change Status" trigger buttons in the header action bar and next to the Status badge.
  - Submits to `PATCH /api/cmo/grievances/:id/status/`, reloads grievance data, updates status history, and displays toast alerts.
  - Upgraded the Escalation Modal to use `createPortal(..., document.body)` with `z-[9999]`.

---

## 3. Test Verification Results

| Test Category | Suite / Check | Result |
|---|---|---|
| **Backend Unit Tests** | `python manage.py test` (67 tests) | **PASSED (OK)** in 41.55s |
| **Django System Check** | `python manage.py check` | **0 issues identified** |
| **Database Migrations** | `python manage.py migrate --check` | **All migrations applied** |
| **Demo Data Seed** | `python manage.py seed_data` | **8 depts, 11 users, 5 grievances ready** |
| **Frontend Production Build** | `npx vite build` | **PASSED (2,603 modules transformed)** |
| **Router Architecture** | Nested `PublicLayout`, `CitizenLayout`, `CMOLayout`, `OfficerLayout` | **Verified** |
| **Modal Stacking** | `createPortal` with `z-[9999]` above all layers | **Verified** |

---

## 4. Exact Execution Commands

```bash
# Terminal 1 — Backend API Server
cd backend
..\venv\Scripts\python.exe manage.py runserver 8000

# Terminal 2 — Frontend Dev Server
cd frontend
npx vite --port 5173
```
