# Janaseva Kerala — REST API Documentation

> **Complete REST API Reference, Schemas, Status Codes, and Examples**  
> *Chief Minister's Public Grievance Redressal Portal*

---

> [!WARNING]
> ### Prototype Evaluation Disclaimer
> **This system is an evaluation prototype developed for WhiteMatrix Software Solutions.**  
> It is **NOT** an official API of the Government of Kerala. All endpoints, parameters, and demonstration responses are designed for architectural validation.

---

## 1. Overview & General Specifications

The Janaseva Kerala API is a RESTful web service built with **Django REST Framework (DRF)**. All responses are returned in JSON format with standard HTTP status codes.

- **Base URL**: `http://localhost:8000/api/` (Development)
- **Interactive Documentation**:
  - Swagger UI: `http://localhost:8000/api/docs/`
  - Redoc: `http://localhost:8000/api/redoc/`
  - OpenAPI 3.0 Schema (YAML/JSON): `http://localhost:8000/api/schema/`
- **Authentication**: JWT Bearer Token passed via HTTP Header:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Pagination**: Default page size is 15 items per page. Paginated responses follow this structure:
  ```json
  {
    "count": 142,
    "next": "http://localhost:8000/api/grievances/?page=2",
    "previous": null,
    "results": [...]
  }
  ```

---

## 2. Common HTTP Status Codes

| Code | Status | Meaning |
| :--- | :--- | :--- |
| `200 OK` | Success | The request succeeded and returns data in the response body. |
| `201 Created` | Created | A new resource was successfully created (e.g., grievance, user, ATR). |
| `204 No Content` | No Content | The request succeeded (e.g. deletion, bulk read) with an empty response. |
| `400 Bad Request` | Validation Error | Malformed request body, missing mandatory fields, or invalid enum. |
| `401 Unauthorized` | Unauthenticated | Missing or expired JWT bearer token. |
| `403 Forbidden` | Access Denied | Authenticated user lacks the necessary role permissions. |
| `404 Not Found` | Not Found | Requested entity (Grievance ID, Department ID, Report ID) does not exist. |
| `500 Server Error` | Server Exception | Internal error on server execution. |

---

## 3. System & Health Endpoints

### 3.1 Health Check
Inspects API operational state and version metadata.

- **Method**: `GET`
- **Path**: `/api/health/`
- **Auth Required**: None (Public)
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "Janaseva Kerala Grievance Redressal Portal API",
  "version": "1.0.0",
  "disclaimer": "Demonstration recruitment prototype for WhiteMatrix Software Solutions. Not affiliated with Government of Kerala."
}
```

---

## 4. Authentication Module (`/api/auth/`)

### 4.1 Citizen Registration
Registers a new citizen user account.

- **Method**: `POST`
- **Path**: `/api/auth/register/`
- **Auth Required**: None (Public)
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "password_confirm": "StrongPassword123!",
  "full_name": "Sreejith Menon",
  "mobile": "9847123456"
}
```
- **Response `201 Created`**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 14,
    "email": "user@example.com",
    "full_name": "Sreejith Menon",
    "role": "citizen",
    "mobile": "9847123456",
    "department": null,
    "created_at": "2026-11-17T10:30:00Z"
  },
  "tokens": {
    "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
    "access": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

---

### 4.2 User Login
Authenticates credentials for Citizen, Officer, or CMO Admin.

- **Method**: `POST`
- **Path**: `/api/auth/login/`
- **Auth Required**: None (Public)
- **Request Body**:
```json
{
  "email": "cmo@janaseva.kerala.gov.in",
  "password": "admin123"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Login successful",
  "tokens": {
    "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
    "access": "eyJhbGciOiJIUzI1NiIsIn..."
  },
  "user": {
    "id": 1,
    "email": "cmo@janaseva.kerala.gov.in",
    "full_name": "Chief Minister Office Administrator",
    "role": "cmo_admin",
    "mobile": "9847000001",
    "department": null,
    "created_at": "2026-11-17T09:00:00Z"
  }
}
```

---

### 4.3 Refresh JWT Token
Obtains a new access token using an unexpired refresh token.

- **Method**: `POST`
- **Path**: `/api/auth/token/refresh/`
- **Auth Required**: None
- **Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsIn..."
}
```
- **Response `200 OK`**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 4.4 Get Current User Profile
Retrieves authenticated user details. Always scoped strictly to the calling user token.

- **Method**: `GET`
- **Path**: `/api/auth/me/`
- **Auth Required**: Authenticated (Any Role)
- **Response `200 OK`**:
```json
{
  "id": 2,
  "email": "officer.pwd@janaseva.kerala.gov.in",
  "full_name": "Er. Rajesh Kumar",
  "role": "officer",
  "mobile": "9847100001",
  "department": {
    "id": 1,
    "name": "Public Works Department",
    "code": "PWD",
    "contact_email": "pwd@janaseva.kerala.gov.in"
  },
  "designation": "Executive Engineer",
  "employee_id": "KL-PWD-4401",
  "address": "",
  "is_active": true,
  "created_at": "2026-11-17T09:15:00Z"
}
```

---

### 4.5 Update Current User Profile
Updates permitted personal contact details for the authenticated user. Role and department cannot be modified.

- **Method**: `PATCH`
- **Path**: `/api/auth/me/`
- **Auth Required**: Authenticated (Any Role)
- **Request Body**:
```json
{
  "full_name": "Kavitha R Nair",
  "mobile": "9447112233",
  "address": "TC 14/820, Nandavanam, Thiruvananthapuram"
}
```
- **Response `200 OK`**: Returns updated user profile JSON.

---

### 4.6 Change Password
Changes password for the current authenticated user session after validating existing password.

- **Method**: `POST`
- **Path**: `/api/auth/change-password/`
- **Auth Required**: Authenticated (Any Role)
- **Request Body**:
```json
{
  "old_password": "CurrentPassword123!",
  "new_password": "NewSecurePassword456!"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Password changed successfully."
}
```

---

### 4.7 Logout (Token Blacklist)
Blacklists the refresh token to terminate session.

- **Method**: `POST`
- **Path**: `/api/auth/logout/`
- **Auth Required**: Authenticated
- **Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsIn..."
}
```
- **Response `200 OK`**:
```json
{
  "message": "Successfully logged out"
}
```

---

## 5. Departments Module (`/api/departments/`)

### 5.1 List All Departments
Returns all active state departments.

- **Method**: `GET`
- **Path**: `/api/departments/`
- **Auth Required**: None (Public)
- **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "name": "Public Works Department",
    "code": "PWD",
    "description": "Responsible for planning, construction, and maintenance of roads, bridges, and public infrastructure.",
    "contact_email": "pwd@janaseva.kerala.gov.in",
    "is_active": true
  },
  {
    "id": 6,
    "name": "Kerala State Electricity Board",
    "code": "KSEB",
    "description": "State electricity utility managing electrical transmission, distribution, and transformer maintenance.",
    "contact_email": "kseb@janaseva.kerala.gov.in",
    "is_active": true
  }
]
```

---

### 5.2 Department Details
- **Method**: `GET`
- **Path**: `/api/departments/{id}/`
- **Auth Required**: None (Public)
- **Response `200 OK`**:
```json
{
  "id": 1,
  "name": "Public Works Department",
  "code": "PWD",
  "description": "Responsible for planning, construction, and maintenance of roads, bridges, and public infrastructure.",
  "contact_email": "pwd@janaseva.kerala.gov.in",
  "is_active": true,
  "created_at": "2026-11-17T09:00:00Z"
}
```

---

## 6. Citizen Grievance Module (`/api/grievances/`)

### 6.1 List Citizen Grievances
Lists grievances submitted by the authenticated citizen.

- **Method**: `GET`
- **Path**: `/api/grievances/`
- **Auth Required**: Citizen (`IsCitizen`)
- **Query Parameters**:
  - `status`: Filter by status (`Submitted`, `Under Review`, `In Progress`, `Resolved`, `Reopened`)
  - `priority`: Filter by priority (`Low`, `Medium`, `High`, `Urgent`)
  - `district`: Filter by district name
  - `search`: Keyword search in subject and description
- **Response `200 OK`**:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "reference_number": "JK-2026-000001",
      "district": "Thiruvananthapuram",
      "category": "Public Works",
      "subject": "Severe potholes on MG Road near East Fort bus terminal",
      "priority": "High",
      "status": "Resolved",
      "created_at": "2026-11-10T08:30:00Z",
      "resolved_at": "2026-11-15T14:20:00Z",
      "due_date": "2026-11-15T18:00:00Z",
      "is_overdue": false,
      "feedback": {
        "rating": 5,
        "comments": "Potholes filled quickly within 5 days. Excellent work!"
      }
    }
  ]
}
```

---

### 6.2 Submit Grievance
Submits a new grievance. Accepts JSON or `multipart/form-data` with attachments.

- **Method**: `POST`
- **Path**: `/api/grievances/`
- **Auth Required**: Citizen (`IsCitizen`)
- **Request Body**:
```json
{
  "district": "Ernakulam",
  "category": "Water Resources",
  "subject": "Drinking water pipeline burst on Civil Station road",
  "description": "Main drinking water pipe burst opposite the civil station gate. Thousands of liters of water are wasting and neighborhood has zero pressure.",
  "priority": "High",
  "ai_summary": "Drinking water pipe burst near Ernakulam Civil Station causing water loss and outage.",
  "ai_suggested_department": "Water Resources Department",
  "ai_suggested_category": "Water Resources",
  "ai_suggested_priority": "High"
}
```
- **Response `201 Created`**:
```json
{
  "id": 6,
  "reference_number": "JK-2026-000006",
  "district": "Ernakulam",
  "category": "Water Resources",
  "subject": "Drinking water pipeline burst on Civil Station road",
  "description": "Main drinking water pipe burst opposite the civil station gate...",
  "priority": "High",
  "status": "Submitted",
  "created_at": "2026-11-17T11:00:00Z",
  "due_date": "2026-11-22T11:00:00Z",
  "attachments": []
}
```

---

### 6.3 Public Tracking
Look up status and investigation history using reference number without signing in.

- **Method**: `GET`
- **Path**: `/api/grievances/track/?ref=JK-2026-000001` or `/api/grievances/track/JK-2026-000001/`
- **Auth Required**: None (Public)
- **Response `200 OK`**:
```json
{
  "reference_number": "JK-2026-000001",
  "district": "Thiruvananthapuram",
  "category": "Public Works",
  "subject": "Severe potholes on MG Road near East Fort bus terminal",
  "status": "Resolved",
  "priority": "High",
  "created_at": "2026-11-10T08:30:00Z",
  "resolved_at": "2026-11-15T14:20:00Z",
  "assigned_department": "Public Works Department",
  "history": [
    {
      "previous_status": "In Progress",
      "new_status": "Resolved",
      "remarks": "Asphalt patchwork completed and inspected by Assistant Executive Engineer.",
      "created_at": "2026-11-15T14:20:00Z"
    },
    {
      "previous_status": "Under Review",
      "new_status": "In Progress",
      "remarks": "Road maintenance crew mobilized to East Fort junction.",
      "created_at": "2026-11-12T10:00:00Z"
    },
    {
      "previous_status": "Submitted",
      "new_status": "Under Review",
      "remarks": "Assigned to PWD Roads Division.",
      "created_at": "2026-11-10T09:30:00Z"
    }
  ]
}
```

---

### 6.4 Upload Supporting Attachment
Uploads a document or image associated with an existing grievance.

- **Method**: `POST`
- **Path**: `/api/grievances/{id}/attachments/`
- **Auth Required**: Authenticated (Owner or Assigned Officer/Admin)
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: (Binary File, max 10MB)
- **Response `201 Created`**:
```json
{
  "id": 12,
  "original_filename": "pothole_site_photo.jpg",
  "file": "/media/grievance_attachments/pothole_site_photo.jpg",
  "uploaded_at": "2026-11-17T11:05:00Z"
}
```

---

### 6.5 Submit Citizen Satisfaction Feedback
Submits a rating and comment once a grievance is resolved.

- **Method**: `POST`
- **Path**: `/api/grievances/{id}/feedback/`
- **Auth Required**: Citizen (`IsCitizen`, owner only)
- **Request Body**:
```json
{
  "rating": 5,
  "comments": "The road repair was executed swiftly before the festival rush. Thank you!"
}
```
- **Response `201 Created`**:
```json
{
  "id": 3,
  "rating": 5,
  "comments": "The road repair was executed swiftly before the festival rush. Thank you!",
  "created_at": "2026-11-17T11:10:00Z"
}
```

---

## 7. CMO Administration Module (`/api/cmo/`)

### 7.1 CMO Dashboard Summary
Retrieves aggregate KPIs and urgent caseload alerts across Kerala.

- **Method**: `GET`
- **Path**: `/api/cmo/dashboard/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Response `200 OK`**:
```json
{
  "total_grievances": 158,
  "pending_grievances": 42,
  "under_review_grievances": 25,
  "in_progress_grievances": 38,
  "resolved_grievances": 48,
  "urgent_grievances": 7,
  "overdue_grievances": 4,
  "recent_grievances": [
    {
      "id": 5,
      "reference_number": "JK-2026-000005",
      "district": "Palakkad",
      "category": "Local Self Government",
      "subject": "Dumping of industrial waste near Chittur village stream",
      "priority": "Urgent",
      "status": "Reopened",
      "created_at": "2026-11-16T15:20:00Z"
    }
  ]
}
```

---

### 7.2 Grievance Triage & Department Assignment
Routes a grievance to a government department and designates an officer.

- **Method**: `POST`
- **Path**: `/api/cmo/grievances/{id}/assign/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Request Body**:
```json
{
  "department_id": 1,
  "assigned_officer_id": 2,
  "assignment_notes": "Urgent attention required. Please inspect road pavement by Friday.",
  "due_date": "2026-11-22T18:00:00Z"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Grievance successfully assigned to Public Works Department",
  "assignment": {
    "id": 8,
    "department": "Public Works Department",
    "officer": "Er. Rajesh Kumar",
    "assigned_by": "Chief Minister Office Administrator",
    "assigned_at": "2026-11-17T11:15:00Z",
    "assignment_notes": "Urgent attention required. Please inspect road pavement by Friday."
  },
  "grievance_status": "Under Review"
}
```

---

### 7.3 Add Internal Confidential Remark
Posts administrative notes hidden from citizens and public view.

- **Method**: `POST`
- **Path**: `/api/cmo/grievances/{id}/remark/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Request Body**:
```json
{
  "remark": "District Collector notified. PWD Executive Engineer directed to prioritize funds from disaster mitigation quota."
}
```
- **Response `201 Created`**:
```json
{
  "id": 4,
  "admin": "Chief Minister Office Administrator",
  "remark": "District Collector notified. PWD Executive Engineer directed to prioritize funds from disaster mitigation quota.",
  "created_at": "2026-11-17T11:20:00Z"
}
```

---

### 7.4 Review Action Taken Report (ATR)
Approves, rejects, or requests revision for an officer's investigation report.

- **Method**: `POST`
- **Path**: `/api/cmo/reports/{id}/review/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Request Body**:
```json
{
  "cmo_review_status": "Approved",
  "cmo_remarks": "Action confirmed with site photo verification. Mark grievance as Resolved."
}
```
- **Response `200 OK`**:
```json
{
  "message": "Action Taken Report review updated to Approved",
  "report_id": 2,
  "cmo_review_status": "Approved",
  "grievance_status": "Resolved"
}
```

---

### 7.5 Escalate Grievance Priority
Immediately escalates a grievance to Urgent or High with notification dispatch.

- **Method**: `POST`
- **Path**: `/api/cmo/grievances/{id}/escalate/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Request Body**:
```json
{
  "priority": "Urgent",
  "reason": "Direct escalation from CMO public hearing."
}
```
- **Response `200 OK`**:
```json
{
  "message": "Grievance priority escalated to Urgent",
  "reference_number": "JK-2026-000004",
  "priority": "Urgent"
}
```

---

### 7.6 List and Register Department Officers
Lists registered officers with search/filters, or registers a new department officer.

- **Method**: `GET`, `POST`
- **Path**: `/api/cmo/officers/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Query Parameters (GET)**: `search`, `department`, `status` (`active`/`inactive`)
- **Request Body (POST)**:
```json
{
  "full_name": "Er. Arun Varma",
  "email": "officer.pwd2@janaseva.kerala.gov.in",
  "mobile": "9447123456",
  "department_id": 1,
  "designation": "Assistant Executive Engineer",
  "employee_id": "KL-PWD-8890",
  "password": "TemporaryPassword123!"
}
```
- **Response `201 Created`**:
```json
{
  "message": "Department officer registered successfully.",
  "officer": {
    "id": 14,
    "email": "officer.pwd2@janaseva.kerala.gov.in",
    "full_name": "Er. Arun Varma",
    "role": "officer",
    "department": { "id": 1, "name": "Public Works Department", "code": "PWD" },
    "designation": "Assistant Executive Engineer",
    "employee_id": "KL-PWD-8890",
    "is_active": true,
    "assigned_grievances_count": 0
  }
}
```

---

### 7.7 Toggle Officer Account Status
Activates or deactivates an officer account. Deactivated officers are blocked from receiving new grievance assignments.

- **Method**: `POST`
- **Path**: `/api/cmo/officers/{id}/toggle-status/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Response `200 OK`**:
```json
{
  "message": "Officer account deactivated successfully.",
  "is_active": false,
  "officer": { "id": 14, "is_active": false }
}
```

---

## 8. Department Officer Module (`/api/officer/`)

### 8.1 Officer Dashboard
Retrieves workload statistics for the officer's department.

- **Method**: `GET`
- **Path**: `/api/officer/dashboard/`
- **Auth Required**: Officer (`IsOfficer`)
- **Response `200 OK`**:
```json
{
  "department": "Public Works Department (PWD)",
  "total_assigned": 28,
  "under_review": 6,
  "in_progress": 14,
  "resolved": 8,
  "urgent": 2,
  "overdue": 1
}
```

---

### 8.2 Officer Assigned Grievances
Lists grievances assigned to the officer's department.

- **Method**: `GET`
- **Path**: `/api/officer/grievances/`
- **Auth Required**: Officer (`IsOfficer`)
- **Query Parameters**: `status`, `priority`, `district`, `search`
- **Response `200 OK`**:
```json
{
  "count": 28,
  "results": [
    {
      "id": 2,
      "reference_number": "JK-2026-000002",
      "district": "Ernakulam",
      "category": "Public Works",
      "subject": "Bridge expansion joint gap on Goshree second bridge",
      "priority": "Urgent",
      "status": "In Progress",
      "created_at": "2026-11-12T07:10:00Z",
      "due_date": "2026-11-17T18:00:00Z"
    }
  ]
}
```

---

### 8.3 Update Investigation Status
Updates grievance state during field investigation.

- **Method**: `POST`
- **Path**: `/api/officer/grievances/{id}/status/`
- **Auth Required**: Officer (`IsOfficer`)
- **Request Body**:
```json
{
  "status": "In Progress",
  "remarks": "Bridge inspection team deployed on site with structural engineers."
}
```
- **Response `200 OK`**:
```json
{
  "message": "Status updated successfully to In Progress",
  "status": "In Progress"
}
```

---

### 8.4 Submit Action Taken Report (ATR)
Submits formal resolution findings for CMO scrutiny.

- **Method**: `POST`
- **Path**: `/api/officer/grievances/{id}/report/`
- **Auth Required**: Officer (`IsOfficer`)
- **Content-Type**: `multipart/form-data` or JSON
- **Request Body**:
  - `report_text`: "Expansion joint replacement completed using rubberized bituminous sealant. Load test cleared."
  - `attachment`: (File upload - completion photo / test certificate)
- **Response `201 Created`**:
```json
{
  "id": 5,
  "grievance": 2,
  "report_text": "Expansion joint replacement completed using rubberized bituminous sealant. Load test cleared.",
  "attachment": "/media/action_reports/completion_cert.pdf",
  "cmo_review_status": "Pending",
  "submitted_at": "2026-11-17T11:30:00Z"
}
```

---

## 9. AI Assistant Module (`/api/ai/`)

### 9.1 Analyze Grievance Content
Predicts category, department, priority, and produces an executive summary.

- **Method**: `POST`
- **Path**: `/api/ai/analyze/`
- **Auth Required**: Authenticated (Any Role)
- **Request Body**:
```json
{
  "subject": "Live electric cable snapped and hanging over public walkway",
  "description": "High tension wire snapped during storm near Kottayam private bus stand. Sparking on the pavement posing fatal danger to pedestrians.",
  "district": "Kottayam"
}
```
- **Response `200 OK`**:
```json
{
  "summary": "Live high-tension electric cable snapped and sparking near Kottayam bus stand presenting fatal danger.",
  "suggested_department": "Kerala State Electricity Board",
  "suggested_category": "Electricity",
  "suggested_priority": "Urgent",
  "reasoning": "Live sparking high-tension wire in a crowded public transit terminal represents an immediate life-safety hazard under KSEB jurisdiction.",
  "is_fallback": false,
  "source": "Google Gemini AI (gemini-2.5-flash)",
  "model": "gemini-2.5-flash"
}
```

---

## 10. Notifications Module (`/api/notifications/`)

### 10.1 List Notifications
- **Method**: `GET`
- **Path**: `/api/notifications/`
- **Auth Required**: Authenticated

### 10.2 Get Unread Badge Count
- **Method**: `GET`
- **Path**: `/api/notifications/unread-count/`
- **Auth Required**: Authenticated
- **Response `200 OK`**:
```json
{
  "unread_count": 3
}
```

### 10.3 Mark Single Notification Read
- **Method**: `POST`
- **Path**: `/api/notifications/{id}/read/`
- **Auth Required**: Authenticated

### 10.4 Mark All Notifications Read
- **Method**: `POST`
- **Path**: `/api/notifications/mark-all-read/`
- **Auth Required**: Authenticated

---

## 11. Contact & Enquiries (`/api/contact/`)

### 11.1 Submit Public Contact Inquiry
- **Method**: `POST`
- **Path**: `/api/contact/`
- **Auth Required**: None (Public)
- **Request Body**:
```json
{
  "name": "Dr. Anish Kurup",
  "email": "anish.kurup@example.org",
  "subject": "Inquiry regarding Right to Service timeline for pension complaints",
  "message": "Could you please clarify whether pension revision petitions fall under Finance or Social Welfare department?"
}
```
- **Response `201 Created`**:
```json
{
  "message": "Enquiry submitted successfully. We will respond shortly.",
  "id": 3
}
```

---

## 12. Analytics Module (`/api/analytics/`)

### 12.1 Statewide Analytics Dashboard
- **Method**: `GET`
- **Path**: `/api/analytics/dashboard/`
- **Auth Required**: CMO Administrator (`IsCMOAdmin`)
- **Query Parameters**: `district`, `category`
- **Response `200 OK`**:
```json
{
  "total_grievances": 158,
  "by_status": [
    {"status": "Submitted", "count": 28},
    {"status": "Under Review", "count": 25},
    {"status": "In Progress", "count": 45},
    {"status": "Resolved", "count": 55},
    {"status": "Reopened", "count": 5}
  ],
  "by_priority": [
    {"priority": "Low", "count": 22},
    {"priority": "Medium", "count": 86},
    {"priority": "High", "count": 38},
    {"priority": "Urgent", "count": 12}
  ],
  "by_district": [
    {"district": "Thiruvananthapuram", "count": 34},
    {"district": "Ernakulam", "count": 29},
    {"district": "Kozhikode", "count": 21}
  ],
  "monthly_trend": [
    {"month": "2026-06-01T00:00:00Z", "total": 18, "resolved": 14, "pending": 4},
    {"month": "2026-07-01T00:00:00Z", "total": 24, "resolved": 20, "pending": 4},
    {"month": "2026-08-01T00:00:00Z", "total": 31, "resolved": 25, "pending": 6},
    {"month": "2026-09-01T00:00:00Z", "total": 29, "resolved": 22, "pending": 7},
    {"month": "2026-10-01T00:00:00Z", "total": 26, "resolved": 21, "pending": 5},
    {"month": "2026-11-01T00:00:00Z", "total": 30, "resolved": 19, "pending": 11}
  ],
  "department_performance": [
    {
      "department_code": "PWD",
      "department_name": "Public Works Department",
      "total_assigned": 42,
      "resolved": 31,
      "resolution_rate": 73.8
    },
    {
      "department_code": "KSEB",
      "department_name": "Kerala State Electricity Board",
      "total_assigned": 36,
      "resolved": 32,
      "resolution_rate": 88.9
    }
  ]
}
```
