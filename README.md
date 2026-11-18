# Janaseva Kerala — Chief Minister's Public Grievance Redressal Portal

[![Django](https://img.shields.io/badge/Django-4.2_LTS-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Test Suite](https://img.shields.io/badge/Tests-67_Passed-brightgreen?style=for-the-badge)](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/06_Setup_and_Testing.md)

---

> [!WARNING]
> ### Prototype Evaluation Disclaimer
> **This system is an evaluation prototype developed for WhiteMatrix Software Solutions.**  
> It is **NOT** an official portal, service, or representation of the Government of Kerala, the Chief Minister's Office (CMO), or any statutory department. All names, designations, and government references are utilized strictly for realistic demonstration and architectural evaluation purposes.

---

## 1. Project Overview

**Janaseva Kerala** is a full-stack, enterprise-grade public grievance redressal web platform built to bridge the gap between citizens and state governance. Inspired by modern civic grievance systems like the Chief Minister's Public Grievance Redressal Cell (CMPGRC), Janaseva Kerala streamlines the lodging, tracking, investigating, and redressing of citizen complaints across all 14 revenue districts of Kerala.

The platform provides dedicated workspaces for:
1. **Citizens**: Lodging petitions, uploading evidence, receiving in-app alerts, tracking live investigation milestones via reference numbers (`JK-YYYY-XXXXXX`), and rating resolution quality.
2. **Department Nodal Officers**: Reviewing department-specific queues, updating ground investigation progress, and submitting formal **Action Taken Reports (ATRs)**.
3. **Chief Minister's Office (CMO) Administrators**: Statewide executive oversight, intelligent triage, departmental routing, confidential internal remarks, ATR scrutiny, SLA enforcement, priority escalations, and real-time analytics.
4. **AI Grievance Assistant**: Powered by **Google Gemini 1.5 Flash** with an offline heuristic fallback engine, offering real-time auto-suggestions for department, category, priority, and executive summaries.

---

## 2. Demo Credentials Quick Reference

For technical evaluation, the system includes pre-seeded demonstration accounts:

| Portal Tier | Email Address | Password | Role & Scope |
| :--- | :--- | :--- | :--- |
| **CMO Administrator** | `cmo@janaseva.kerala.gov.in` | `admin123` | **Chief Minister Office Administrator**<br>Statewide authority across all 14 districts and 8 departments. Full triage, ATR approval, internal remarks, and analytics. |
| **Department Officer** | `officer.pwd@janaseva.kerala.gov.in` | `officer123` | **Er. Rajesh Kumar — PWD Executive Engineer**<br>Departmental investigator for Public Works. Field progress updates and ATR submission. *(Additional officers available for `officer.hlt@...`, `officer.kseb@...`, `officer.wrd@...`, etc.)* |
| **Citizen** | `citizen@example.com` | `citizen123` | **Kavitha R Nair — Thiruvananthapuram Citizen**<br>Grievance submission, AI recommendations, live tracking, and satisfaction feedback. |

---

## 3. Technology Stack

| Layer | Technologies | Key Features |
| :--- | :--- | :--- |
| **Backend API** | Django 4.2 LTS, Django REST Framework 3.14 | Modular app architecture, ModelViewSets, serializers, custom permissions |
| **Authentication** | `rest_framework_simplejwt` | JWT authentication, rotating refresh tokens, token blacklisting |
| **API Documentation** | `drf-spectacular` | OpenAPI 3.0 schema generation, Swagger UI (`/api/docs/`), Redoc (`/api/redoc/`) |
| **Frontend SPA** | React 19, Vite 6, React Router DOM 7 | Fast HMR, component-driven UI, protected routes, context state management |
| **Styling & Icons** | Tailwind CSS 4, Lucide React | Kerala civic color theme (Emerald green, Navy blue, Gold accents), responsive layout |
| **Data Visualization**| Recharts 2 | Responsive analytics charts, monthly trends, district density breakdowns |
| **AI Engine** | Google Gemini 1.5 Flash (`google-generativeai`) | Structured JSON triage suggestions with zero-downtime heuristic rule fallback |
| **Database** | SQLite (Dev) / Neon PostgreSQL (Prod) | Relational schema, atomic transactions, row-level locking for ref generation |
| **Media & Static** | WhiteNoise, Cloudinary integration | Optimized static asset delivery and evidence document hosting |

---

## 4. Quick Start Guide (5 Minutes)

### 4.1 Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & npm
- **Git**

### 4.2 Backend Setup
```bash
# 1. Navigate to project root
cd janaseva-kerala

# 2. Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# 3. Install Python dependencies
pip install -r backend/requirements.txt

# 4. Configure environment file
# On Windows:
Copy-Item .env.example backend\.env
# On Linux/macOS:
# cp .env.example backend/.env

# 5. Apply database migrations
python backend/manage.py migrate

# 6. Seed demonstration data (8 departments, 11 users, 5 sample grievances)
python backend/manage.py seed_data

# 7. Start Django development server
python backend/manage.py runserver 8000
```
Backend API will be running at `http://127.0.0.1:8000/`.  
Interactive Swagger UI: `http://127.0.0.1:8000/api/docs/`.

### 4.3 Frontend Setup
```bash
# In a new terminal window:
cd janaseva-kerala/frontend

# 1. Install npm packages
npm install

# 2. Start Vite dev server
npm run dev
```
Frontend portal will be live at: 👉 **`http://localhost:5173/`**

---

## 5. Automated Test Suite

Janaseva Kerala includes **67 automated test cases** covering user authentication, permissions, grievance workflows, reference number generation, AI fallback engines, notifications, and analytics:

```bash
python backend/manage.py test apps
```

**Expected Result**:
```text
Found 67 test(s).
Creating test database for alias 'default'...
...................................................................
----------------------------------------------------------------------
Ran 67 tests in 42.506s

OK
Destroying test database for alias 'default'...
```

---

## 6. Project Architecture & Directory Layout

```
janaseva-kerala/
├── backend/
│   ├── config/                      # Root configuration (settings, URLs, WSGI)
│   ├── apps/                        # 7 Domain-Specific Applications
│   │   ├── accounts/                # User model, SimpleJWT auth, RBAC permissions, seed_data
│   │   ├── departments/             # Government departments catalog
│   │   ├── grievances/              # Core grievance engine, ATRs, assignments, feedback
│   │   ├── ai_assistant/            # Google Gemini 1.5 Flash + Heuristic fallback service
│   │   ├── notifications/           # In-app alerts and unread counters
│   │   ├── enquiries/               # Public contact inquiries pipeline
│   │   └── analytics/               # Statewide aggregation and trend calculations
│   ├── manage.py                    # Django management script
│   ├── requirements.txt             # Python packages
│   └── db.sqlite3                   # SQLite database
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios API clients with auto-refresh interceptors
│   │   ├── components/              # Reusable UI components & layouts
│   │   ├── contexts/                # AuthContext (JWT session state)
│   │   ├── pages/                   # Route views (auth, citizen, officer, cmo, public)
│   │   ├── App.jsx                  # React Router 7 declarative route tree
│   │   └── main.jsx                 # React root mount
│   ├── package.json                 # Node packages
│   └── vite.config.js               # Vite config
├── DOCUMENTATION/                   # Complete Technical Documentation
│   ├── 01_Project_Overview.md       # Mission, problem statement, feature matrix
│   ├── 02_System_Architecture.md    # Multi-tier design, sequence diagrams, security
│   ├── 03_Database_Design.md        # Relational ER diagram, table schemas, indexes
│   ├── 04_API_Documentation.md      # Complete REST API reference with JSON payloads
│   ├── 05_AI_Integration.md         # Gemini 1.5 Flash, prompts, fallback engine
│   ├── 06_Setup_and_Testing.md      # Installation, demo accounts, test execution
│   └── 07_User_Guide.md             # Role-based user manual for all 3 tiers
├── .env.example                     # Environment variables template
└── README.md                        # Project root documentation
```

---

## 7. REST API Endpoints Summary

| Module | Method | Endpoint | Description | Access |
| :--- | :---: | :--- | :--- | :--- |
| **System** | `GET` | `/api/health/` | Service health status | Public |
| **Docs** | `GET` | `/api/docs/` | Interactive Swagger UI | Public |
| **Auth** | `POST` | `/api/auth/register/` | Citizen self-registration | Public |
| **Auth** | `POST` | `/api/auth/login/` | JWT token login | Public |
| **Auth** | `POST` | `/api/auth/token/refresh/` | Rotate access token | Public |
| **Auth** | `GET` | `/api/auth/me/` | Current user profile | Authenticated |
| **Auth** | `POST` | `/api/auth/logout/` | Blacklist refresh token | Authenticated |
| **Departments** | `GET` | `/api/departments/` | List state departments | Public |
| **Grievances** | `GET` | `/api/grievances/` | List citizen's grievances | Citizen |
| **Grievances** | `POST`| `/api/grievances/` | Lodge new grievance | Citizen |
| **Grievances** | `GET` | `/api/grievances/{id}/` | Grievance details | Citizen / Staff |
| **Grievances** | `GET` | `/api/grievances/track/?ref={ref}` | Public reference tracking | Public |
| **Grievances** | `POST`| `/api/grievances/{id}/feedback/` | Submit 1–5 star rating | Citizen |
| **CMO** | `GET` | `/api/cmo/dashboard/` | Statewide KPI dashboard | CMO Admin |
| **CMO** | `GET` | `/api/cmo/grievances/` | All grievances across Kerala | CMO Admin |
| **CMO** | `POST`| `/api/cmo/grievances/{id}/assign/` | Assign department & officer | CMO Admin |
| **CMO** | `POST`| `/api/cmo/grievances/{id}/remark/` | Add confidential internal remark | CMO Admin |
| **CMO** | `POST`| `/api/cmo/reports/{id}/review/` | Scrutinize & approve ATR | CMO Admin |
| **CMO** | `POST`| `/api/cmo/grievances/{id}/escalate/`| Escalate priority to Urgent | CMO Admin |
| **Officer** | `GET` | `/api/officer/dashboard/` | Department workload stats | Officer |
| **Officer** | `GET` | `/api/officer/grievances/` | Department-assigned petitions | Officer |
| **Officer** | `POST`| `/api/officer/grievances/{id}/status/` | Update investigation status | Officer |
| **Officer** | `POST`| `/api/officer/grievances/{id}/report/` | Submit Action Taken Report (ATR) | Officer |
| **AI Assistant**| `POST`| `/api/ai/analyze/` | Triage classification & summary | Authenticated |
| **Notifications**| `GET`| `/api/notifications/` | In-app user notifications | Authenticated |
| **Notifications**| `GET`| `/api/notifications/unread-count/` | Unread badge counter | Authenticated |
| **Contact** | `POST`| `/api/contact/` | Public inquiry submission | Public |
| **Analytics** | `GET` | `/api/analytics/dashboard/` | Statewide aggregations & trends | CMO Admin |

---

## 8. Complete System Documentation Index

For exhaustive technical and operational specifications, consult the dedicated documentation files:

1. [01 Project Overview](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/01_Project_Overview.md) — Civic context, mission, problem statements, and feature matrix.
2. [02 System Architecture](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/02_System_Architecture.md) — Decoupled multi-tier architecture, sequence diagrams, and security model.
3. [03 Database Design](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/03_Database_Design.md) — Entity-relationship diagram, table schemas, indexes, and constraints.
4. [04 API Documentation](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/04_API_Documentation.md) — Complete REST endpoint reference with request/response schemas.
5. [05 AI Integration](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/05_AI_Integration.md) — Google Gemini 1.5 Flash implementation, prompt design, and heuristic fallback.
6. [06 Setup and Testing](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/06_Setup_and_Testing.md) — Step-by-step developer installation, demo accounts, and 67 automated tests.
7. [07 User Guide](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/07_User_Guide.md) — Operational walkthrough for Citizens, Department Officers, and CMO Administrators.

---

## 9. Production Deployment Guide (Render & Vercel)

Janaseva Kerala is architected for decoupled cloud hosting:
- **Backend (Django REST Framework)**: Deployed as a Python Web Service on [Render](https://render.com) with PostgreSQL (Neon or Render Managed Postgres).
- **Frontend (React 19 SPA)**: Deployed as an edge static site on [Vercel](https://vercel.com).

### 9.1 Backend Deployment on Render

1. **Create PostgreSQL Database**:
   - In Render Dashboard, create a **New PostgreSQL** instance (or use Neon Serverless Postgres).
   - Copy the internal/external `DATABASE_URL`.

2. **Create Web Service**:
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository: `janaseva-kerala`.
   - Configure settings:
     - **Name**: `janaseva-kerala-backend`
     - **Root Directory**: `backend`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
     - **Start Command**: `gunicorn config.wsgi:application`

3. **Configure Environment Variables in Render**:
   | Variable | Value / Description |
   | :--- | :--- |
   | `DEBUG` | `False` |
   | `SECRET_KEY` | Generate a secure 50+ character random string |
   | `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` |
   | `DATABASE_URL` | Your PostgreSQL connection string |
   | `CORS_ALLOWED_ORIGINS` | `https://<your-app>.vercel.app` |
   | `FRONTEND_URL` | `https://<your-app>.vercel.app` |
   | `GEMINI_API_KEY` | Your Google Gemini API Key |
   | `PYTHON_VERSION` | `3.11.9` (or `3.12.x`) |

4. **Seed Demonstration Data (Optional)**:
   - In Render Dashboard, open the **Shell** tab for the web service and run:
     ```bash
     python manage.py seed_data
     ```

### 9.2 Frontend Deployment on Vercel

1. **Import Project into Vercel**:
   - In Vercel Dashboard, click **Add New...** -> **Project**.
   - Select your GitHub repository: `janaseva-kerala`.
   - Configure project settings:
     - **Framework Preset**: `Vite`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Configure Environment Variables in Vercel**:
   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com/api` |

3. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend and serve it globally.
   - Client-side routing is handled automatically by the included `frontend/vercel.json` rewrite configuration.

