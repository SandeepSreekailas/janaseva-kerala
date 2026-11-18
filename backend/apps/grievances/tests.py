"""
Comprehensive tests for Janaseva Kerala Grievances application.
Tests Citizen, CMO Admin, and Department Officer endpoints and workflows.
"""
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.departments.models import Department
from .models import (
    District,
    GrievanceCategory,
    GrievancePriority,
    GrievanceStatus,
    Grievance,
    GrievanceHistory,
    DepartmentAssignment,
    Attachment,
    ActionTakenReport,
    CitizenFeedback,
    InternalRemark,
)

User = get_user_model()


class GrievanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Department
        self.dept = Department.objects.create(
            name="Public Works Department",
            code="PWD",
            description="Roads and Bridges",
            contact_email="pwd@kerala.gov.in"
        )

        # Create Users
        self.citizen = User.objects.create_user(
            email="citizen@example.com",
            password="Password123!",
            full_name="Anoop Kumar",
            role=User.Role.CITIZEN
        )

        self.cmo_admin = User.objects.create_user(
            email="cmo@kerala.gov.in",
            password="Password123!",
            full_name="CMO Secretary",
            role=User.Role.CMO_ADMIN
        )

        self.officer = User.objects.create_user(
            email="officer.pwd@kerala.gov.in",
            password="Password123!",
            full_name="Executive Engineer Suresh",
            role=User.Role.OFFICER,
            department=self.dept
        )

        self.other_citizen = User.objects.create_user(
            email="other@example.com",
            password="Password123!",
            full_name="Bina Roy",
            role=User.Role.CITIZEN
        )

    # -------------------------------------------------------------------------
    # Citizen API Tests
    # -------------------------------------------------------------------------
    def test_citizen_submit_grievance_and_history(self):
        self.client.force_authenticate(user=self.citizen)
        payload = {
            "district": District.THIRUVANANTHAPURAM,
            "category": GrievanceCategory.PUBLIC_WORKS,
            "subject": "Potholes on MG Road",
            "description": "Large potholes near Secretariat causing severe traffic bottlenecks.",
            "priority": GrievancePriority.HIGH
        }
        response = self.client.post("/api/grievances/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertTrue(data["reference_number"].startswith("JK-"))
        self.assertEqual(data["status"], GrievanceStatus.SUBMITTED)

        # Verify Grievance created in DB
        grievance = Grievance.objects.get(reference_number=data["reference_number"])
        self.assertEqual(grievance.citizen, self.citizen)

        # Verify initial GrievanceHistory was created automatically
        history_qs = grievance.history.all()
        self.assertEqual(history_qs.count(), 1)
        self.assertEqual(history_qs.first().new_status, GrievanceStatus.SUBMITTED)

    def test_citizen_list_and_retrieve_own_grievance(self):
        # Create grievance for citizen
        grievance = Grievance.objects.create(
            citizen=self.citizen,
            district=District.ERNAKULAM,
            category=GrievanceCategory.HEALTHCARE,
            subject="Primary Health Centre medicines",
            description="Shortage of basic diabetes medicines."
        )

        # Create another citizen's grievance
        Grievance.objects.create(
            citizen=self.other_citizen,
            district=District.KOZHIKODE,
            category=GrievanceCategory.WATER_RESOURCES,
            subject="Water pipeline burst",
            description="Water burst in Calicut."
        )

        self.client.force_authenticate(user=self.citizen)
        response = self.client.get("/api/grievances/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see own grievances
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["reference_number"], grievance.reference_number)

        # Retrieve detail
        detail_resp = self.client.get(f"/api/grievances/{grievance.id}/")
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_resp.data["subject"], grievance.subject)

    def test_track_grievance_public(self):
        grievance = Grievance.objects.create(
            citizen=self.citizen,
            district=District.PALAKKAD,
            category=GrievanceCategory.ELECTRICITY,
            subject="Power fluctuations in Palakkad",
            description="Frequent voltage drops."
        )

        # No auth needed
        response = self.client.get(f"/api/grievances/track/?ref={grievance.reference_number}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reference_number"], grievance.reference_number)
        self.assertEqual(response.data["status"], GrievanceStatus.SUBMITTED)

        # Invalid ref
        invalid_resp = self.client.get("/api/grievances/track/?ref=JK-9999-999999")
        self.assertEqual(invalid_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_upload_attachment(self):
        grievance = Grievance.objects.create(
            citizen=self.citizen,
            district=District.KANNUR,
            category=GrievanceCategory.ENVIRONMENT,
            subject="Illegal tree cutting",
            description="Cutting trees on government land."
        )

        self.client.force_authenticate(user=self.citizen)
        test_file = SimpleUploadedFile("evidence.jpg", b"fake_image_content", content_type="image/jpeg")
        response = self.client.post(
            f"/api/grievances/{grievance.id}/attachments/",
            {"file": test_file, "original_filename": "evidence.jpg"},
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(grievance.attachments.count(), 1)

    # -------------------------------------------------------------------------
    # CMO Admin API Tests
    # -------------------------------------------------------------------------
    def test_cmo_dashboard_and_list(self):
        Grievance.objects.create(
            citizen=self.citizen,
            district=District.THIRUVANANTHAPURAM,
            category=GrievanceCategory.PUBLIC_WORKS,
            subject="Test Dashboard Grievance",
            description="Test"
        )

        self.client.force_authenticate(user=self.cmo_admin)
        dash_resp = self.client.get("/api/cmo/dashboard/")
        self.assertEqual(dash_resp.status_code, status.HTTP_200_OK)
        self.assertIn("total", dash_resp.data)
        self.assertIn("by_status", dash_resp.data)
        self.assertIn("by_priority", dash_resp.data)
        self.assertIn("by_district", dash_resp.data)
        self.assertIn("recent", dash_resp.data)

        list_resp = self.client.get("/api/cmo/grievances/")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)

    def test_cmo_assign_department_updates_status(self):
        grievance = Grievance.objects.create(
            citizen=self.citizen,
            district=District.THIRUVANANTHAPURAM,
            category=GrievanceCategory.PUBLIC_WORKS,
            subject="Bridge maintenance",
            description="Bridge repair needed."
        )

        self.client.force_authenticate(user=self.cmo_admin)
        payload = {
            "department_id": self.dept.id,
            "officer_id": self.officer.id,
            "assignment_notes": "Please conduct an immediate site inspection."
        }
        assign_resp = self.client.post(f"/api/cmo/grievances/{grievance.id}/assign/", payload, format="json")
        self.assertEqual(assign_resp.status_code, status.HTTP_201_CREATED)

        grievance.refresh_from_db()
        # Per prompt: "Create assignment, update status to Under Review"
        self.assertEqual(grievance.status, GrievanceStatus.UNDER_REVIEW)
        self.assertEqual(grievance.assignments.filter(is_active=True).count(), 1)
        self.assertEqual(grievance.assignments.first().assigned_officer, self.officer)

    def test_cmo_add_internal_remark_confidentiality(self):
        grievance = Grievance.objects.create(
            citizen=self.citizen,
            district=District.THIRUVANANTHAPURAM,
            category=GrievanceCategory.LAW_AND_ORDER,
            subject="Internal Security Enquiry",
            description="Needs verification."
        )

        # CMO adds remark
        self.client.force_authenticate(user=self.cmo_admin)
        remark_resp = self.client.post(
            f"/api/cmo/grievances/{grievance.id}/internal-remarks/",
            {"remark": "Special surveillance requested by SP."},
            format="json"
        )
        self.assertEqual(remark_resp.status_code, status.HTTP_201_CREATED)

        # CMO detail view shows internal remarks
        cmo_detail = self.client.get(f"/api/cmo/grievances/{grievance.id}/")
        self.assertEqual(cmo_detail.status_code, status.HTTP_200_OK)
        self.assertIn("internal_remarks", cmo_detail.data)
        self.assertEqual(len(cmo_detail.data["internal_remarks"]), 1)

        # Citizen detail view HIDES internal remarks
        self.client.force_authenticate(user=self.citizen)
        citizen_detail = self.client.get(f"/api/grievances/{grievance.id}/")
        self.assertEqual(citizen_detail.status_code, status.HTTP_200_OK)
        self.assertNotIn("internal_remarks", citizen_detail.data)

    def test_cmo_escalate_grievance(self):
        grievance = Grievance.objects.create(
            citizen=self.citizen,
            district=District.IDUKKI,
            category=GrievanceCategory.PUBLIC_WORKS,
            subject="Landslide hazard on ghat road",
            description="Danger of rocks falling.",
            priority=GrievancePriority.LOW
        )

        self.client.force_authenticate(user=self.cmo_admin)
        resp = self.client.post(
            f"/api/cmo/grievances/{grievance.id}/escalate/",
            {"priority": GrievancePriority.URGENT, "remarks": "High alert in the area."},
            format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        grievance.refresh_from_db()
        self.assertEqual(grievance.priority, GrievancePriority.URGENT)

    # -------------------------------------------------------------------------
    # Officer API Tests
    # -------------------------------------------------------------------------
    def test_officer_dashboard_and_action_report_workflow(self):
        grievance = Grievance.objects.create(
            citizen=self.citizen,
            district=District.THIRUVANANTHAPURAM,
            category=GrievanceCategory.PUBLIC_WORKS,
            subject="Culvert cleaning needed",
            description="Drain choked with silt."
        )

        # Assign to officer
        DepartmentAssignment.objects.create(
            grievance=grievance,
            department=self.dept,
            assigned_officer=self.officer,
            assigned_by=self.cmo_admin,
            is_active=True
        )

        # Officer checks dashboard
        self.client.force_authenticate(user=self.officer)
        dash_resp = self.client.get("/api/officer/dashboard/")
        self.assertEqual(dash_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(dash_resp.data["total_assigned"], 1)

        # Officer views grievances list
        list_resp = self.client.get("/api/officer/grievances/")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        results = list_resp.data.get('results', list_resp.data)
        self.assertEqual(len(results), 1)

        # Officer updates status to In Progress
        status_resp = self.client.post(
            f"/api/officer/grievances/{grievance.id}/update-status/",
            {"status": GrievanceStatus.IN_PROGRESS, "remarks": "Field work commenced."},
            format="json"
        )
        self.assertEqual(status_resp.status_code, status.HTTP_200_OK)
        grievance.refresh_from_db()
        self.assertEqual(grievance.status, GrievanceStatus.IN_PROGRESS)

        # Officer submits Action Taken Report
        atr_resp = self.client.post(
            f"/api/officer/grievances/{grievance.id}/action-report/",
            {"report_text": "Culvert desilted and cleared using JCB on 17/11/2026."},
            format="multipart"
        )
        self.assertEqual(atr_resp.status_code, status.HTTP_201_CREATED)
        atr_id = atr_resp.data["id"]

        # CMO reviews and approves ATR -> grievance resolved
        self.client.force_authenticate(user=self.cmo_admin)
        review_resp = self.client.post(
            f"/api/cmo/action-reports/{atr_id}/review/",
            {"cmo_review_status": ActionTakenReport.ReviewStatus.APPROVED, "cmo_remarks": "Work verified by AE."},
            format="json"
        )
        self.assertEqual(review_resp.status_code, status.HTTP_200_OK)
        grievance.refresh_from_db()
        self.assertEqual(grievance.status, GrievanceStatus.RESOLVED)
        self.assertIsNotNone(grievance.resolved_at)

        # Citizen submits feedback for resolved grievance
        self.client.force_authenticate(user=self.citizen)
        feedback_resp = self.client.post(
            f"/api/grievances/{grievance.id}/feedback/",
            {"rating": 5, "comments": "Excellent prompt resolution!"},
            format="json"
        )
        self.assertEqual(feedback_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(grievance.feedback.rating, 5)
