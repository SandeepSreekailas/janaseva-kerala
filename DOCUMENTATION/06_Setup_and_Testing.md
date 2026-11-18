# Janaseva Kerala — Setup, Installation & Testing Guide

> **Developer Installation, Environment Configuration, Demo Credentials, and Test Suite Execution**  
> *Chief Minister's Public Grievance Redressal Portal*

---

> [!WARNING]
> ### Prototype Evaluation Disclaimer
> **This system is an evaluation prototype developed for WhiteMatrix Software Solutions.**  
> It is **NOT** an official production deployment of the Government of Kerala. All instructions and credentials are provided for local technical evaluation.

---

## 1. System Requirements & Prerequisites

Ensure the following tools are installed before setting up the project:

| Tool | Minimum Version | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Python** | 3.10+ | 3.12+ | Required for Django 4.2 LTS backend. |
| **Node.js** | 18.0+ | 20.x or 22.x LTS | Required for Vite and React 19 build. |
| **npm** / **pnpm** | 9.0+ | Latest | Node package manager. |
| **Git** | 2.30+ | Latest | Version control. |
| **OS** | Windows 10/11, macOS, or Linux | Windows / Ubuntu 22.04 | Fully tested on Windows and POSIX. |

---

## 2. Repository & Workspace Structure

```
janaseva-kerala/
├── backend/                       # Django 4.2 Application
│   ├── config/                    # Settings, root URLs, WSGI/ASGI
│   ├── apps/                      # 7 domain modular applications
│   │   ├── accounts/              # Custom User, Auth, JWT, Permissions, Seed command
│   │   ├── departments/           # Departments catalog
│   │   ├── grievances/            # Core grievance engine, ATRs, Feedback
│   │   ├── ai_assistant/          # Google Gemini 1.5 Flash + Fallback service
│   │   ├── notifications/         # In-app alerts
│   │   ├── enquiries/             # Public contact inquiries
│   │   └── analytics/             # Aggregations & reporting
│   ├── manage.py                  # Django CLI entrypoint
│   ├── requirements.txt           # Python backend dependencies
│   └── db.sqlite3                 # SQLite local database (generated on migrate)
├── frontend/                      # React 19 + Vite Application
│   ├── src/                       # Components, Pages, Contexts, API clients
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.js             # Vite configuration
│   └── index.html                 # HTML template with Kerala civic branding
├── DOCUMENTATION/                 # Complete system documentation (7 Markdown docs)
├── .env.example                   # Environment variable template
└── README.md                      # Root overview and quick start guide
```

---

## 3. Step-by-Step Installation

### Step 3.1 Clone & Navigate
```bash
git clone <repository-url> janaseva-kerala
cd janaseva-kerala
```

### Step 3.2 Backend Setup (Django)

1. **Create and Activate Python Virtual Environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Install Python Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `backend/.env` (and root `.env`):
   - **Windows**:
     ```powershell
     Copy-Item .env.example backend\.env
     ```
   - **Linux / macOS**:
     ```bash
     cp .env.example backend/.env
     ```

4. **Apply Database Migrations**:
   ```bash
   python backend/manage.py migrate
   ```

5. **Seed Demonstration Data (Departments, Users & Sample Grievances)**:
   ```bash
   python backend/manage.py seed_data
   ```
   *This command provisions 8 government departments, 11 demo user accounts, and 5 realistic sample grievances across various workflow states.*

6. **Start the Django Development Server**:
   ```bash
   python backend/manage.py runserver 8000
   ```
   The backend API will be available at `http://127.0.0.1:8000/`.  
   Swagger UI: `http://127.0.0.1:8000/api/docs/`  
   Health Check: `http://127.0.0.1:8000/api/health/`

---

### Step 3.3 Frontend Setup (React + Vite)

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Start the Vite Development Server**:
   ```bash
   npm run dev
   ```
   The frontend application will be accessible at:  
   👉 **`http://localhost:5173/`**

4. **Build for Production (Optional Verification)**:
   ```bash
   npm run build
   ```
   Builds the optimized production client into `frontend/dist/`.

---

## 4. Environment Variables Reference

The application reads environment configuration from `backend/.env` using `python-dotenv`:

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `SECRET_KEY` | Optional | `django-insecure-janaseva-kerala-...` | Django cryptographic signing key. Change in production. |
| `DEBUG` | Optional | `True` | Debug mode toggle (`True` or `False`). |
| `ALLOWED_HOSTS` | Optional | `localhost,127.0.0.1` | Comma-delimited list of host/domain names. |
| `DATABASE_URL` | Optional | *Empty* (uses SQLite) | PostgreSQL connection URL (e.g. Neon connection string). |
| `CORS_ALLOWED_ORIGINS` | Optional | `http://localhost:5173,http://127.0.0.1:5173` | Allowed frontend client origins. |
| `CORS_ALLOW_ALL_ORIGINS`| Optional | `False` | Disables origin check when set to `True`. |
| `GEMINI_API_KEY` | Optional | *Empty* | Google Gemini API key. If absent, fallback heuristic engine is used. |
| `CLOUDINARY_CLOUD_NAME`| Optional | *Empty* | Cloudinary cloud identifier for media hosting. |
| `CLOUDINARY_API_KEY` | Optional | *Empty* | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET`| Optional | *Empty* | Cloudinary API Secret. |

---

## 5. Demonstration Accounts Matrix

The seed script creates ready-to-test accounts representing all administrative tiers:

| Role | Email Address | Password | Name & Designation | Department Scope |
| :--- | :--- | :--- | :--- | :--- |
| **CMO Administrator** | `cmo@janaseva.kerala.gov.in` | `admin123` | **Chief Minister Office Administrator** | Statewide (All 14 Districts) |
| **Officer — PWD** | `officer.pwd@janaseva.kerala.gov.in` | `officer123` | **Er. Rajesh Kumar** (Executive Engineer) | Public Works Department (PWD) |
| **Officer — Health** | `officer.hlt@janaseva.kerala.gov.in` | `officer123` | **Dr. Ananya Nair** (District Medical Officer) | Health & Family Welfare (HLT) |
| **Officer — Education** | `officer.edu@janaseva.kerala.gov.in` | `officer123` | **Prof. Suresh Menon** (Education Officer) | General Education Department (EDU) |
| **Officer — LSGD** | `officer.lsg@janaseva.kerala.gov.in` | `officer123` | **Smt. Bindu Thomas** (Joint Director) | Local Self Government (LSG) |
| **Officer — Water** | `officer.wrd@janaseva.kerala.gov.in` | `officer123` | **Er. Manoj Pillai** (Superintending Engineer) | Water Resources Department (WRD) |
| **Officer — KSEB** | `officer.kseb@janaseva.kerala.gov.in` | `officer123` | **Er. Deepa Varma** (Executive Engineer) | Kerala State Electricity Board (KSEB) |
| **Officer — Transport**| `officer.trn@janaseva.kerala.gov.in` | `officer123` | **Shri. Arun Chandran** (Regional Transport Officer)| Transport Department (TRN) |
| **Officer — Revenue** | `officer.rev@janaseva.kerala.gov.in` | `officer123` | **Shri. George Joseph** (Tahsildar) | Revenue Department (REV) |
| **Citizen (Primary)** | `citizen@example.com` | `citizen123` | **Kavitha R Nair** | Resident of Thiruvananthapuram |
| **Citizen (Secondary)**| `citizen2@example.com` | `citizen123` | **Rahul K Varma** | Resident of Kozhikode |

---

## 6. Automated Test Suite Execution

Janaseva Kerala includes **67 automated test cases** covering model constraints, permissions, business workflows, AI fallbacks, and REST endpoints:

### Running All Tests
```bash
python backend/manage.py test apps
```

### Expected Output
```text
Found 67 test(s).
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
...................................................................
----------------------------------------------------------------------
Ran 67 tests in 42.506s

OK
Destroying test database for alias 'default'...
```

### Test Suite Breakdown

| App Module | Test Scope | Cases |
| :--- | :--- | :---: |
| `apps.accounts` | Custom user creation, email validation, JWT login/refresh, change password, RBAC permissions (`IsCitizen`, `IsOfficer`, `IsCMOAdmin`). | 14 |
| `apps.departments` | Department CRUD, public listing, CMO-only creation/editing, code uniqueness. | 8 |
| `apps.grievances` | Reference number generation (`JK-YYYY-XXXXXX`), citizen submission, file attachments, public tracking, department assignment, ATR submissions, CMO review, feedback submission, internal remarks. | 24 |
| `apps.ai_assistant`| Gemini API service integration, structured JSON validation, keyword-based heuristic fallback engine, urgent/high/low classification tests. | 7 |
| `apps.notifications`| In-app notification creation, unread badge count queries, single read, bulk mark-all-read. | 6 |
| `apps.enquiries` | Public contact inquiry submission, validation, CMO inquiry listing. | 4 |
| `apps.analytics` | Aggregations by status, priority, district, category, 6-month monthly trends, department performance calculations. | 4 |
| **Total** | | **67** |

---

## 7. Troubleshooting & Common Issues

### Issue 1: CORS Policy Errors in Browser
- **Symptom**: `Access to XMLHttpRequest at 'http://localhost:8000/api/...' has been blocked by CORS policy`.
- **Resolution**: Ensure the frontend port matches `CORS_ALLOWED_ORIGINS` in `backend/.env`. If running on port `5173`, confirm `.env` has:
  ```env
  CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  ```

### Issue 2: Staticfiles UserWarning during Tests
- **Symptom**: `UserWarning: No directory at: .../backend/staticfiles/`
- **Resolution**: This warning is harmless in development. To generate the static directory, run:
  ```bash
  python backend/manage.py collectstatic --noinput
  ```

### Issue 3: Gemini API Quota or Connection Failures
- **Symptom**: The terminal logs `Gemini AI grievance analysis encountered an error... Using fallback.`
- **Resolution**: This is expected behavior when `GEMINI_API_KEY` is not provided or quota is exceeded. The system automatically engages the built-in rule-based heuristic engine with zero disruption to the user experience.

### Issue 4: Database Locked (SQLite)
- **Symptom**: `django.db.utils.OperationalError: database is locked`.
- **Resolution**: Ensure no background processes or SQLite browser utilities hold an exclusive file lock on `backend/db.sqlite3`.
