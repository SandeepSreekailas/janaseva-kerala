import { useState, useEffect, useCallback, useTransition } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  RefreshCw,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  SlidersHorizontal,
  Inbox,
  Clock,
  ArrowUpDown,
  Building2,
  AlertCircle,
} from 'lucide-react';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getGrievances } from '../../api/officer';

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

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Reopened', label: 'Reopened' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'Urgent', label: 'Urgent' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: 'due_date', label: 'Due Date (Earliest First)' },
  { value: '-due_date', label: 'Due Date (Latest First)' },
  { value: '-priority', label: 'Highest Priority' },
];

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

export default function OfficerGrievanceList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local filter states read from URL query params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedOrdering, setSelectedOrdering] = useState(
    searchParams.get('ordering') || '-created_at'
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const [grievances, setGrievances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const pageSize = 15;

  const fetchGrievancesList = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = {};
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (selectedStatus) params.status = selectedStatus;
        if (selectedPriority) params.priority = selectedPriority;
        if (selectedDistrict) params.district = selectedDistrict;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedOrdering) params.ordering = selectedOrdering;
        if (currentPage > 1) params.page = currentPage;

        const res = await getGrievances(params);

        if (Array.isArray(res)) {
          setGrievances(res);
          setTotalCount(res.length);
        } else if (res && Array.isArray(res.results)) {
          setGrievances(res.results);
          setTotalCount(res.count ?? res.results.length);
        } else {
          setGrievances([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Failed to load grievances:', err);
        setError(
          err?.response?.data?.detail ||
            'Failed to load assigned grievances. Please try again.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      searchQuery,
      selectedStatus,
      selectedPriority,
      selectedDistrict,
      selectedCategory,
      selectedOrdering,
      currentPage,
    ]
  );

  // Sync state to URL and fetch
  useEffect(() => {
    const nextParams = {};
    if (searchQuery.trim()) nextParams.search = searchQuery.trim();
    if (selectedStatus) nextParams.status = selectedStatus;
    if (selectedPriority) nextParams.priority = selectedPriority;
    if (selectedDistrict) nextParams.district = selectedDistrict;
    if (selectedCategory) nextParams.category = selectedCategory;
    if (selectedOrdering && selectedOrdering !== '-created_at')
      nextParams.ordering = selectedOrdering;
    if (currentPage > 1) nextParams.page = currentPage.toString();

    setSearchParams(nextParams, { replace: true });
    fetchGrievancesList();
  }, [
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedDistrict,
    selectedCategory,
    selectedOrdering,
    currentPage,
    fetchGrievancesList,
    setSearchParams,
  ]);

  const handleResetFilters = () => {
    startTransition(() => {
      setSearchQuery('');
      setSelectedStatus('');
      setSelectedPriority('');
      setSelectedDistrict('');
      setSelectedCategory('');
      setSelectedOrdering('-created_at');
      setCurrentPage(1);
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedStatus ||
      selectedPriority ||
      selectedDistrict ||
      selectedCategory ||
      selectedOrdering !== '-created_at'
  );

  return (
    <ProtectedRoute requiredRole="officer">
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
                  Assigned Grievances
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#245A91]/10 text-[#245A91]">
                  {totalCount} Total
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Field investigation, status progression, and action taken report dispatch desk.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchGrievancesList(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:text-[#17365D] shadow-2xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Reference #, subject, or description..."
                  className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-700"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-700"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedOrdering}
                  onChange={(e) => {
                    setSelectedOrdering(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-700"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Secondary Filters */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filters:
                </span>

                {/* District Filter Dropdown */}
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 border-none rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#245A91] font-medium"
                >
                  <option value="">All Districts ({DISTRICTS.length})</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Category Filter Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 border-none rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#245A91] font-medium"
                >
                  <option value="">All Categories ({CATEGORIES.length})</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Active Filter Clear Tags */}
                {selectedDistrict && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#245A91] font-medium">
                    {selectedDistrict}
                    <button
                      onClick={() => {
                        setSelectedDistrict('');
                        setCurrentPage(1);
                      }}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#245A91] font-medium">
                    {selectedCategory}
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setCurrentPage(1);
                      }}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-red-800">
                <p className="font-semibold">Unable to load cases</p>
                <p className="mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => fetchGrievancesList()}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Grievances Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Loading assigned cases...
                </p>
              </div>
            ) : grievances.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Grievances Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? 'No assigned grievances match the selected filter parameters. Try clearing your search or filters.'
                    : 'Your department currently has no assigned grievances in this queue.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#245A91] text-white text-xs font-semibold hover:bg-[#17365D] transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <>
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
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {grievances.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Reference Number */}
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
                                  title="Resolution Due Date Breached"
                                  className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 uppercase"
                                >
                                  Overdue
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Subject and Category */}
                          <td className="px-5 py-4">
                            <Link
                              to={`/officer/grievances/${item.id}`}
                              className="font-semibold text-slate-800 line-clamp-1 max-w-xs sm:max-w-md group-hover:text-[#17365D]"
                            >
                              {item.subject}
                            </Link>
                            <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                          </td>

                          {/* District */}
                          <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.district}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <PriorityBadge priority={item.priority} />
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <StatusBadge status={item.status} />
                          </td>

                          {/* Assignment date */}
                          <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                            {formatDate(item.assigned_at || item.created_at)}
                          </td>

                          {/* Actions */}
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

                {/* Pagination Controls */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-medium">
                    Showing{' '}
                    <span className="font-bold text-slate-700">
                      {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                    </span>{' '}
                    to{' '}
                    <span className="font-bold text-slate-700">
                      {Math.min(currentPage * pageSize, totalCount)}
                    </span>{' '}
                    of <span className="font-bold text-slate-700">{totalCount}</span> cases
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1 self-center sm:self-auto">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent"
                        title="First Page"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="px-3 py-1 text-xs font-semibold text-[#17365D] bg-slate-100 rounded-md">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Last Page"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
