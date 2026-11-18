import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.accounts.models import User
from apps.departments.models import Department
from apps.grievances.models import (
    District,
    GrievanceCategory,
    GrievancePriority,
    GrievanceStatus,
    Grievance,
    GrievanceHistory,
    DepartmentAssignment,
    ActionTakenReport,
    CitizenFeedback,
    InternalRemark,
)
from apps.notifications.models import Notification
from apps.enquiries.models import ContactEnquiry


class Command(BaseCommand):
    help = 'Seed initial demonstration data for Janaseva Kerala grievance portal'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting Janaseva Kerala demo data seeding...'))

        # ---------------------------------------------------------------------
        # 1. DEPARTMENTS (8)
        # ---------------------------------------------------------------------
        self.stdout.write('\n--- Seeding Departments ---')
        departments_data = [
            {
                'code': 'PWD',
                'name': 'Public Works Department',
                'description': 'Responsible for planning, construction, and maintenance of roads, bridges, and public infrastructure.',
                'contact_email': 'pwd@janaseva.kerala.gov.in',
            },
            {
                'code': 'HLT',
                'name': 'Health and Family Welfare Department',
                'description': 'Oversees public healthcare institutions, disease surveillance, medical colleges, and community wellness.',
                'contact_email': 'health@janaseva.kerala.gov.in',
            },
            {
                'code': 'EDU',
                'name': 'General Education Department',
                'description': 'Administers primary, secondary, and higher secondary education institutions and public school infrastructure.',
                'contact_email': 'education@janaseva.kerala.gov.in',
            },
            {
                'code': 'LSG',
                'name': 'Local Self Government Department',
                'description': 'Coordinates Grama Panchayats, Municipalities, and Municipal Corporations for local civic amenities and sanitation.',
                'contact_email': 'lsgd@janaseva.kerala.gov.in',
            },
            {
                'code': 'WRD',
                'name': 'Water Resources Department',
                'description': 'Responsible for drinking water distribution (KWA), irrigation schemes, and river basin protection.',
                'contact_email': 'water@janaseva.kerala.gov.in',
            },
            {
                'code': 'KSEB',
                'name': 'Kerala State Electricity Board',
                'description': 'State electricity utility managing electrical transmission, distribution, and transformer maintenance.',
                'contact_email': 'kseb@janaseva.kerala.gov.in',
            },
            {
                'code': 'TRN',
                'name': 'Transport Department',
                'description': 'Oversees public transport (KSRTC), motor vehicle regulation, traffic management, and road safety.',
                'contact_email': 'transport@janaseva.kerala.gov.in',
            },
            {
                'code': 'REV',
                'name': 'Revenue Department',
                'description': 'Administers land records, survey, mutation, land revenue administration, and disaster relief.',
                'contact_email': 'revenue@janaseva.kerala.gov.in',
            },
        ]

        departments_by_code = {}
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                code=dept_data['code'],
                defaults={
                    'name': dept_data['name'],
                    'description': dept_data['description'],
                    'contact_email': dept_data['contact_email'],
                    'is_active': True,
                }
            )
            departments_by_code[dept.code] = dept
            status_text = 'Created' if created else 'Already exists'
            self.stdout.write(f"  [{status_text}] Department: {dept.name} ({dept.code})")

        # ---------------------------------------------------------------------
        # 2. USERS
        # ---------------------------------------------------------------------
        self.stdout.write('\n--- Seeding Users ---')

        # 2a. CMO Administrator
        cmo_email = 'cmo@janaseva.kerala.gov.in'
        cmo_password = 'admin123'
        cmo_user, created = User.objects.get_or_create(
            email=cmo_email,
            defaults={
                'full_name': 'Chief Minister Office Administrator',
                'role': User.Role.CMO_ADMIN,
                'mobile': '9847000001',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        cmo_user.set_password(cmo_password)
        cmo_user.role = User.Role.CMO_ADMIN
        cmo_user.is_staff = True
        cmo_user.is_superuser = True
        cmo_user.save()
        status_text = 'Created' if created else 'Updated'
        self.stdout.write(f"  [{status_text}] CMO Admin: {cmo_user.email} (role={cmo_user.role})")

        # 2b. 8 Officers (one per department)
        officers_data = [
            {
                'code': 'PWD',
                'email': 'officer.pwd@janaseva.kerala.gov.in',
                'full_name': 'Er. Rajesh Kumar',
                'mobile': '9847100001',
            },
            {
                'code': 'HLT',
                'email': 'officer.hlt@janaseva.kerala.gov.in',
                'full_name': 'Dr. Ananya Nair',
                'mobile': '9847100002',
            },
            {
                'code': 'EDU',
                'email': 'officer.edu@janaseva.kerala.gov.in',
                'full_name': 'Prof. Suresh Menon',
                'mobile': '9847100003',
            },
            {
                'code': 'LSG',
                'email': 'officer.lsg@janaseva.kerala.gov.in',
                'full_name': 'Smt. Bindu Thomas',
                'mobile': '9847100004',
            },
            {
                'code': 'WRD',
                'email': 'officer.wrd@janaseva.kerala.gov.in',
                'full_name': 'Er. Manoj Pillai',
                'mobile': '9847100005',
            },
            {
                'code': 'KSEB',
                'email': 'officer.kseb@janaseva.kerala.gov.in',
                'full_name': 'Er. Deepa Varma',
                'mobile': '9847100006',
            },
            {
                'code': 'TRN',
                'email': 'officer.trn@janaseva.kerala.gov.in',
                'full_name': 'Shri. Arun Chandran',
                'mobile': '9847100007',
            },
            {
                'code': 'REV',
                'email': 'officer.rev@janaseva.kerala.gov.in',
                'full_name': 'Shri. George Joseph',
                'mobile': '9847100008',
            },
        ]

        officers_by_code = {}
        officer_password = 'officer123'
        for off_data in officers_data:
            dept = departments_by_code[off_data['code']]
            officer, created = User.objects.get_or_create(
                email=off_data['email'],
                defaults={
                    'full_name': off_data['full_name'],
                    'role': User.Role.OFFICER,
                    'department': dept,
                    'mobile': off_data['mobile'],
                    'is_staff': True,
                    'is_active': True,
                }
            )
            officer.set_password(officer_password)
            officer.department = dept
            officer.role = User.Role.OFFICER
            officer.is_staff = True
            officer.save()
            officers_by_code[dept.code] = officer
            status_text = 'Created' if created else 'Updated'
            self.stdout.write(f"  [{status_text}] Officer: {officer.email} -> {dept.code}")

        # 2c. 2 Citizens
        citizens_data = [
            {
                'email': 'citizen@example.com',
                'password': 'citizen123',
                'full_name': 'Kavitha R Nair',
                'mobile': '9847200001',
            },
            {
                'email': 'citizen2@example.com',
                'password': 'citizen123',
                'full_name': 'Rahul K Varma',
                'mobile': '9847200002',
            },
        ]

        citizens = []
        for c_data in citizens_data:
            citizen, created = User.objects.get_or_create(
                email=c_data['email'],
                defaults={
                    'full_name': c_data['full_name'],
                    'role': User.Role.CITIZEN,
                    'mobile': c_data['mobile'],
                    'is_staff': False,
                    'is_active': True,
                }
            )
            citizen.set_password(c_data['password'])
            citizen.role = User.Role.CITIZEN
            citizen.save()
            citizens.append(citizen)
            status_text = 'Created' if created else 'Updated'
            self.stdout.write(f"  [{status_text}] Citizen: {citizen.email}")

        citizen1 = citizens[0]
        citizen2 = citizens[1]

        # ---------------------------------------------------------------------
        # 3. SAMPLE GRIEVANCES (5)
        # ---------------------------------------------------------------------
        self.stdout.write('\n--- Seeding Sample Grievances ---')

        now = timezone.now()

        # Grievance 1: Resolved (PWD)
        g1_ref = 'JK-2026-000001'
        g1, g1_created = Grievance.objects.get_or_create(
            reference_number=g1_ref,
            defaults={
                'citizen': citizen1,
                'district': District.THIRUVANANTHAPURAM,
                'category': GrievanceCategory.PUBLIC_WORKS,
                'subject': 'Severe potholes on MG Road near East Fort bus terminal',
                'description': (
                    'Major crater-sized potholes have developed near East Fort bus stand following '
                    'heavy monsoon rains, causing severe traffic jams and frequent two-wheeler accidents '
                    'during peak office hours.'
                ),
                'priority': GrievancePriority.HIGH,
                'status': GrievanceStatus.RESOLVED,
                'ai_summary': 'Hazardous potholes on MG Road East Fort causing traffic congestion and accidents.',
                'ai_suggested_department': 'Public Works Department',
                'ai_suggested_category': 'Public Works',
                'ai_suggested_priority': 'High',
                'resolved_at': now - datetime.timedelta(days=1),
                'due_date': now + datetime.timedelta(days=5),
            }
        )
        self.stdout.write(f"  [{'Created' if g1_created else 'Already exists'}] Grievance 1: {g1.reference_number} [{g1.status}]")

        # History for Grievance 1
        g1_history = [
            ('None', GrievanceStatus.SUBMITTED, 'Grievance submitted by citizen with site photographs.', citizen1),
            (GrievanceStatus.SUBMITTED, GrievanceStatus.UNDER_REVIEW, 'CMO desk reviewed and acknowledged public hazard severity.', cmo_user),
            (GrievanceStatus.UNDER_REVIEW, GrievanceStatus.IN_PROGRESS, 'Assigned to Public Works Department for urgent rectification.', cmo_user),
            (GrievanceStatus.IN_PROGRESS, GrievanceStatus.RESOLVED, 'Action Taken Report reviewed and approved by CMO. Grievance resolved.', cmo_user),
        ]
        for prev, new_st, rem, actor in g1_history:
            GrievanceHistory.objects.get_or_create(
                grievance=g1,
                previous_status=prev,
                new_status=new_st,
                defaults={'remarks': rem, 'changed_by': actor}
            )

        # Department Assignment for Grievance 1
        DepartmentAssignment.objects.get_or_create(
            grievance=g1,
            department=departments_by_code['PWD'],
            defaults={
                'assigned_officer': officers_by_code['PWD'],
                'assigned_by': cmo_user,
                'assignment_notes': 'High priority road safety issue. Immediate patch work and resurfacing required.',
                'is_active': True,
            }
        )

        # Action Taken Report for Grievance 1 (Approved)
        ActionTakenReport.objects.get_or_create(
            grievance=g1,
            officer=officers_by_code['PWD'],
            defaults={
                'report_text': (
                    'Site inspection conducted by Executive Engineer (Roads Division). Bituminous cold-mix patching '
                    'completed along the 250-meter stretch on MG Road. Road condition restored to safe motorable standards.'
                ),
                'cmo_review_status': ActionTakenReport.ReviewStatus.APPROVED,
                'cmo_remarks': 'Verified by CMO field team with photographic evidence. Resolution approved.',
                'reviewed_at': now - datetime.timedelta(days=1),
            }
        )

        # Citizen Feedback for Grievance 1
        CitizenFeedback.objects.get_or_create(
            grievance=g1,
            defaults={
                'citizen': citizen1,
                'rating': 5,
                'comments': 'Prompt action taken by PWD within 48 hours. The road is now smooth and safe. Commendable work!',
            }
        )

        # Internal Remark for Grievance 1
        InternalRemark.objects.get_or_create(
            grievance=g1,
            admin=cmo_user,
            defaults={
                'remark': 'Priority intervention verified under Chief Minister 100-Day Urban Infrastructure Action Plan.',
            }
        )

        # Grievance 2: In Progress (WRD)
        g2_ref = 'JK-2026-000002'
        g2, g2_created = Grievance.objects.get_or_create(
            reference_number=g2_ref,
            defaults={
                'citizen': citizen1,
                'district': District.ERNAKULAM,
                'category': GrievanceCategory.WATER_RESOURCES,
                'subject': 'Major drinking water pipeline rupture near Kaloor Stadium Link Road',
                'description': (
                    'A primary distribution pipeline has burst, causing substantial road inundation '
                    'and complete disruption of potable water supply to over 400 households in Kaloor and Palarivattom areas.'
                ),
                'priority': GrievancePriority.URGENT,
                'status': GrievanceStatus.IN_PROGRESS,
                'ai_summary': 'Major water pipeline burst disrupting supply to 400+ households in Kaloor.',
                'ai_suggested_department': 'Water Resources Department',
                'ai_suggested_category': 'Water Resources',
                'ai_suggested_priority': 'Urgent',
                'due_date': now + datetime.timedelta(days=2),
            }
        )
        self.stdout.write(f"  [{'Created' if g2_created else 'Already exists'}] Grievance 2: {g2.reference_number} [{g2.status}]")

        g2_history = [
            ('None', GrievanceStatus.SUBMITTED, 'Citizen registered urgent drinking water supply complaint.', citizen1),
            (GrievanceStatus.SUBMITTED, GrievanceStatus.UNDER_REVIEW, 'CMO priority desk flagged as critical civic emergency.', cmo_user),
            (GrievanceStatus.UNDER_REVIEW, GrievanceStatus.IN_PROGRESS, 'Assigned to Kerala Water Authority rapid response team.', cmo_user),
        ]
        for prev, new_st, rem, actor in g2_history:
            GrievanceHistory.objects.get_or_create(
                grievance=g2,
                previous_status=prev,
                new_status=new_st,
                defaults={'remarks': rem, 'changed_by': actor}
            )

        DepartmentAssignment.objects.get_or_create(
            grievance=g2,
            department=departments_by_code['WRD'],
            defaults={
                'assigned_officer': officers_by_code['WRD'],
                'assigned_by': cmo_user,
                'assignment_notes': 'Urgent pipeline repair. Water tankers mobilized to provide relief to affected households.',
                'is_active': True,
            }
        )

        # Grievance 3: Under Review (LSG)
        g3_ref = 'JK-2026-000003'
        g3, g3_created = Grievance.objects.get_or_create(
            reference_number=g3_ref,
            defaults={
                'citizen': citizen2,
                'district': District.KOZHIKODE,
                'category': GrievanceCategory.LOCAL_GOVERNANCE,
                'subject': 'Solid waste accumulation and foul smell near Mavoor Road market',
                'description': (
                    'Garbage collection has stalled for five consecutive days near the Mavoor Road wholesale market. '
                    'Waste heaps are spilling onto pedestrian walkways and attracting stray animals.'
                ),
                'priority': GrievancePriority.MEDIUM,
                'status': GrievanceStatus.UNDER_REVIEW,
                'ai_summary': 'Municipal waste backlog and hygiene hazard on Mavoor Road commercial zone.',
                'ai_suggested_department': 'Local Self Government Department',
                'ai_suggested_category': 'Local Self Government',
                'ai_suggested_priority': 'Medium',
                'due_date': now + datetime.timedelta(days=7),
            }
        )
        self.stdout.write(f"  [{'Created' if g3_created else 'Already exists'}] Grievance 3: {g3.reference_number} [{g3.status}]")

        g3_history = [
            ('None', GrievanceStatus.SUBMITTED, 'Grievance submitted by citizen via portal.', citizen2),
            (GrievanceStatus.SUBMITTED, GrievanceStatus.UNDER_REVIEW, 'CMO triage officer reviewing sanitation complaint for municipal allocation.', cmo_user),
        ]
        for prev, new_st, rem, actor in g3_history:
            GrievanceHistory.objects.get_or_create(
                grievance=g3,
                previous_status=prev,
                new_status=new_st,
                defaults={'remarks': rem, 'changed_by': actor}
            )

        # Grievance 4: Submitted (KSEB)
        g4_ref = 'JK-2026-000004'
        g4, g4_created = Grievance.objects.get_or_create(
            reference_number=g4_ref,
            defaults={
                'citizen': citizen2,
                'district': District.PALAKKAD,
                'category': GrievanceCategory.ELECTRICITY,
                'subject': 'Precariously leaning electric post along Alathur school route',
                'description': (
                    'An electric post carrying high-voltage distribution lines has tilted sharply after soil erosion '
                    'near the Alathur LP School compound wall. Poses serious electrocution hazard to passing children.'
                ),
                'priority': GrievancePriority.HIGH,
                'status': GrievanceStatus.SUBMITTED,
                'ai_summary': 'Tilted electric post posing acute safety risk near primary school.',
                'ai_suggested_department': 'Kerala State Electricity Board',
                'ai_suggested_category': 'Electricity',
                'ai_suggested_priority': 'High',
                'due_date': now + datetime.timedelta(days=3),
            }
        )
        self.stdout.write(f"  [{'Created' if g4_created else 'Already exists'}] Grievance 4: {g4.reference_number} [{g4.status}]")

        g4_history = [
            ('None', GrievanceStatus.SUBMITTED, 'Grievance submitted and queued for CMO intake triage.', citizen2),
        ]
        for prev, new_st, rem, actor in g4_history:
            GrievanceHistory.objects.get_or_create(
                grievance=g4,
                previous_status=prev,
                new_status=new_st,
                defaults={'remarks': rem, 'changed_by': actor}
            )

        # Grievance 5: Reopened (HLT)
        g5_ref = 'JK-2026-000005'
        g5, g5_created = Grievance.objects.get_or_create(
            reference_number=g5_ref,
            defaults={
                'citizen': citizen1,
                'district': District.KOTTAYAM,
                'category': GrievanceCategory.HEALTHCARE,
                'subject': 'Repeated shortage of anti-rabies immunoglobulins at Taluk Hospital',
                'description': (
                    'Anti-rabies vaccine stock was briefly refilled but exhausted within 24 hours. Emergency bite '
                    'patients are once again being directed to outside retail pharmacies at high cost.'
                ),
                'priority': GrievancePriority.MEDIUM,
                'status': GrievanceStatus.REOPENED,
                'ai_summary': 'Recurring stockout of anti-rabies vaccines and serum at Taluk Hospital.',
                'ai_suggested_department': 'Health and Family Welfare Department',
                'ai_suggested_category': 'Healthcare',
                'ai_suggested_priority': 'Medium',
                'due_date': now + datetime.timedelta(days=4),
            }
        )
        self.stdout.write(f"  [{'Created' if g5_created else 'Already exists'}] Grievance 5: {g5.reference_number} [{g5.status}]")

        g5_history = [
            ('None', GrievanceStatus.SUBMITTED, 'Citizen submitted complaint regarding vaccine availability.', citizen1),
            (GrievanceStatus.SUBMITTED, GrievanceStatus.UNDER_REVIEW, 'CMO forwarded to Health Services Directorate.', cmo_user),
            (GrievanceStatus.UNDER_REVIEW, GrievanceStatus.IN_PROGRESS, 'Assigned to District Medical Officer for emergency supply allocation.', cmo_user),
            (GrievanceStatus.IN_PROGRESS, GrievanceStatus.RESOLVED, 'Hospital claimed batch replenished from central medical stores.', cmo_user),
            (GrievanceStatus.RESOLVED, GrievanceStatus.REOPENED, 'Citizen reopened grievance: stock ran out again next day; patients still turned away.', citizen1),
        ]
        for prev, new_st, rem, actor in g5_history:
            GrievanceHistory.objects.get_or_create(
                grievance=g5,
                previous_status=prev,
                new_status=new_st,
                defaults={'remarks': rem, 'changed_by': actor}
            )

        DepartmentAssignment.objects.get_or_create(
            grievance=g5,
            department=departments_by_code['HLT'],
            defaults={
                'assigned_officer': officers_by_code['HLT'],
                'assigned_by': cmo_user,
                'assignment_notes': 'Investigate supply chain logs and establish permanent minimum safety stock threshold at Taluk level.',
                'is_active': True,
            }
        )

        InternalRemark.objects.get_or_create(
            grievance=g5,
            admin=cmo_user,
            defaults={
                'remark': 'CMO Special Cell flagged recurring medicine shortage issue to DHS directly.',
            }
        )

        # ---------------------------------------------------------------------
        # 4. NOTIFICATIONS & CONTACT ENQUIRIES (Optional bonus demonstration data)
        # ---------------------------------------------------------------------
        self.stdout.write('\n--- Seeding Demo Notifications & Enquiries ---')

        notifications_data = [
            {
                'user': citizen1,
                'title': f'Grievance {g1.reference_number} Resolved',
                'message': 'Your grievance regarding potholes on MG Road has been marked as resolved. Please provide your feedback.',
                'grievance': g1,
                'is_read': True,
            },
            {
                'user': officers_by_code['PWD'],
                'title': f'New Grievance Assigned: {g1.reference_number}',
                'message': 'CMO Admin has assigned grievance JK-2026-000001 to PWD for urgent resolution.',
                'grievance': g1,
                'is_read': True,
            },
            {
                'user': citizen1,
                'title': f'Grievance {g2.reference_number} In Progress',
                'message': 'Your water pipeline complaint has been assigned to Kerala Water Authority rapid response team.',
                'grievance': g2,
                'is_read': False,
            },
            {
                'user': citizen2,
                'title': f'Grievance {g4.reference_number} Received',
                'message': 'Your grievance regarding electric post safety has been registered and is under CMO triage.',
                'grievance': g4,
                'is_read': False,
            },
        ]
        for notif in notifications_data:
            Notification.objects.get_or_create(
                user=notif['user'],
                title=notif['title'],
                defaults={
                    'message': notif['message'],
                    'grievance': notif['grievance'],
                    'is_read': notif['is_read'],
                }
            )

        enquiries_data = [
            {
                'name': 'Dr. Madhavan Kutty',
                'email': 'madhavan.k@gmail.com',
                'subject': 'Accessibility features on Janaseva Kerala portal',
                'message': 'Can screen reader compatibility and Malayalam voice input be confirmed for visually impaired senior citizens?',
                'status': ContactEnquiry.Status.RESPONDED,
            },
            {
                'name': 'Lakshmi Menon',
                'email': 'lakshmi.m@yahoo.com',
                'subject': 'Grievance escalation timeline clarification',
                'message': 'How many working days must elapse before an unresolved departmental grievance is escalated to the CMO cell?',
                'status': ContactEnquiry.Status.NEW,
            },
        ]
        for eq in enquiries_data:
            ContactEnquiry.objects.get_or_create(
                email=eq['email'],
                subject=eq['subject'],
                defaults={
                    'name': eq['name'],
                    'message': eq['message'],
                    'status': eq['status'],
                }
            )

        self.stdout.write(self.style.SUCCESS('\nJanaseva Kerala demo data seeding completed successfully!'))
