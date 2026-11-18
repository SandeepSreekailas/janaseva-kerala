# Janaseva Kerala — System Architecture

> **Technical Architecture, Component Design, and Security Specifications**  
> *Chief Minister's Public Grievance Redressal Portal*

---

> [!WARNING]
> ### Prototype Evaluation Disclaimer
> **This system is an evaluation prototype developed for WhiteMatrix Software Solutions.**  
> It is **NOT** an official platform of the Government of Kerala. All architectural choices and workflows represent an enterprise reference implementation.

---

## 1. Architectural Philosophy & Overview

Janaseva Kerala is built upon a **decoupled, multi-tier client-server architecture**. The frontend is engineered as a high-performance **Single Page Application (SPA)** using **React 19** and **Vite**, communicating strictly via JSON over REST with a robust **Django 4.2 LTS** and **Django REST Framework (DRF)** backend.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                               │
│  React 19 SPA * React Router v7 * Tailwind CSS 4 * Recharts * Axios    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON / REST (Bearer JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SECURITY & GATEWAY LAYER                          │
│  CORS Middleware * SimpleJWT Authentication * Custom RBAC Permissions  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION CORE (DJANGO)                         │
│  apps.accounts      apps.departments     apps.grievances               │
│  apps.ai_assistant  apps.notifications   apps.enquiries apps.analytics │
└──────────────────┬────────────────────────────────┬────────────────────┘
                   │                                │
                   ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│          PERSISTENCE LAYER           │ │        AI ADVISORY CORE       │
│  Neon PostgreSQL / SQLite (Local)    │ │  Google Gemini 2.5 Flash      │
│  Django ORM with Atomic Transactions │ │  Heuristic Rule-Based Fallback│
└──────────────────────────────────────┘ └───────────────────────────────┘
```

The design emphasizes:
- **Strict Separation of Concerns**: The backend serves strictly as a stateless API gateway with no HTML rendering for core business flows.
- **Role-Based Access Control (RBAC)**: Enforced both on the client (route-guarding components) and at the API level (custom DRF permission classes).
- **Graceful Degradation**: External dependencies (such as Google Gemini AI or Cloudinary media storage) operate behind defensive fallback abstractions to guarantee 100% uptime.
- **Auditability**: Every status transition, departmental reassignment, and administrative remark creates an immutable record in audit models (`GrievanceHistory`, `InternalRemark`).

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (React 19 + Vite)"]
        UI_Citizen["Citizen Portal\n(Submit, Track, Feedback)"]
        UI_Officer["Officer Portal\n(Queue, Review, ATR)"]
        UI_CMO["CMO Administration\n(Triage, Escalate, Analytics)"]
        UI_Public["Public Transparency\n(Track, Directory, FAQ)"]
    end

    subgraph Gateway ["Security & API Routing Layer"]
        CORS["CORS Middleware"]
        AuthInterceptor["Axios JWT Interceptor\n(Auto-refresh 401)"]
        DRF_Router["Django REST Framework\nURL Dispatcher"]
        PermEngine["RBAC Permission Matrix\n(IsCitizen, IsOfficer, IsCMOAdmin)"]
    end

    subgraph Services ["Django Application Services"]
        AppAccounts["accounts\n(Custom User, Auth, JWT)"]
        AppDepts["departments\n(Directory & Catalog)"]
        AppGrievances["grievances\n(Core Workflow, ATR, Feedback)"]
        AppAI["ai_assistant\n(Gemini 2.5 Flash + Fallback)"]
        AppNotifs["notifications\n(In-app user alerts)"]
        AppEnquiries["enquiries\n(Citizen contact pipeline)"]
        AppAnalytics["analytics\n(Statewide aggregations)"]
    end

    subgraph Data ["Data & Storage Tier"]
        DB[(PostgreSQL / SQLite\nRelational Database)]
        MediaStorage["Local Media / Cloudinary\n(Evidence & Documents)"]
    end

    subgraph External ["External Services"]
        GeminiAPI["Google Gemini 1.5 Flash API"]
    end

    Client -->|HTTP REST Requests| AuthInterceptor
    AuthInterceptor --> CORS
    CORS --> DRF_Router
    DRF_Router --> PermEngine
    PermEngine --> Services

    AppAccounts --> DB
    AppDepts --> DB
    AppGrievances --> DB
    AppGrievances --> MediaStorage
    AppNotifs --> DB
    AppEnquiries --> DB
    AppAnalytics --> DB

    AppAI -->|Prompt JSON Payload| GeminiAPI
    GeminiAPI -.->|Classification Result| AppAI
```

---

## 3. Frontend Architecture

The frontend is constructed using a modern React 19 architecture structured around domain modules, contextual state, and unified API clients:

```
frontend/src/
├── api/                  # Modular Axios API service abstractions
│   ├── axios.js          # Base client with auth token & 401 refresh interceptors
│   ├── auth.js           # Login, register, logout, profile endpoints
│   ├── grievances.js     # Citizen grievance CRUD, tracking, and feedback
│   ├── cmo.js            # CMO triage, assignment, remark, and ATR reviews
│   ├── officer.js        # Officer queue, status progression, and ATR submission
│   └── misc.js           # Departments, notifications, contact, and AI endpoints
├── components/           # Reusable UI building blocks
│   ├── common/           # StatusBadge, PriorityBadge, LoadingSpinner, ProtectedRoute
│   └── layout/           # Navbar, Footer, Sidebar, DashboardLayout, PublicLayout
├── contexts/             # Global application state
│   └── AuthContext.jsx   # Current user, authentication state, login/logout handlers
├── pages/                # Screen-level route views
│   ├── auth/             # LoginPage, RegisterPage
│   ├── citizen/          # CitizenDashboard, SubmitGrievancePage, GrievanceListPage, GrievanceDetailPage, NotificationsPage
│   ├── cmo/              # CMODashboard, CMOGrievanceList, CMOGrievanceDetail, AnalyticsPage
│   ├── officer/          # OfficerDashboard, OfficerGrievanceList, OfficerGrievanceDetail
│   └── public/           # HomePage, AboutPage, HowItWorksPage, DepartmentsPage, ContactPage, FAQPage, TrackGrievancePage
├── App.jsx               # React Router 7 declarative routing matrix
├── index.css             # Tailwind CSS 4 setup and color tokens
└── main.jsx              # React root entrypoint
```

### 3.1 Authentication & Axios Interceptor Pipeline
- **Token Persistence**: Tokens are stored in browser `localStorage` under `access_token` and `refresh_token`.
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <access_token>` to every outbound HTTP call.
- **Response Interceptor (401 Handling)**:
  1. Intercepts `401 Unauthorized` responses.
  2. Queues parallel requests while requesting a new access token via `/api/auth/token/refresh/`.
  3. Re-dispatches original requests transparently upon receiving new credentials.
  4. If the refresh token has expired or is blacklisted, gracefully flushes credentials and redirects to `/login`.

```mermaid
sequenceDiagram
    participant Component as React Component
    participant Axios as Axios Interceptor
    participant Backend as Django API
    participant Storage as LocalStorage

    Component->>Axios: api.get('/api/grievances/')
    Axios->>Storage: Read access_token
    Axios->>Backend: GET /api/grievances/ [Bearer Token]
    Backend-->>Axios: 401 Unauthorized (Expired)
    Axios->>Storage: Read refresh_token
    Axios->>Backend: POST /api/auth/token/refresh/ {refresh}
    alt Refresh Successful
        Backend-->>Axios: 200 OK {access: "new_token"}
        Axios->>Storage: Store new access_token
        Axios->>Backend: Retry GET /api/grievances/ [New Token]
        Backend-->>Component: 200 OK [Grievance Data]
    else Refresh Expired
        Backend-->>Axios: 401 Unauthorized (Invalid Refresh)
        Axios->>Storage: Clear tokens
        Axios-->>Component: Redirect to /login
    end
```

### 3.2 Role-Guarded Navigation (`ProtectedRoute`)
React Router paths are shielded by a custom `ProtectedRoute` component that evaluates:
1. **Authentication status**: Verifies whether an authenticated session exists; redirects unauthenticated users to `/login`.
2. **Role matching**: Ensures the user's role (`citizen`, `officer`, `cmo_admin`) matches the route's permission profile. Non-matching users are redirected to their authorized dashboard.

---

## 4. Backend Application Architecture

The Django backend is segmented into 7 modular domain applications within `backend/apps/`:

### 4.1 `apps.accounts`
- **Custom User Model**: `User` inherits from `AbstractBaseUser` and `PermissionsMixin`.
- **Email-As-Username**: Utilizes unique `email` for all authentication (passwords hashed using PBKDF2 with SHA256).
- **Role TextChoices**: `citizen`, `cmo_admin`, `officer`.
- **Department Association**: Foreign key linking `officer` accounts to their respective `Department`.

### 4.2 `apps.departments`
- **Department Catalog**: Manages Kerala government departments (`PWD`, `HLT`, `EDU`, `LSG`, `WRD`, `KSEB`, `TRN`, `REV`).
- **Access Policy**: Read operations are publicly accessible (`AllowAny`); modifications are restricted to `IsCMOAdmin`.

### 4.3 `apps.grievances`
- **Core Life Cycle**: Enforces state machines for grievances (`Submitted` → `Under Review` → `In Progress` → `Resolved` / `Reopened`).
- **Sequential Ref Number**: Atomic transaction generator yielding `JK-YYYY-XXXXXX`.
- **Audit Trails**: Automatically logs state changes to `GrievanceHistory`.
- **Department Assignment**: Tracks routing to departments and nodal officers with assignment notes.
- **Action Taken Report (ATR)**: Formal investigation report submitted by officers, reviewed by CMO admins.
- **Citizen Feedback**: Single 1–5 star rating and comment per resolved grievance.
- **Internal Remarks**: Confidential notes added by CMO administrators.

### 4.4 `apps.ai_assistant`
- **Advisory Service**: `GeminiService` encapsulates communication with Google Gemini 2.5 Flash via modern `google-genai` SDK.
- **Schema Enforcement**: Requests strictly structured JSON output for summary, department, category, priority, and reasoning.
- **Database Validation**: Validates predictions against active departments and categories in PostgreSQL.
- **Defensive Fallback**: Full keyword-matching heuristic engine that takes over if API credentials are unavailable, rate-limited, or network is offline.

### 4.5 `apps.notifications`
- **In-App Messaging**: Generates targeted alerts for citizens (e.g. status updates) and officers (e.g. new assignments).
- **State Tracking**: Unread/read status tracking with bulk mark-all-read capabilities.

### 4.6 `apps.enquiries`
- **Public Pipeline**: Handles general citizen contact inquiries submitted through the public portal.

### 4.7 `apps.analytics`
- **Statewide Aggregation**: Aggregates complaint volume across districts, categories, departments, and monthly trends using Django ORM aggregation expressions (`Count`, `Avg`, `TruncMonth`).

---

## 5. End-to-End Data Flow Workflows

### 5.1 Citizen Grievance Submission with AI Advisory
```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant UI as React Submission Form
    participant AIAPI as /api/ai/analyze/
    participant Gemini as Gemini AI / Fallback
    participant GrievanceAPI as /api/grievances/
    participant DB as Relational Database
    participant NotifService as Notification Service

    Citizen->>UI: Inputs Subject, Description, District
    Citizen->>UI: Clicks "Analyze with AI Assistant"
    UI->>AIAPI: POST {subject, description, district}
    AIAPI->>Gemini: Prompt classification & summary
    Gemini-->>AIAPI: {suggested_department, suggested_category, suggested_priority, summary}
    AIAPI-->>UI: Return AI recommendations
    UI->>Citizen: Auto-fills suggestions (editable by citizen)
    Citizen->>UI: Confirms form & attaches evidence files
    UI->>GrievanceAPI: POST /api/grievances/ (Multipart Form Data)
    GrievanceAPI->>DB: Atomic Tx: Generate JK-YYYY-XXXXXX & save Grievance
    GrievanceAPI->>DB: Save Attachments
    GrievanceAPI->>DB: Record initial GrievanceHistory ("Submitted")
    GrievanceAPI->>NotifService: Generate receipt notification for citizen
    GrievanceAPI-->>UI: 201 Created {reference_number, id, status}
    UI->>Citizen: Displays success screen with tracking link
```

### 5.2 CMO Assignment, Officer Investigation, and ATR Approval
```mermaid
sequenceDiagram
    autonumber
    actor CMO as CMO Admin
    actor Officer as Department Officer
    participant Backend as Django API
    participant DB as Relational Database
    actor Citizen

    CMO->>Backend: POST /api/cmo/grievances/{id}/assign/ {department_id, officer_id, due_date}
    Backend->>DB: Update DepartmentAssignment & set Grievance status="Under Review"
    Backend->>DB: Create GrievanceHistory entry
    Backend->>DB: Create Officer Notification
    Backend-->>CMO: 200 OK (Assigned)

    Officer->>Backend: GET /api/officer/grievances/{id}/
    Backend-->>Officer: Grievance details + citizen attachments
    Officer->>Backend: POST /api/officer/grievances/{id}/status/ {status: "In Progress"}
    Backend->>DB: Update status & append GrievanceHistory
    Backend->>DB: Notify Citizen of progress

    Officer->>Backend: POST /api/officer/grievances/{id}/report/ {report_text, attachment}
    Backend->>DB: Create ActionTakenReport (status: "Pending")
    Backend->>DB: Notify CMO Administrator
    Backend-->>Officer: 201 Created (ATR Submitted)

    CMO->>Backend: POST /api/cmo/reports/{id}/review/ {status: "Approved", remarks: "Satisfactory"}
    Backend->>DB: Update ATR status="Approved"
    Backend->>DB: Set Grievance status="Resolved", resolved_at=now()
    Backend->>DB: Append GrievanceHistory ("Resolved")
    Backend->>DB: Notify Citizen of resolution & prompt for feedback
    Backend-->>CMO: 200 OK (Grievance Resolved)

    Citizen->>Backend: POST /api/grievances/{id}/feedback/ {rating: 5, comments: "Pothole repaired quickly"}
    Backend->>DB: Save CitizenFeedback
    Backend-->>Citizen: 201 Created
```

---

## 6. Security & Authorization Architecture

### 6.1 Role-Based Permissions Matrix
Permissions are strictly validated at the DRF view level before query execution:

| API Namespace | Citizen | Department Officer | CMO Administrator | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| `/api/auth/register/` | Allowed | Allowed | Allowed | Allowed |
| `/api/auth/login/` | Allowed | Allowed | Allowed | Allowed |
| `/api/auth/me/` | Own Profile | Own Profile | Own Profile | Forbidden |
| `/api/departments/` [GET] | Allowed | Allowed | Allowed | Allowed |
| `/api/departments/` [POST/PUT/DEL] | Forbidden | Forbidden | Allowed | Forbidden |
| `/api/grievances/` [GET] | Own Grievances | Forbidden | Forbidden | Forbidden |
| `/api/grievances/` [POST] | Allowed | Forbidden | Forbidden | Forbidden |
| `/api/grievances/track/` | Allowed | Allowed | Allowed | Allowed |
| `/api/cmo/officers/*` | Forbidden | Forbidden | Full Access | Forbidden |
| `/api/cmo/*` | Forbidden | Forbidden | Full Access | Forbidden |
| `/api/officer/*` | Forbidden | Department Scope | Forbidden | Forbidden |
| `/api/analytics/*` | Forbidden | Forbidden | Full Access | Forbidden |

### 6.2 Token Security
- **Access Token**: Short-lived (2 hours) to minimize exposure windows.
- **Refresh Token**: 7-day lifetime with automatic rotation (`ROTATE_REFRESH_TOKENS = True`) and immediate blacklisting of used refresh tokens (`BLACKLIST_AFTER_ROTATION = True`).
- **Signature Algorithm**: HMAC-SHA256 keyed to a dedicated server environment secret.

### 6.3 Data Sanitization & Defensive Design
- **SQL Injection Prevention**: All queries utilize Django's parameterized Object-Relational Mapper (ORM). Raw SQL is strictly disallowed.
- **File Upload Safeguards**: Uploads are restricted by extension (PDF, JPG, JPEG, PNG, WEBP) and validated for size limits (maximum 10MB) to protect against denial-of-service and remote execution.
- **Cross-Origin Resource Sharing (CORS)**: Strict origin whitelisting via `django-cors-headers`. Defaults to `http://localhost:5173` and `http://127.0.0.1:5173` for development.
- **Confidential Information Shielding**: Internal remarks (`InternalRemark`) and administrative notes are excluded from Citizen and Public serializers.

---

## 7. Production Deployment & Scalability Architecture

```mermaid
flowchart LR
    User([Public Traffic]) --> Cloudflare[Cloudflare CDN & SSL]
    Cloudflare --> Nginx[Nginx Reverse Proxy]
    Nginx -->|Static Assets| WhiteNoise[WhiteNoise Compressed Storage]
    Nginx -->|API Requests| Gunicorn[Gunicorn WSGI Workers]
    Gunicorn --> DjangoCore[Django 4.2 Application Core]
    DjangoCore --> PostgreSQL[(Neon Managed PostgreSQL)]
    DjangoCore --> Cloudinary[(Cloudinary File Store)]
    DjangoCore --> GeminiCloud[Google Gemini AI API]
```

- **Static Asset Serving**: Integrated `WhiteNoise` compression with unique content hashing eliminates static file bottlenecks.
- **Database Scalability**: Fully compatible with serverless **Neon PostgreSQL** via `dj-database-url` with connection pooling (`conn_max_age=600`).
- **Horizontal Scaling**: Stateless backend design allows effortless scaling across multiple containerized Gunicorn/Uvicorn instances behind a standard load balancer.
