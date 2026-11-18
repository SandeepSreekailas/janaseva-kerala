import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  MapPin,
  ClipboardList,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Inbox,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboard } from '../../api/cmo';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_COLORS = {
  Submitted: '#3B82F6',
  'Under Review': '#6366F1',
  'In Progress': '#0EA5E9',
  Resolved: '#16865B',
  Reopened: '#F97316',
  Pending: '#EAB308',
  Rejected: '#EF4444',
  Escalated: '#DC2626',
};

const DEFAULT_CHART_COLORS = [
  '#245A91',
  '#16865B',
  '#E4B84A',
  '#6366F1',
  '#0EA5E9',
  '#F97316',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#84CC16',
];

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Custom tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#17365D] text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
        <p className="font-semibold text-slate-200">{data.name}</p>
        <p className="text-[#E4B84A] font-bold text-sm mt-0.5">
          {data.value} grievances
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for District Bar Chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#17365D] text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
        <p className="font-semibold text-[#E4B84A]">{label}</p>
        <p className="text-white font-medium mt-1">
          Total Grievances: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function CMODashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load CMO dashboard metrics:', err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load CMO dashboard statistics. Please ensure backend services are running.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Transform District Data for Bar Chart
  const districtChartData = useMemo(() => {
    if (!data?.by_district) return [];
    if (Array.isArray(data.by_district)) {
      return data.by_district.map((item) => ({
        district: item.district || item.name,
        count: item.count ?? item.total ?? 0,
      }));
    }
    return Object.entries(data.by_district)
      .map(([district, count]) => ({
        district,
        count: Number(count) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Transform Status Data for Pie Chart
  const statusChartData = useMemo(() => {
    if (!data?.by_status) return [];
    if (Array.isArray(data.by_status)) {
      return data.by_status
        .map((item) => ({
          name: item.status || item.name,
          value: item.count ?? item.total ?? 0,
        }))
        .filter((d) => d.value > 0);
    }
    return Object.entries(data.by_status)
      .map(([status, value]) => ({
        name: status,
        value: Number(value) || 0,
      }))
      .filter((d) => d.value > 0);
  }, [data]);

  // Calculate resolution rate
  const resolvedCount = useMemo(() => {
    if (!data?.by_status) return 0;
    if (Array.isArray(data.by_status)) {
      const match = data.by_status.find(
        (s) => (s.status || s.name)?.toLowerCase() === 'resolved'
      );
      return match?.count || 0;
    }
    return (
      data.by_status['Resolved'] ||
      data.by_status['resolved'] ||
      0
    );
  }, [data]);

  const totalGrievances = data?.total || 0;
  const resolutionRate = totalGrievances > 0
    ? Math.round((resolvedCount / totalGrievances) * 100)
    : 0;

  const overdueCount = data?.overdue?.count ?? 0;
  const pendingAtrCount = data?.pending_atr_count ?? 0;

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <LoadingSpinner size="lg" text="Loading CMO Executive Dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#17365D] via-[#1e4676] to-[#245A91] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <ShieldCheck className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-[#E4B84A] mb-3 border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#16865B] animate-pulse" />
                Chief Minister&apos;s Office • Apex Grievance Redressal Cell
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                CMO Executive Dashboard
              </h1>
              <p className="text-slate-200 text-sm sm:text-base mt-1.5 max-w-2xl">
                Real-time oversight of public grievances, departmental action taken reports, and district-level redressal performance across Kerala.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20 disabled:opacity-50"
                title="Refresh dashboard metrics"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>

              <Link
                to="/cmo/grievances"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E4B84A] hover:bg-[#d6a938] text-[#17365D] text-sm font-bold transition-all shadow-sm hover:shadow active:scale-95"
              >
                <ClipboardList className="w-4 h-4" />
                Manage Grievances
              </Link>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchDashboardData()}
              className="text-xs font-semibold text-red-700 hover:text-red-800 underline ml-4 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Grievances */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Statewide Cases
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] mt-1.5">
                  {totalGrievances}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#245A91] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>All 14 Kerala districts</span>
              <Link
                to="/cmo/grievances"
                className="text-[#245A91] font-semibold hover:underline flex items-center gap-1"
              >
                Browse All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Pending ATRs */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending ATR Review
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1.5">
                  {pendingAtrCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Action reports awaiting CMO</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Requires Triage
              </span>
            </div>
          </div>

          {/* Overdue Grievances */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overdue SLA Breaches
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1.5">
                  {overdueCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Past deadline threshold</span>
              <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                High Priority
              </span>
            </div>
          </div>

          {/* Resolved & Resolution Rate */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Redressal Rate
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#16865B]">
                    {resolutionRate}%
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    ({resolvedCount} resolved)
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#16865B] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Citizen closure satisfaction</span>
              <Link
                to="/cmo/analytics"
                className="text-[#16865B] font-semibold hover:underline flex items-center gap-1"
              >
                Analytics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Charts Section: District BarChart & Status PieChart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* District Breakdown: 2 Cols */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#245A91]" />
                  Grievances by District
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Geographical distribution across 14 Kerala revenue districts
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {districtChartData.length} Districts Recorded
              </span>
            </div>

            <div className="h-80 w-full mt-4">
              {districtChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={districtChartData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="district"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                    />
                    <Bar
                      name="Grievances"
                      dataKey="count"
                      fill="#245A91"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Inbox className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-sm">No district data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown: 1 Col */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#16865B]" />
                Status Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current grievance workflow pipeline stages
              </p>
            </div>

            <div className="h-64 w-full mt-2 relative">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => {
                        const fill =
                          STATUS_COLORS[entry.name] ||
                          DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Inbox className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-sm">No status distribution records</p>
                </div>
              )}
            </div>

            {/* Custom Legend for status items */}
            <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              {statusChartData.map((item, index) => {
                const color =
                  STATUS_COLORS[item.name] ||
                  DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
                return (
                  <div key={item.name} className="flex items-center justify-between p-1 rounded hover:bg-slate-50">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900 ml-1">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority & Quick Actions Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Critical / Urgent Priority</p>
              <h4 className="text-xl font-bold text-red-600 mt-0.5">
                {data?.by_priority?.Urgent || data?.by_priority?.urgent || data?.by_priority?.Critical || 0} Cases
              </h4>
            </div>
            <Link
              to="/cmo/grievances?priority=Urgent"
              className="text-xs font-semibold text-[#245A91] hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              Filter Urgent <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Under Active Review</p>
              <h4 className="text-xl font-bold text-indigo-600 mt-0.5">
                {data?.by_status?.['Under Review'] || data?.by_status?.under_review || 0} Cases
              </h4>
            </div>
            <Link
              to="/cmo/grievances?status=Under+Review"
              className="text-xs font-semibold text-[#245A91] hover:underline flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
              Triage Now <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Comprehensive Insights</p>
              <h4 className="text-xl font-bold text-[#17365D] mt-0.5">
                Full Analytics Suite
              </h4>
            </div>
            <Link
              to="/cmo/analytics"
              className="text-xs font-semibold text-[#17365D] hover:underline flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Open Analytics
            </Link>
          </div>
        </div>

        {/* Recent Grievances Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#245A91]" />
                Recent Grievance Submissions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest submissions awaiting review or departmental progression
              </p>
            </div>
            <Link
              to="/cmo/grievances"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A91] hover:text-[#17365D] transition-colors"
            >
              View Full Repository <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Reference No.</th>
                  <th scope="col" className="px-5 py-3.5">Subject & Category</th>
                  <th scope="col" className="px-5 py-3.5">District</th>
                  <th scope="col" className="px-5 py-3.5">Priority</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5">Submitted</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recent && data.recent.length > 0 ? (
                  data.recent.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-5 py-4 font-mono font-medium text-[#17365D]">
                        <Link
                          to={`/cmo/grievances/${g.id}`}
                          className="hover:underline hover:text-[#245A91] inline-flex items-center gap-1"
                        >
                          {g.reference_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">
                          {g.subject}
                        </p>
                        <span className="text-xs text-slate-500">
                          {g.category || 'General'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {g.district}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <PriorityBadge priority={g.priority} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={g.status} />
                          {g.is_overdue && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(g.created_at)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/cmo/grievances/${g.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#17365D] bg-slate-100 hover:bg-[#245A91] hover:text-white transition-all shadow-2xs"
                        >
                          Review Case
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-400 stroke-1" />
                      <p className="font-medium">No recent grievances recorded.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
