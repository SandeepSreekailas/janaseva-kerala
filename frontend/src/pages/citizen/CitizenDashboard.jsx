import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Bell,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getMyGrievances } from '../../api/grievances';

const STATUS_COLORS = {
  submitted: '#3B82F6',
  pending: '#EAB308',
  under_review: '#6366F1',
  assigned: '#8B5CF6',
  in_progress: '#0EA5E9',
  resolved: '#16865B',
  closed: '#64748B',
  rejected: '#EF4444',
  escalated: '#F97316',
};

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

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getMyGrievances();
      const list = Array.isArray(data) ? data : data?.results || [];
      setGrievances(list);
    } catch (err) {
      console.error('Failed to load grievances:', err);
      setError('Unable to load your grievance dashboard. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = grievances.length;
    let submitted = 0;
    let inProgress = 0;
    let resolved = 0;
    let escalated = 0;

    grievances.forEach((g) => {
      const st = (g.status || '').toLowerCase().replace(/[\s-]+/g, '_');
      if (st === 'resolved' || st === 'closed') {
        resolved += 1;
      } else if (st === 'in_progress' || st === 'under_review' || st === 'assigned') {
        inProgress += 1;
      } else if (st === 'escalated') {
        escalated += 1;
      } else {
        submitted += 1;
      }
    });

    return { total, submitted, inProgress, resolved, escalated };
  }, [grievances]);

  // Data for Status Donut Chart
  const statusChartData = useMemo(() => {
    const statusCounts = {};
    grievances.forEach((g) => {
      const label = g.status || 'Submitted';
      statusCounts[label] = (statusCounts[label] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => {
      const key = name.toLowerCase().replace(/[\s-]+/g, '_');
      return {
        name,
        value,
        color: STATUS_COLORS[key] || '#94A3B8',
      };
    });
  }, [grievances]);

  // Data for Category Bar Chart
  const categoryChartData = useMemo(() => {
    const catCounts = {};
    grievances.forEach((g) => {
      const cat = g.category || 'Other';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    return Object.entries(catCounts)
      .map(([name, count]) => ({
        name: name.length > 14 ? name.substring(0, 12) + '...' : name,
        fullName: name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [grievances]);

  // Recent 5 grievances
  const recentGrievances = useMemo(() => {
    return [...grievances]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
  }, [grievances]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#17365D] via-[#1e4676] to-[#245A91] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <ShieldCheck className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-[#E4B84A] mb-2 border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#16865B]" />
                Chief Minister's Public Grievance Redressal
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {user?.full_name || 'Citizen'}
              </h1>
              <p className="text-gray-200 text-sm sm:text-base mt-1 max-w-2xl">
                Submit, monitor, and track all your government service grievances in one secure portal.
                Every submission is monitored by the Chief Minister's Office.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20 disabled:opacity-50"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                to="/grievances/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E4B84A] hover:bg-[#d6a938] text-[#17365D] text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                File New Grievance
              </Link>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchDashboardData()}
              className="text-xs font-semibold text-red-700 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Grievances */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Filed
                </p>
                <h3 className="text-2xl font-bold text-[#17365D] mt-1">
                  {loading ? '...' : stats.total}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#245A91] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>All recorded grievances</span>
              <Link
                to="/grievances"
                className="text-[#245A91] font-semibold hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Submitted / Under Review */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending / Review
                </p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {loading ? '...' : stats.submitted}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Awaiting department triage</span>
              <span className="text-amber-600 font-medium">New / Queued</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  In Progress
                </p>
                <h3 className="text-2xl font-bold text-sky-600 mt-1">
                  {loading ? '...' : stats.inProgress}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Department enquiry ongoing</span>
              <span className="text-sky-600 font-medium">Active</span>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Resolved
                </p>
                <h3 className="text-2xl font-bold text-[#16865B] mt-1">
                  {loading ? '...' : stats.resolved}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16865B] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Redressed & closed</span>
              <span className="text-[#16865B] font-medium">
                {stats.total > 0
                  ? `${Math.round((stats.resolved / stats.total) * 100)}% resolved`
                  : '100%'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#245A91]" />
            Quick Citizen Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/grievances/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#245A91] hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#245A91]/10 text-[#245A91] flex items-center justify-center group-hover:bg-[#245A91] group-hover:text-white transition-colors">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">File Grievance</p>
                <p className="text-xs text-slate-500">New complaint</p>
              </div>
            </Link>

            <Link
              to="/grievances"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#245A91] hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#16865B]/10 text-[#16865B] flex items-center justify-center group-hover:bg-[#16865B] group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">My Grievances</p>
                <p className="text-xs text-slate-500">View status & history</p>
              </div>
            </Link>

            <Link
              to="/track"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#245A91] hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E4B84A]/20 text-amber-700 flex items-center justify-center group-hover:bg-[#E4B84A] group-hover:text-[#17365D] transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Track by Ref #</p>
                <p className="text-xs text-slate-500">Public tracker</p>
              </div>
            </Link>

            <Link
              to="/notifications"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#245A91] hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-500">Updates & alerts</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Charts Section */}
        {grievances.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown Donut Chart */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
              <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-2">
                Grievance Status Breakdown
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Current stage distribution across all submitted grievances
              </p>
              <div className="h-60 w-full flex items-center justify-center">
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
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val, name) => [`${val} grievances`, name]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 border-t border-slate-100 text-xs">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 font-medium">
                      {item.name}: <span className="font-bold text-slate-900">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories Bar Chart */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
              <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-2">
                Top Grievance Categories
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Categories receiving the highest number of submissions
              </p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11, fill: '#475569' }}
                    />
                    <RechartsTooltip
                      formatter={(value) => [`${value} grievances`, 'Count']}
                      labelFormatter={(label) => {
                        const full = categoryChartData.find((c) => c.name === label);
                        return full?.fullName || label;
                      }}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#245A91" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                Sorted by grievance volume
              </div>
            </div>
          </div>
        )}

        {/* Recent Grievances Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17365D]">Recent Grievances</h2>
              <p className="text-xs text-slate-500">
                Latest submissions requiring tracking or citizen action
              </p>
            </div>
            {grievances.length > 5 && (
              <Link
                to="/grievances"
                className="text-xs font-semibold text-[#245A91] hover:text-[#17365D] flex items-center gap-1"
              >
                View all ({grievances.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="md" text="Loading recent grievances..." />
            </div>
          ) : recentGrievances.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No grievances filed yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Have a public civic issue or government service request? Submit a grievance to the
                Chief Minister's Office now.
              </p>
              <Link
                to="/grievances/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#245A91] text-white text-xs font-semibold hover:bg-[#1e4a78] transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Grievance
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Reference ID</th>
                    <th className="px-5 py-3.5">Subject & Category</th>
                    <th className="px-5 py-3.5">District</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Submitted</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentGrievances.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link
                          to={`/grievances/${item.id}`}
                          className="font-mono text-xs font-bold text-[#245A91] hover:underline"
                        >
                          {item.reference_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-medium text-slate-900 truncate" title={item.subject}>
                          {item.subject}
                        </p>
                        <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {item.district}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/grievances/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-[#245A91] bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
