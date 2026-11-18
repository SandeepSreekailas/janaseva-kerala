import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  X,
  PlusCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyGrievances } from '../../api/grievances';

const DISTRICTS = [
  'All Districts',
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
  'All Categories',
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
  { value: 'all', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
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

const ITEMS_PER_PAGE = 10;

export default function GrievanceListPage() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [districtFilter, setDistrictFilter] = useState('All Districts');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const fetchGrievances = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getMyGrievances();
      const list = Array.isArray(data) ? data : data?.results || [];
      setGrievances(list);
    } catch (err) {
      console.error('Failed to fetch grievances:', err);
      setError('Unable to load your grievances. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  // Filtered & sorted grievances
  const filteredGrievances = useMemo(() => {
    return grievances
      .filter((item) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchRef = (item.reference_number || '').toLowerCase().includes(q);
          const matchSub = (item.subject || '').toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          if (!matchRef && !matchSub && !matchDesc) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          const itemStatus = (item.status || '').toLowerCase().replace(/[\s-]+/g, '_');
          if (itemStatus !== statusFilter) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all') {
          const itemPriority = (item.priority || '').toLowerCase();
          if (itemPriority !== priorityFilter) return false;
        }

        // Category filter
        if (categoryFilter !== 'All Categories') {
          if (item.category !== categoryFilter) return false;
        }

        // District filter
        if (districtFilter !== 'All Districts') {
          if (item.district !== districtFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === 'priority') {
          const order = { urgent: 4, high: 3, medium: 2, low: 1 };
          const pA = order[(a.priority || '').toLowerCase()] || 0;
          const pB = order[(b.priority || '').toLowerCase()] || 0;
          return pB - pA;
        }
        // Default newest
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [
    grievances,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    districtFilter,
    sortBy,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, districtFilter, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(filteredGrievances.length / ITEMS_PER_PAGE) || 1;
  const paginatedGrievances = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGrievances.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGrievances, currentPage]);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    categoryFilter !== 'All Categories' ||
    districtFilter !== 'All Districts';

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('All Categories');
    setDistrictFilter('All Districts');
    setSortBy('newest');
  };

  // Status counter chips
  const countsByStatus = useMemo(() => {
    const total = grievances.length;
    let submitted = 0;
    let inProgress = 0;
    let resolved = 0;

    grievances.forEach((g) => {
      const s = (g.status || '').toLowerCase().replace(/[\s-]+/g, '_');
      if (s === 'resolved' || s === 'closed') resolved++;
      else if (s === 'in_progress' || s === 'under_review' || s === 'assigned') inProgress++;
      else submitted++;
    });

    return { total, submitted, inProgress, resolved };
  }, [grievances]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16865B] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#16865B]" />
              Citizen Redressal Records
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17365D]">
              My Grievances
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Browse, monitor status, and review official action reports on all your lodged grievances.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchGrievances(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#245A91]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/grievances/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#245A91] hover:bg-[#1d4875] text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              File New Grievance
            </Link>
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
              onClick={() => fetchGrievances()}
              className="text-xs font-semibold text-red-700 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Status Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-[#17365D] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Grievances ({countsByStatus.total})
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'submitted'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pending Review ({countsByStatus.submitted})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'in_progress'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            In Progress ({countsByStatus.inProgress})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'resolved'
                ? 'bg-[#16865B] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Resolved ({countsByStatus.resolved})
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by reference #, subject, keyword..."
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Select */}
            <div className="md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div className="md:col-span-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="priority">Sort: Highest Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary filter row: Category and District */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-600">Filters:</span>
            </div>

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* District dropdown */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 ml-auto"
              >
                <X className="w-3 h-3" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section: Table / Cards */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner size="md" text="Loading grievances..." />
            </div>
          ) : grievances.length === 0 ? (
            /* Zero State: Citizen has never filed a grievance */
            <div className="py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No grievances lodged yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                You have not filed any grievances with the Chief Minister's Portal. If you have an
                issue requiring government intervention, submit a grievance now.
              </p>
              <Link
                to="/grievances/new"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#245A91] text-white text-xs sm:text-sm font-semibold hover:bg-[#1e4a78] transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                File Your First Grievance
              </Link>
            </div>
          ) : filteredGrievances.length === 0 ? (
            /* Filtered Zero State */
            <div className="py-14 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No grievances match your criteria
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search terms or relaxing your status & category filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8FAFC] text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Reference ID</th>
                      <th className="px-5 py-3.5">Subject & Category</th>
                      <th className="px-5 py-3.5">District</th>
                      <th className="px-5 py-3.5">Priority</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Lodged On</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedGrievances.map((item) => (
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
                        <td className="px-5 py-4 max-w-sm">
                          <Link
                            to={`/grievances/${item.id}`}
                            className="font-medium text-slate-900 hover:text-[#245A91] line-clamp-1"
                            title={item.subject}
                          >
                            {item.subject}
                          </Link>
                          <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#245A91] bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-slate-100">
                {paginatedGrievances.map((item) => (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/grievances/${item.id}`}
                        className="font-mono text-xs font-bold text-[#245A91] hover:underline"
                      >
                        {item.reference_number}
                      </Link>
                      <StatusBadge status={item.status} />
                    </div>

                    <div>
                      <Link
                        to={`/grievances/${item.id}`}
                        className="text-sm font-semibold text-slate-900 block"
                      >
                        {item.subject}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{item.category}</span>
                        <span>&bull;</span>
                        <span>{item.district}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <PriorityBadge priority={item.priority} />
                      <Link
                        to={`/grievances/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#245A91]"
                      >
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Bar */}
              <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <span>
                  Showing{' '}
                  <strong className="text-slate-900">
                    {filteredGrievances.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-900">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredGrievances.length)}
                  </strong>{' '}
                  of <strong className="text-slate-900">{filteredGrievances.length}</strong>{' '}
                  grievances
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-medium text-slate-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
