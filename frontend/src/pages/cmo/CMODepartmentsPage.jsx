import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Users,
  RefreshCw,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDepartments } from '../../api/misc';

export default function CMODepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDepts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getDepartments();
      const list = Array.isArray(data) ? data : data?.results || [];
      setDepartments(list);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setError('Unable to load government departments. Please check server connectivity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const filtered = departments.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Administrative Directory
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Integrated Government Departments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of designated state departments, authorized grievance officers, and operational SLAs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDepts(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#245A91]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Departments</p>
            <p className="text-2xl font-extrabold text-slate-900">{departments.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Routing Units</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {departments.filter((d) => d.is_active !== false).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mandated Redressal SLA</p>
            <p className="text-2xl font-extrabold text-slate-900">7 - 14 Days</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by code (e.g., PWD, KSEB) or department title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner size="lg" text="Loading department records..." />
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 rounded-2xl border border-red-200 text-center">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-800">{error}</p>
          <button
            onClick={() => fetchDepts()}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-2xl border border-slate-200 text-center">
          <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-slate-700 text-sm">No departments match your query</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing or broadening your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filtered.map((d) => (
            <div
              key={d.id || d.code}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-[#0F233D] text-[#E4B84A] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {d.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{d.name}</h3>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Routing Active
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {d.description || 'Designated state department for public petition investigation.'}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px] truncate">{d.contact_email}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  Standard Resolution: <strong className="text-slate-800">10 Days</strong>
                </span>
                <Link
                  to={`/cmo/grievances`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#245A91] hover:text-[#0F233D]"
                >
                  <span>Filter Cases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
