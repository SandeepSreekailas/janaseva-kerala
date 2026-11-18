import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDepartments } from '../../api/misc';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Building2,
  Search,
  Mail,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Phone,
  CheckCircle2,
  FileText,
  Filter,
} from 'lucide-react';

// Fallback demo data matching backend seeded departments
const fallbackDepartments = [
  {
    id: 1,
    code: 'PWD',
    name: 'Public Works Department',
    description: 'Responsible for planning, construction, and maintenance of roads, bridges, and public infrastructure across Kerala.',
    contact_email: 'pwd@janaseva.kerala.gov.in',
    is_active: true,
  },
  {
    id: 2,
    code: 'HLT',
    name: 'Health and Family Welfare Department',
    description: 'Oversees public healthcare institutions, disease surveillance, medical colleges, community health centers, and wellness programs.',
    contact_email: 'health@janaseva.kerala.gov.in',
    is_active: true,
  },
  {
    id: 3,
    code: 'EDU',
    name: 'General Education Department',
    description: 'Administers primary, secondary, and higher secondary education institutions and public school infrastructure development.',
    contact_email: 'education@janaseva.kerala.gov.in',
    is_active: true,
  },
  {
    id: 4,
    code: 'LSG',
    name: 'Local Self Government Department',
    description: 'Coordinates Grama Panchayats, Municipalities, and Municipal Corporations for local civic amenities, sanitation, and streetlights.',
    contact_email: 'lsgd@janaseva.kerala.gov.in',
    is_active: true,
  },
  {
    id: 5,
    code: 'WRD',
    name: 'Water Resources Department (KWA)',
    description: 'Responsible for drinking water distribution, Kerala Water Authority (KWA) pipelines, irrigation schemes, and river basin protection.',
    contact_email: 'water@janaseva.kerala.gov.in',
    is_active: true,
  },
  {
    id: 6,
    code: 'KSEB',
    name: 'Kerala State Electricity Board',
    description: 'State electricity utility managing electrical transmission, transformers, street power lines, and grid reliability.',
    contact_email: 'kseb@janaseva.kerala.gov.in',
    is_active: true,
  },
  {
    id: 7,
    code: 'TRN',
    name: 'Transport Department',
    description: 'Oversees public transport (KSRTC), motor vehicle regulation, regional transport offices (RTO), and road safety compliance.',
    contact_email: 'transport@janaseva.kerala.gov.in',
    is_active: true,
  },
  {
    id: 8,
    code: 'REV',
    name: 'Revenue Department',
    description: 'Administers land records, surveys, mutation (Pokkuvaravu), certificates, land revenue administration, and disaster relief.',
    contact_email: 'revenue@janaseva.kerala.gov.in',
    is_active: true,
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      const list = Array.isArray(data) ? data : data?.results || [];
      if (list.length > 0) {
        setDepartments(list);
      } else {
        setDepartments(fallbackDepartments);
      }
    } catch (err) {
      // If API fails or backend is offline, gracefully use fallback data
      console.warn('API error fetching departments, using fallback catalog:', err);
      setDepartments(fallbackDepartments);
      setError('Live department synchronization failed. Showing standard Kerala department catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const filtered = departments.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      d.name?.toLowerCase().includes(term) ||
      d.code?.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term);
    const matchesFilter = !filterActiveOnly || d.is_active;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#17365D] via-[#1c4576] to-[#245A91] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4B84A] text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Building2 className="w-3.5 h-3.5" />
              Integrated Government Services
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              State Departments Directory
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              Explore the key Kerala state government departments integrated into Janaseva Kerala.
              Petitions are automatically triaged by AI and routed directly to designated nodal officers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by department name, code (e.g. PWD, KSEB) or function..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] focus:border-transparent bg-[#F5F7FA]"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterActiveOnly}
                onChange={(e) => setFilterActiveOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#245A91] focus:ring-[#245A91]"
              />
              Active Desks Only
            </label>

            <button
              onClick={fetchDepts}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Soft error or sync banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDepts}
              className="font-bold underline ml-4 hover:text-amber-900"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16">
            <LoadingSpinner size="lg" text="Loading government department directory..." />
          </div>
        )}

        {/* Department Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dept) => (
              <div
                key={dept.id || dept.code}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#245A91]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#245A91]/10 text-[#245A91] font-extrabold text-sm flex items-center justify-center border border-[#245A91]/20">
                      {dept.code}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                        dept.is_active
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                          : 'bg-slate-50 text-slate-600 ring-slate-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dept.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {dept.is_active ? 'Active Desk' : 'Inactive'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-lg text-[#17365D] mb-2 group-hover:text-[#245A91] transition-colors">
                    {dept.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {dept.description || 'Dedicated state department coordinating citizen petitions and civic infrastructure.'}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {dept.contact_email && (
                    <a
                      href={`mailto:${dept.contact_email}`}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#245A91] transition-colors truncate"
                      title={dept.contact_email}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#245A91] shrink-0" />
                      <span className="truncate">{dept.contact_email}</span>
                    </a>
                  )}

                  <Link
                    to={`/register`}
                    className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-[#F5F7FA] hover:bg-[#245A91] hover:text-white text-[#17365D] text-xs font-bold transition-all group/btn"
                  >
                    <span>File Grievance for {dept.code}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state when search yields no matches */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#17365D] mb-1">No Departments Found</h3>
            <p className="text-sm text-slate-500 mb-4">
              We couldn't find any departments matching "{searchTerm}". Try a different search term or clear filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterActiveOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#245A91] text-white text-xs font-bold hover:bg-[#1b4372] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <section className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h3 className="font-bold text-[#17365D] text-lg">
            Don't see the specific department you are looking for?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            You don't need to manually know which department handles your issue. When you file a petition, our built-in AI assistant automatically analyzes your description and routes it to the exact government agency responsible.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16865B] text-white text-xs font-bold hover:bg-[#13724d] transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              File with Auto AI Routing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
