import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  AlertCircle,
  Eye,
  MapPin,
  Clock,
  ArrowUpDown,
  Download,
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';

import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getGrievances } from '../../api/cmo';

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
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
  'Reopened',
];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

const PAGE_SIZE = 15;

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

export default function CMOGrievanceList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter and search state initialized from URL query params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [districtFilter, setDistrictFilter] = useState(searchParams.get('district') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const [grievances, setGrievances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== (searchParams.get('search') || '')) {
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams]);

  // Sync state changes with URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (districtFilter) params.set('district', districtFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (ordering && ordering !== '-created_at') params.set('ordering', ordering);
    if (currentPage > 1) params.set('page', String(currentPage));

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    statusFilter,
    priorityFilter,
    districtFilter,
    categoryFilter,
    ordering,
    currentPage,
    setSearchParams,
  ]);

  // Fetch grievances from API
  const fetchGrievancesList = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const queryParams = {
          page: currentPage,
        };

        if (debouncedSearch.trim()) queryParams.search = debouncedSearch.trim();
        if (statusFilter) queryParams.status = statusFilter;
        if (priorityFilter) queryParams.priority = priorityFilter;
        if (districtFilter) queryParams.district = districtFilter;
        if (categoryFilter) queryParams.category = categoryFilter;
        if (ordering) queryParams.ordering = ordering;

        const res = await getGrievances(queryParams);

        if (res && Array.isArray(res.results)) {
          setGrievances(res.results);
          setTotalCount(res.count ?? res.results.length);
        } else if (Array.isArray(res)) {
          setGrievances(res);
          setTotalCount(res.length);
        } else {
          setGrievances([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Failed to fetch CMO grievances:', err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            'Unable to load grievance records. Please verify network and authentication.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      currentPage,
      debouncedSearch,
      statusFilter,
      priorityFilter,
      districtFilter,
      categoryFilter,
      ordering,
    ]
  );

  useEffect(() => {
    fetchGrievancesList();
  }, [fetchGrievancesList]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setDistrictFilter('');
    setCategoryFilter('');
    setOrdering('-created_at');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      statusFilter ||
      priorityFilter ||
      districtFilter ||
      categoryFilter ||
      ordering !== '-created_at'
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Pagination page numbers list (max 5 visible pages)
  const paginationRange = useMemo(() => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-[#245A91]" />
              <h1 className="text-2xl font-bold text-[#17365D]">
                State Grievance Repository
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Search, triage, reassign, and track all citizen grievances registered across Kerala.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchGrievancesList(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors shadow-2xs disabled:opacity-50"
              title="Refresh repository"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="bg-[#17365D] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-2xs">
              Total Records: {totalCount}
            </div>
          </div>
        </div>

        {/* Filter and Search Control Panel */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reference number (e.g. JK-2026-), subject, citizen name..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Status Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-semibold">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  !statusFilter
                    ? 'bg-[#17365D] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Status
              </button>
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(statusFilter === st ? '' : st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-[#245A91] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-700"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Filter by Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-700"
              >
                <option value="">All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* District Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Filter by District
              </label>
              <select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-700"
              >
                <option value="">All 14 Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] focus:bg-white text-slate-700"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Filter Controls: Ordering & Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort By:
              </span>
              <select
                value={ordering}
                onChange={(e) => {
                  setOrdering(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#245A91]"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-updated_at">Recently Updated</option>
                <option value="-priority">Highest Priority</option>
                <option value="due_date">Due Date (Earliest)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear All Active Filters
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
              onClick={() => fetchGrievancesList()}
              className="text-xs font-semibold text-red-700 hover:text-red-800 underline ml-4 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Grievance Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading && !refreshing ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" text="Loading grievances..." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-5 py-3.5">Reference No.</th>
                      <th scope="col" className="px-5 py-3.5">Subject & Category</th>
                      <th scope="col" className="px-5 py-3.5">District</th>
                      <th scope="col" className="px-5 py-3.5">Priority</th>
                      <th scope="col" className="px-5 py-3.5">Status</th>
                      <th scope="col" className="px-5 py-3.5">Submitted On</th>
                      <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grievances.length > 0 ? (
                      grievances.map((g) => (
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
                          <td className="px-5 py-4 max-w-sm">
                            <Link
                              to={`/cmo/grievances/${g.id}`}
                              className="font-semibold text-slate-900 group-hover:text-[#245A91] transition-colors block truncate"
                            >
                              {g.subject}
                            </Link>
                            <span className="inline-block text-xs text-slate-500 mt-0.5">
                              {g.category || 'General'}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
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
                                <span
                                  title="Due date has passed"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700"
                                >
                                  <AlertTriangle className="w-3 h-3" />
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
                              <Eye className="w-3.5 h-3.5" />
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                          <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-400 stroke-1" />
                          <p className="font-semibold text-slate-700">No grievances found</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            {hasActiveFilters
                              ? 'No grievances match your current search filters. Try adjusting or clearing filters.'
                              : 'There are currently no recorded grievances in the system.'}
                          </p>
                          {hasActiveFilters && (
                            <button
                              onClick={handleResetFilters}
                              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#245A91] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalCount > 0 && (
                <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600 bg-slate-50/50">
                  <div>
                    Showing{' '}
                    <span className="font-bold text-slate-900">
                      {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)}
                    </span>{' '}
                    to{' '}
                    <span className="font-bold text-slate-900">
                      {Math.min(currentPage * PAGE_SIZE, totalCount)}
                    </span>{' '}
                    of <span className="font-bold text-slate-900">{totalCount}</span> entries
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Previous Page */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    {paginationRange.map((page, idx) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 py-1 text-slate-400 font-medium select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      const pageNum = Number(page);
                      const isSelected = pageNum === currentPage;
                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-8 h-8 px-2 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[#245A91] text-white shadow-2xs'
                              : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Page */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
