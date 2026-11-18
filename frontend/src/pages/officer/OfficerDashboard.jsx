import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Building2,
  Calendar,
  MapPin,
  Eye,
  AlertCircle,
  FileText,
  ShieldCheck,
  Inbox,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboard } from '../../api/officer';
import { useAuth } from '../../contexts/AuthContext';

// Color palette matching the Janaseva Kerala design guidelines
const PRIORITY_COLORS = {
  Urgent: '#EF4444',
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#E4B84A',
  Low: '#16865B',
};

const STATUS_COLORS = {
  Submitted: '#3B82F6',
  'Under Review': '#6366F1',
  'In Progress': '#0EA5E9',
  Resolved: '#16865B',
  Reopened: '#F59E0B',
  Escalated: '#EF4444',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
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

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error('Error fetching officer dashboard:', err);
      setError(
        err?.response?.data?.detail ||
          'Failed to load officer dashboard data. Please verify your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Prepare Priority Chart Data
  const priorityChartData = useMemo(() => {
    if (!data?.by_priority) return [];
    return Object.entries(data.by_priority)
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0,
        color: PRIORITY_COLORS[name] || '#64748B',
      }))
      .filter((item) => item.value > 0);
  }, [data?.by_priority]);

  // Prepare Status Chart Data
  const statusChartData = useMemo(() => {
    if (!data?.by_status) return [];
    return Object.entries(data.by_status).map(([name, value]) => ({
      name,
      count: Number(value) || 0,
      fill: STATUS_COLORS[name] || '#245A91',
    }));
  }, [data?.by_status]);

  return (
    <ProtectedRoute requiredRole="officer">
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-[#17365D] via-[#1E4473] to-[#245A91] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform skew-x-12" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4B84A]/20 text-[#E4B84A] border border-[#E4B84A]/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Department Officer Portal
                  </span>
                  {user?.department?.name && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                      <Building2 className="w-3.5 h-3.5" />
                      {user.department.name}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome back, {user?.full_name || 'Officer'}
                </h1>
                <p className="text-blue-100 text-sm mt-1 max-w-2xl">
                  Chief Minister's Public Grievance Redressal System — Departmental Action & Investigation Desk.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => fetchDashboardData(true)}
                  disabled={refreshing || loading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20 transition-colors disabled:opacity-50"
                  title="Refresh Dashboard"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>

                <Link
                  to="/officer/grievances"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E4B84A] hover:bg-[#d9ad3e] text-[#17365D] text-sm font-semibold shadow-sm transition-all hover:shadow"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>View Assigned Cases</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-red-800">
                <p className="font-semibold">Unable to load dashboard</p>
                <p className="mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => fetchDashboardData()}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading Department Officer metrics...
              </p>
            </div>
          ) : (
            <>
              {/* Stat Cards Grid - 5 Core Redressal Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Assigned */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Total Assigned
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-50 text-[#17365D]">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#17365D]">
                      {data?.total_assigned ?? 0}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Cases in department jurisdiction</p>
                  </div>
                </div>

                {/* 2. Newly Assigned Cases */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Newly Assigned
                    </span>
                    <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                      {data?.newly_assigned ?? ((data?.by_status?.['Under Review'] || 0) + (data?.by_status?.['Submitted'] || 0))}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Awaiting investigation start</p>
                  </div>
                </div>

                {/* 3. Under Investigation */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Under Investigation
                    </span>
                    <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-sky-600">
                      {data?.under_investigation ?? (data?.by_status?.['In Progress'] || 0)}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Active field operations</p>
                  </div>
                </div>

                {/* 4. Reports Awaiting CMO Review */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Reports in Review
                    </span>
                    <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <FileCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                      {data?.pending_reports ?? 0}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">ATRs submitted for CMO verification</p>
                  </div>
                </div>

                {/* 5. Resolved Cases */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Resolved Cases
                    </span>
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-[#16865B]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#16865B]">
                      {data?.resolved ?? 0}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Closed after CMO approval</p>
                  </div>
                </div>
              </div>

              {/* Overdue SLA Notice Banner */}
              {(data?.overdue ?? 0) > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-900">
                        {data.overdue} Assigned Case{data.overdue > 1 ? 's' : ''} Exceeded SLA Due Date
                      </p>
                      <p className="text-xs text-rose-700">
                        Immediate departmental action and report submission required to avoid CMO escalation.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/officer/grievances?ordering=due_date"
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0"
                  >
                    View Overdue Cases
                  </Link>
                </div>
              )}

              {/* Visual Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Breakdown Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#245A91]" />
                        Status Distribution
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Breakdown of assigned cases across redressal stages
                      </p>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    {statusChartData.length > 0 && statusChartData.some((d) => d.count > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statusChartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#64748B', fontSize: 11 }}
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                          <RechartsTooltip
                            formatter={(value) => [`${value} grievances`, 'Count']}
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E2E8F0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Inbox className="w-10 h-10 mb-2 stroke-1" />
                        <p className="text-xs">No case data recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority Breakdown Donut Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#245A91]" />
                        Priority Severity
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Urgency distribution of open & assigned cases
                      </p>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    {priorityChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                          >
                            {priorityChartData.map((entry, index) => (
                              <Cell key={`slice-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value) => [`${value} cases`, 'Total']}
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E2E8F0',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => (
                              <span className="text-xs text-slate-600 font-medium">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Inbox className="w-10 h-10 mb-2 stroke-1" />
                        <p className="text-xs">No priority data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Assigned Grievances Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#17365D] flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-[#245A91]" />
                      Recent Assigned Grievances
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Latest public grievances assigned for field verification and report submission
                    </p>
                  </div>

                  <Link
                    to="/officer/grievances"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A91] hover:text-[#17365D] transition-colors self-start sm:self-auto"
                  >
                    <span>View all assigned cases</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {!data?.recent_assigned || data.recent_assigned.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No Assigned Cases Found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      There are currently no active grievances assigned to your department. New CMO allocations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                          <th className="px-5 py-3.5">Ref No.</th>
                          <th className="px-5 py-3.5">Subject & Category</th>
                          <th className="px-5 py-3.5">District</th>
                          <th className="px-5 py-3.5">Priority</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Assignment Date</th>
                          <th className="px-5 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.recent_assigned.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/officer/grievances/${item.id}`}
                                  className="font-mono text-xs font-bold text-[#245A91] hover:underline"
                                >
                                  {item.reference_number}
                                </Link>
                                {item.is_overdue && (
                                  <span
                                    title="SLA Overdue"
                                    className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 uppercase"
                                  >
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800 line-clamp-1 max-w-xs sm:max-w-md group-hover:text-[#17365D]">
                                {item.subject}
                              </p>
                              <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {item.district}
                              </span>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <PriorityBadge priority={item.priority} />
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                              {formatDate(item.assigned_at || item.created_at)}
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <Link
                                to={`/officer/grievances/${item.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#17365D] bg-slate-100 hover:bg-[#245A91] hover:text-white transition-all shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Details</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
