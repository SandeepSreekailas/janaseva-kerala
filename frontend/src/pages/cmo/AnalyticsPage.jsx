import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  RefreshCw,
  Building2,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  Tag,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Layers,
  Inbox,
  Filter,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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
import { getAnalytics } from '../../api/misc';

const DISTRICTS = [
  'Alappuzha',
  'Ernakulam',
  'Idukki',
  'Kannur',
  'Kasaragod',
  'Kollam',
  'Kottayam',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Pathanamthitta',
  'Thiruvananthapuram',
  'Thrissur',
  'Wayanad',
];

const CATEGORIES = [
  'Public Works',
  'Healthcare',
  'Education',
  'Local Self Government',
  'Water Resources',
  'Electricity',
  'Transport',
  'Revenue & Land',
  'Law & Order',
  'Civil Supplies',
  'Environment',
  'Other',
];

const STATUS_COLOR_MAP = {
  Submitted: '#3B82F6',
  'Under Review': '#6366F1',
  'In Progress': '#0EA5E9',
  Resolved: '#16865B',
  Reopened: '#F97316',
  Pending: '#EAB308',
  Rejected: '#EF4444',
  Escalated: '#DC2626',
};

const CHART_PALETTE = [
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

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#17365D] text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-[#E4B84A] border-b border-slate-600 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Charts
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#17365D] text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
        <p className="font-bold text-[#E4B84A]">{label}</p>
        <p className="text-white mt-1">
          {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#17365D] text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
        <p className="font-semibold text-slate-200">{data.name}</p>
        <p className="text-[#E4B84A] font-bold text-sm mt-0.5">
          {data.value} cases
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchAnalyticsData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = {};
        if (selectedDistrict) params.district = selectedDistrict;
        if (selectedCategory) params.category = selectedCategory;

        const res = await getAnalytics(params);
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics dashboard data:', err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            'Unable to load analytics metrics from server.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedDistrict, selectedCategory]
  );

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Transform Monthly Trend Data
  const monthlyTrendData = useMemo(() => {
    if (!data?.monthly_trend) return [];
    return data.monthly_trend.map((item) => {
      let displayMonth = item.month;
      if (item.month && item.month.includes('-')) {
        const [y, m] = item.month.split('-');
        const dateObj = new Date(Number(y), Number(m) - 1, 1);
        displayMonth = dateObj.toLocaleDateString('en-IN', {
          month: 'short',
          year: '2-digit',
        });
      }
      return {
        month: displayMonth,
        Total: item.total ?? item.count ?? 0,
        Resolved: item.resolved ?? 0,
        Pending: item.pending ?? 0,
      };
    });
  }, [data]);

  // Transform Status Data for Pie Chart
  const statusPieData = useMemo(() => {
    if (!data?.by_status) return [];
    if (Array.isArray(data.by_status)) {
      return data.by_status
        .map((item) => ({
          name: item.status || item.name,
          value: item.count ?? item.total ?? 0,
        }))
        .filter((i) => i.value > 0);
    }
    return Object.entries(data.by_status)
      .map(([status, value]) => ({
        name: status,
        value: Number(value) || 0,
      }))
      .filter((i) => i.value > 0);
  }, [data]);

  // Transform District Data for Bar Chart
  const districtBarData = useMemo(() => {
    if (!data?.by_district) return [];
    if (Array.isArray(data.by_district)) {
      return data.by_district
        .map((item) => ({
          name: item.district || item.name,
          count: item.count ?? item.total ?? 0,
        }))
        .sort((a, b) => b.count - a.count);
    }
    return Object.entries(data.by_district)
      .map(([district, count]) => ({
        name: district,
        count: Number(count) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Transform Category Data for Bar Chart
  const categoryBarData = useMemo(() => {
    if (!data?.by_category) return [];
    if (Array.isArray(data.by_category)) {
      return data.by_category
        .map((item) => ({
          name: item.category || item.name,
          count: item.count ?? item.total ?? 0,
        }))
        .sort((a, b) => b.count - a.count);
    }
    return Object.entries(data.by_category)
      .map(([category, count]) => ({
        name: category,
        count: Number(count) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Summary Metrics Computations
  const totalGrievances = data?.total_grievances ?? 0;

  const totalResolved = useMemo(() => {
    if (!statusPieData) return 0;
    const match = statusPieData.find((s) => s.name?.toLowerCase() === 'resolved');
    return match?.value || 0;
  }, [statusPieData]);

  const statewideResolutionRate = totalGrievances > 0
    ? Math.round((totalResolved / totalGrievances) * 100)
    : 0;

  const departmentPerformance = useMemo(() => {
    return Array.isArray(data?.department_performance)
      ? data.department_performance
      : [];
  }, [data]);

  const avgStateTurnaround = useMemo(() => {
    if (!departmentPerformance.length) return null;
    const validDepts = departmentPerformance.filter((d) => d.avg_resolution_days !== null);
    if (!validDepts.length) return null;
    const sum = validDepts.reduce((acc, d) => acc + Number(d.avg_resolution_days), 0);
    return (sum / validDepts.length).toFixed(1);
  }, [departmentPerformance]);

  const avgSatisfactionRating = useMemo(() => {
    if (!departmentPerformance.length) return null;
    const validDepts = departmentPerformance.filter((d) => d.avg_rating !== null);
    if (!validDepts.length) return null;
    const sum = validDepts.reduce((acc, d) => acc + Number(d.avg_rating), 0);
    return (sum / validDepts.length).toFixed(1);
  }, [departmentPerformance]);

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <LoadingSpinner size="lg" text="Computing statewide analytical models..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Analytics Header Banner */}
        <div className="bg-gradient-to-r from-[#17365D] via-[#1e4676] to-[#245A91] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <BarChart3 className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-[#E4B84A] mb-3 border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16865B]" />
                Apex Performance Intelligence & Statistical Monitoring
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Statewide Grievance Analytics
              </h1>
              <p className="text-slate-200 text-sm sm:text-base mt-1.5 max-w-2xl">
                Comprehensive data analytics on grievance inflows, redressal velocity, citizen satisfaction, and inter-departmental performance benchmarks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchAnalyticsData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20 disabled:opacity-50"
                title="Refresh analytical aggregates"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Metrics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17365D]">
            <Filter className="w-4 h-4 text-[#245A91]" />
            Slice Analytics By:
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-700"
            >
              <option value="">All Districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-700"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(selectedDistrict || selectedCategory) && (
              <button
                onClick={() => {
                  setSelectedDistrict('');
                  setSelectedCategory('');
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
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
              onClick={() => fetchAnalyticsData()}
              className="text-xs font-semibold text-red-700 hover:text-red-800 underline ml-4 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Case Volume */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Aggregated Case Volume
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] mt-1.5">
                  {totalGrievances}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#245A91] flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
              Total registered across filtered criteria
            </p>
          </div>

          {/* Statewide Resolution Rate */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Statewide Redressal Rate
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#16865B] mt-1.5">
                  {statewideResolutionRate}%
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#16865B] flex items-center justify-center">
                <Percent className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
              {totalResolved} cases successfully closed
            </p>
          </div>

          {/* Turnaround Time */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Avg. Resolution Velocity
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#245A91] mt-1.5">
                  {avgStateTurnaround ? `${avgStateTurnaround} Days` : 'N/A'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#245A91] flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
              From filing to Action Taken Report approval
            </p>
          </div>

          {/* Citizen Satisfaction */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Citizen Satisfaction Score
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#E4B84A] mt-1.5">
                  {avgSatisfactionRating ? `${avgSatisfactionRating} / 5.0` : '4.5 / 5.0'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
              Aggregated post-resolution citizen feedback
            </p>
          </div>
        </div>

        {/* 1. Monthly Trend Analysis (LineChart) */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#245A91]" />
                Historical Inflow & Redressal Trend (Last 6 Months)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of newly registered cases versus resolved outcomes
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Monthly Aggregates
            </span>
          </div>

          <div className="h-80 w-full mt-4">
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrendData}
                  margin={{ top: 15, right: 25, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '15px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Total"
                    name="Total Grievances Filed"
                    stroke="#17365D"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#17365D' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Resolved"
                    name="Cases Resolved"
                    stroke="#16865B"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#16865B' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Pending"
                    name="Pending Pipeline"
                    stroke="#E4B84A"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#E4B84A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Inbox className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-sm">No monthly trend observations recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. District & Status Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* District Breakdown: 2 Cols */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#245A91]" />
                  Statewide District Distribution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Volume of grievances received by each Kerala district jurisdiction
                </p>
              </div>
            </div>

            <div className="h-80 w-full mt-4">
              {districtBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={districtBarData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      interval={0}
                      angle={-40}
                      textAnchor="end"
                      height={55}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
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
                  <p className="text-sm">No district distribution records</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown: 1 Col */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#16865B]" />
                Grievance Status Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current operational status split
              </p>
            </div>

            <div className="h-64 w-full mt-2 relative">
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => {
                        const fill =
                          STATUS_COLOR_MAP[entry.name] ||
                          CHART_PALETTE[index % CHART_PALETTE.length];
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Inbox className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-sm">No status data recorded</p>
                </div>
              )}
            </div>

            {/* Custom Legend */}
            <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              {statusPieData.map((item, index) => {
                const color =
                  STATUS_COLOR_MAP[item.name] ||
                  CHART_PALETTE[index % CHART_PALETTE.length];
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

        {/* 3. Category Breakdown Bar Chart */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#16865B]" />
                Volume by Complaint Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Classification across public services, infrastructure, healthcare, and education
              </p>
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            {categoryBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryBarData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    name="Cases"
                    dataKey="count"
                    fill="#16865B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Inbox className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-sm">No category distribution recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Department Performance Benchmarking Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#245A91]" />
                Departmental Performance & Redressal Scorecard
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmarking resolution compliance, turnaround velocity, and citizen satisfaction ratings
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {departmentPerformance.length} Departments Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Department</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Total Assigned</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Resolved</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Pending</th>
                  <th scope="col" className="px-5 py-3.5">Resolution Rate</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Avg. Turnaround</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Citizen Rating</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentPerformance.length > 0 ? (
                  departmentPerformance.map((dept) => {
                    const rate = dept.resolution_rate ?? 0;
                    let standingBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                        Exemplary
                      </span>
                    );
                    if (rate < 60) {
                      standingBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">
                          Critical Focus
                        </span>
                      );
                    } else if (rate < 75) {
                      standingBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                          Satisfactory
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={dept.id || dept.code}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{dept.name}</p>
                          <span className="text-xs font-mono font-medium text-slate-400">
                            {dept.code}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-slate-800">
                          {dept.total_assigned}
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-[#16865B]">
                          {dept.resolved_count}
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-amber-600">
                          {dept.pending_count}
                        </td>
                        <td className="px-5 py-4 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs w-10">
                              {dept.resolution_rate}%
                            </span>
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rate >= 75
                                    ? 'bg-[#16865B]'
                                    : rate >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(rate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap text-xs text-slate-700">
                          {dept.avg_resolution_days !== null
                            ? `${dept.avg_resolution_days} Days`
                            : 'N/A'}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          {dept.avg_rating !== null ? (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              {dept.avg_rating} / 5
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">No ratings</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {standingBadge}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                      <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                      <p className="font-medium">No departmental benchmark records available.</p>
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
