# Janaseva Kerala — Chief Minister's Public Grievance Redressal Portal

[![Django](https://img.shields.io/badge/Django-4.2_LTS-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Test Suite](https://img.shields.io/badge/Tests-67_Passed-brightgreen?style=for-the-badge)](file:///c:/Users/HP/.gemini/antigravity/scratch/janaseva-kerala/DOCUMENTATION/06_Setup_and_Testing.md)

---

> [!WARNING]
> ### Prototype Evaluation Disclaimer
> **This system is an evaluation prototype developed for WhiteMatrix Software Solutions.**  
> It is **NOT** an official portal, service, or representation of the Government of Kerala, the Chief Minister's Office (CMO), or any statutory department. All names, designations, and government references are utilized strictly for realistic demonstration and architectural evaluation purposes.

---

## 1. Project Overview

**Janaseva Kerala** is a full-stack public grievance redressal web platform built to manage citizen petitions and streamline administrative oversight across all 14 revenue districts of Kerala.

The platform provides dedicated role-based portals for:
1. **Citizens**: Submit petitions across standard civic categories, attach evidence (images/PDFs), track progress via reference numbers (`JK-YYYY-XXXXXX`), receive status alerts, manage profile details, and provide satisfaction ratings upon resolution.
2. **Department Nodal Officers**: Review department queues, update field investigation milestones, submit formal Action Taken Reports (ATRs), and manage officer profiles.
3. **Chief Minister's Office (CMO) Administrators**: Statewide executive oversight, intelligent triage, department routing, nodal officer assignment, officer directory and account management, confidential internal remarks, ATR review and approval, priority escalations, and analytics.
4. **AI Grievance Assistant**: Powered by **Google Gemini 2.5 Flash** with an offline heuristic fallback engine, offering real-time suggestions for department, category, priority, and executive summaries with strict human-in-the-loop review.

---

## 2. Demonstration Accounts

The system includes pre-seeded demonstration accounts:

| Portal Tier | Email Address | Password | Role & Scope |
| :--- | :--- | :--- | :--- |
| **CMO Administrator** | `cmo@janaseva.kerala.gov.in` | `admin123` | Statewide administration across all 14 districts and 8 departments. Full triage, officer management, ATR approval, internal remarks, and analytics. |
| **Department Officer** | `officer.pwd@janaseva.kerala.gov.in` | `officer123` | Er. Rajesh Kumar — PWD Executive Engineer. Department queue management, progress updates, and ATR submission. *(Additional officers seeded for Health, Education, LSGD, Water Resources, KSEB, Transport, Revenue with password `officer123`)*. |
| **Citizen** | `citizen@example.com` | `citizen123` | Kavitha R Nair — Thiruvananthapuram resident. Grievance submission, AI recommendations, live tracking, and satisfaction feedback. |

---

## 3. Technology Stack

| Layer | Technologies | Details |
| :--- | :--- | :--- |
| **Backend API** | Django 4.2 LTS, Django REST Framework 3.14 | Modular app architecture, generic views, serializers, custom permissions |
| **Authentication** | `rest_framework_simplejwt` | JWT authentication, rotating refresh tokens, token blacklisting |
| **API Documentation** | `drf-spectacular` | OpenAPI 3.0 schema generation, Swagger UI (`/api/docs/`), Redoc (`/api/redoc/`) |
| **Frontend SPA** | React 19, Vite 6, React Router DOM 7 | Component-driven UI, protected route layouts, context state management |
| **Styling & UI** | Tailwind CSS 4, Lucide React | Kerala civic color palette, responsive design, accessible states |
| **Visualizations** | Recharts 2 | Responsive charts for monthly trends, district distribution, category breakdown |
| **AI Advisory Engine**| Google Gemini 2.5 Flash (`google-genai` SDK) | Structured JSON triage suggestions with zero-downtime heuristic rule fallback |
| **Database** | SQLite (Development) / PostgreSQL (Production) | Relational schema, atomic transactions, row-level locking for reference keys |
| **Static & Media** | WhiteNoise, Cloudinary integration | Static file compression and uploaded attachment storage |

---

## 4. Quick Start Guide

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

# 6. Seed demonstration data (departments, sample users, grievances)
python backend/manage.py seed_data

# 7. Start Django development server
python backend/manage.py runserver 8000
```
Backend API runs at `http://127.0.0.1:8000/`.  
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
Frontend portal runs at `http://localhost:5173/`.

---

## 5. Automated Test Suite

Janaseva Kerala includes **67 automated test cases** covering authentication, permissions, grievance workflows, reference number generation, AI fallback engines, notifications, and analytics:

```bash
python backend/manage.py test apps
```

---

## 6. Project Architecture

```
janaseva-kerala/
├── backend/
│   ├── config/                      # Django configuration (settings, URLs, WSGI)
│   ├── apps/                        # Domain-Specific Applications
│   │   ├── accounts/                # Custom User, SimpleJWT auth, RBAC, officer management, seed_data
│   │   ├── departments/             # Government departments catalog
│   │   ├── grievances/              # Core grievance engine, assignments, ATRs, feedback
│   │   ├── ai_assistant/            # Google Gemini 2.5 Flash + Heuristic fallback service
│   │   ├── notifications/           # In-app alerts and unread counter
│   │   ├── enquiries/               # Public contact inquiries pipeline
│   │   └── analytics/               # Statewide aggregation and trend reporting
│   ├── manage.py                    # Django CLI management script
│   └── requirements.txt             # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios API clients with auto-refresh interceptors
│   │   ├── components/              # Reusable UI components & role-based layouts
│   │   ├── contexts/                # AuthContext (JWT session state)
│   │   ├── pages/                   # Role-based route views (citizen, officer, cmo, public)
│   │   └── App.jsx                  # Declarative React Router 7 route tree
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration
├── DOCUMENTATION/                   # Technical Documentation Suite
│   ├── 01_Project_Overview.md       # Problem statement, scope, feature matrix
│   ├── 02_System_Architecture.md    # Multi-tier design, component interactions, security
│   ├── 03_Database_Design.md        # Relational ER diagram, schemas, indexes
│   ├── 04_API_Documentation.md      # Complete REST API reference with JSON payloads
│   ├── 05_AI_Integration.md         # Google Gemini 2.5 Flash, DB validation, fallback engine
│   ├── 06_Setup_and_Testing.md      # Installation, demo accounts, test execution
│   └── 07_User_Guide.md             # Role-based operational manual
├── .env.example                     # Environment variables template
└── README.md                        # Project root documentation
```

---

## 7. Key REST API Endpoints

| Module | Method | Endpoint | Description | Access |
| :--- | :---: | :--- | :--- | :--- |
| **System** | `GET` | `/api/health/` | Service health status | Public |
| **Docs** | `GET` | `/api/docs/` | Interactive Swagger UI | Public |
| **Auth** | `POST` | `/api/auth/register/` | Citizen self-registration | Public |
| **Auth** | `POST` | `/api/auth/login/` | JWT token login | Public |
| **Auth** | `POST` | `/api/auth/token/refresh/` | Rotate access token | Public |
| **Auth** | `GET, PATCH` | `/api/auth/me/` | Get / update user profile | Authenticated |
| **Auth** | `POST` | `/api/auth/change-password/` | Change account password | Authenticated |
| **Departments** | `GET` | `/api/departments/` | List state departments | Public |
| **Grievances** | `GET, POST`| `/api/grievances/` | List / lodge citizen grievances | Citizen |
| **Grievances** | `GET` | `/api/grievances/{id}/` | Grievance dossier & history | Citizen / Staff |
| **Grievances** | `GET` | `/api/grievances/track/?ref={ref}` | Public reference tracking | Public |
| **Grievances** | `POST`| `/api/grievances/{id}/feedback/` | Submit 1–5 star rating | Citizen |
| **CMO** | `GET` | `/api/cmo/dashboard/` | Statewide KPI dashboard | CMO Admin |
| **CMO** | `GET` | `/api/cmo/grievances/` | All grievances across Kerala | CMO Admin |
| **CMO** | `POST`| `/api/cmo/grievances/{id}/assign/` | Assign department & officer | CMO Admin |
| **CMO** | `GET, POST`| `/api/cmo/officers/` | Officer directory & registration | CMO Admin |
| **CMO** | `POST`| `/api/cmo/officers/{id}/toggle-status/`| Activate / deactivate officer | CMO Admin |
| **CMO** | `POST`| `/api/cmo/reports/{id}/review/` | Review and approve ATR | CMO Admin |
| **Officer** | `GET` | `/api/officer/dashboard/` | Department workload stats | Officer |
| **Officer** | `GET` | `/api/officer/grievances/` | Department queue | Officer |
| **Officer** | `POST`| `/api/officer/grievances/{id}/status/` | Update investigation status | Officer |
| **Officer** | `POST`| `/api/officer/grievances/{id}/report/` | Submit Action Taken Report (ATR) | Officer |
| **AI Assistant**| `POST`| `/api/ai/analyze/` | Triage classification & summary | Authenticated |
| **Notifications**| `GET`| `/api/notifications/` | In-app user notifications | Authenticated |
| **Analytics** | `GET` | `/api/analytics/dashboard/` | Statewide aggregations & trends | CMO Admin |

---

## 8. AI Integration Summary

- **Provider & Model**: Google Gemini 2.5 Flash via `google-genai` SDK (`gemini-2.5-flash`).
- **Capabilities**: Recommends department, category, priority, and generates an executive summary.
- **Database Validation**: Validates all suggestions against active departments and allowed categories in PostgreSQL.
- **Human-in-the-Loop**: Citizens review and manually apply recommendations; administrators and officers verify assignments.
- **Offline Fallback**: Deterministic heuristic engine activates if API credentials are not configured or external networks are offline.
- **Security**: The API key is stored exclusively on the backend and is never exposed to clients or in logs.

---

## 9. Deployment Overview

- **Backend**: Python Web Service on [Render](https://render.com) using PostgreSQL (Neon or Render Managed Postgres).
  - Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
  - Start command: `gunicorn config.wsgi:application`
- **Frontend**: Static site on [Vercel](https://vercel.com) using Vite.
  - Build command: `npm run build`
  - Output directory: `dist`
  - Client-side routing: Handled via `frontend/vercel.json`.

---

## 10. Technical Documentation Index

For comprehensive technical specifications, refer to the `DOCUMENTATION/` directory:
- [01 Project Overview](DOCUMENTATION/01_Project_Overview.md)
- [02 System Architecture](DOCUMENTATION/02_System_Architecture.md)
- [03 Database Design](DOCUMENTATION/03_Database_Design.md)
- [04 API Documentation](DOCUMENTATION/04_API_Documentation.md)
- [05 AI Integration](DOCUMENTATION/05_AI_Integration.md)
- [06 Setup and Testing](DOCUMENTATION/06_Setup_and_Testing.md)
- [07 User Guide](DOCUMENTATION/07_User_Guide.md)
