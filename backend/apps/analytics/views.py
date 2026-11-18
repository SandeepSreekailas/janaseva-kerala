"""
Analytics and Reporting Views for Janaseva Kerala Portal.
Provides aggregated insights for CMO Administration.
"""
from datetime import timedelta
from django.db.models import Count, Avg, F, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apps.accounts.permissions import IsCMOAdmin
from apps.departments.models import Department
from apps.grievances.models import (
    Grievance,
    GrievanceStatus,
)


class AnalyticsDashboardView(APIView):
    """
    Statewide Grievance Analytics Dashboard for CMO Administrators.
    Computes high-level KPIs, distributions by status, priority, district, category,
    monthly trends for the last 6 months, and departmental performance benchmarks.
    """
    permission_classes = [IsCMOAdmin]

    @extend_schema(
        summary="CMO Analytics Dashboard",
        description=(
            "Retrieve statewide analytics for CMO administrators: "
            "total_grievances, by_status, by_priority, by_district, by_category, "
            "monthly_trend (last 6 months), and department_performance."
        ),
        responses={
            200: OpenApiResponse(description="Statewide analytics summary successfully retrieved.")
        }
    )
    def get(self, request, *args, **kwargs):
        # Base querysets
        grievances = Grievance.objects.all()

        # Optional filters
        district = request.query_params.get('district')
        if district:
            grievances = grievances.filter(district=district)

        category = request.query_params.get('category')
        if category:
            grievances = grievances.filter(category=category)

        # 1. Total Grievances
        total_grievances = grievances.count()

        # 2. Grievances grouped by Status
        by_status = list(
            grievances.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )

        # 3. Grievances grouped by Priority
        by_priority = list(
            grievances.values('priority')
            .annotate(count=Count('id'))
            .order_by('priority')
        )

        # 4. Grievances grouped by District
        by_district = list(
            grievances.values('district')
            .annotate(count=Count('id'))
            .order_by('district')
        )

        # 5. Grievances grouped by Category
        by_category = list(
            grievances.values('category')
            .annotate(count=Count('id'))
            .order_by('category')
        )

        # 6. Monthly Trend for the last 6 months using TruncMonth
        now = timezone.now()
        six_months_ago = now - timedelta(days=180)

        monthly_qs = (
            grievances.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(
                count=Count('id'),
                total=Count('id'),
                resolved=Count('id', filter=Q(status=GrievanceStatus.RESOLVED)),
                pending=Count('id', filter=~Q(status=GrievanceStatus.RESOLVED)),
            )
            .order_by('month')
        )

        agg_by_month = {}
        for item in monthly_qs:
            m = item['month']
            m_str = m.strftime('%Y-%m') if hasattr(m, 'strftime') else str(m)[:7]
            agg_by_month[m_str] = item

        monthly_trend = []
        for i in range(5, -1, -1):
            year = now.year
            month = now.month - i
            while month <= 0:
                month += 12
                year -= 1
            m_str = f"{year:04d}-{month:02d}"

            item = agg_by_month.get(m_str)
            if item:
                monthly_trend.append({
                    'month': m_str,
                    'count': item['count'],
                    'total': item['total'],
                    'resolved': item['resolved'],
                    'pending': item['pending'],
                })
            else:
                monthly_trend.append({
                    'month': m_str,
                    'count': 0,
                    'total': 0,
                    'resolved': 0,
                    'pending': 0,
                })

        # 7. Department Performance benchmarks using Count, Avg, F, Q
        dept_qs = (
            Department.objects.filter(is_active=True)
            .annotate(
                total_assigned=Count('assignments__grievance', distinct=True),
                resolved_count=Count(
                    'assignments__grievance',
                    filter=Q(assignments__grievance__status=GrievanceStatus.RESOLVED),
                    distinct=True
                ),
                pending_count=Count(
                    'assignments__grievance',
                    filter=~Q(assignments__grievance__status=GrievanceStatus.RESOLVED) & Q(assignments__grievance__isnull=False),
                    distinct=True
                ),
                avg_rating=Avg('assignments__grievance__feedback__rating'),
                avg_resolution_time=Avg(
                    F('assignments__grievance__resolved_at') - F('assignments__grievance__created_at'),
                    filter=Q(assignments__grievance__status=GrievanceStatus.RESOLVED) & Q(assignments__grievance__resolved_at__isnull=False)
                )
            )
            .values(
                'id',
                'name',
                'code',
                'total_assigned',
                'resolved_count',
                'pending_count',
                'avg_rating',
                'avg_resolution_time',
            )
            .order_by('-total_assigned', 'name')
        )

        department_performance = []
        for d in dept_qs:
            total = d['total_assigned']
            resolved = d['resolved_count']
            pending = d['pending_count']
            res_rate = round((resolved / total * 100), 1) if total > 0 else 0.0

            res_time = d['avg_resolution_time']
            if res_time is not None:
                if isinstance(res_time, timedelta):
                    total_sec = res_time.total_seconds()
                    avg_days = max(0.0, round(total_sec / 86400, 1))
                else:
                    try:
                        avg_days = max(0.0, round(float(res_time) / 86400, 1))
                    except (ValueError, TypeError):
                        avg_days = None
            else:
                avg_days = None

            avg_rating = round(d['avg_rating'], 2) if d['avg_rating'] is not None else None

            department_performance.append({
                'id': d['id'],
                'name': d['name'],
                'code': d['code'],
                'total_assigned': total,
                'resolved_count': resolved,
                'pending_count': pending,
                'resolution_rate': res_rate,
                'avg_rating': avg_rating,
                'avg_resolution_days': avg_days,
            })

        return Response({
            'total_grievances': total_grievances,
            'by_status': by_status,
            'by_priority': by_priority,
            'by_district': by_district,
            'by_category': by_category,
            'monthly_trend': monthly_trend,
            'department_performance': department_performance,
        }, status=status.HTTP_200_OK)
