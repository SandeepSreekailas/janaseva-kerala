import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Eye,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { getGrievances } from '../../api/officer';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export default function OfficerReportsPage() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getGrievances();
      const list = Array.isArray(data) ? data : data?.results || [];
      setGrievances(list);
    } catch (err) {
      console.error('Failed to load officer cases for reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Extract all ATRs across assigned grievances or display grievances that have ATR status
  const reportItems = useMemo(() => {
    const items = [];
    grievances.forEach((g) => {
      if (g.action_reports && g.action_reports.length > 0) {
        g.action_reports.forEach((atr) => {
          items.push({
            id: atr.id,
            grievance_id: g.id,
            reference_number: g.reference_number,
            subject: g.subject,
            district: g.district,
            category: g.category,
            grievance_status: g.status,
            report_text: atr.report_text,
            cmo_review_status: atr.cmo_review_status || 'Pending',
            cmo_remarks: atr.cmo_remarks || '',
            submitted_at: atr.submitted_at,
            reviewed_at: atr.reviewed_at,
            has_attachment: !!atr.attachment,
          });
        });
      } else if (g.status === 'Resolved' || g.status === 'In Progress') {
        // Placeholder item for cases currently in progress without an ATR yet
        items.push({
          id: `case-${g.id}`,
          grievance_id: g.id,
          reference_number: g.reference_number,
          subject: g.subject,
          district: g.district,
          category: g.category,
          grievance_status: g.status,
          report_text: g.status === 'Resolved' ? 'Verified resolution logged.' : 'Investigation underway. Action Taken Report due.',
          cmo_review_status: g.status === 'Resolved' ? 'Approved' : 'Not Submitted',
          cmo_remarks: '',
          submitted_at: g.updated_at || g.created_at,
          reviewed_at: null,
          has_attachment: false,
        });
      }
    });
    return items;
  }, [grievances]);

  const filtered = useMemo(() => {
    return reportItems.filter((item) => {
      const matchesSearch =
        item.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.report_text?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'approved') return item.cmo_review_status === 'Approved';
      if (statusFilter === 'pending') return item.cmo_review_status === 'Pending';
      if (statusFilter === 'revision') return item.cmo_review_status === 'Revision Requested';
      return true;
    });
  }, [reportItems, searchTerm, statusFilter]);

  const approvedCount = reportItems.filter((r) => r.cmo_review_status === 'Approved').length;
  const pendingCount = reportItems.filter((r) => r.cmo_review_status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Department Officer Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Official Action Taken Reports (ATRs)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dossier of field investigations, photographic evidence submissions, and Chief Minister's Office audit ratings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReports(true)}
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
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">CMO Approved Reports</p>
            <p className="text-2xl font-extrabold text-slate-900">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting CMO Audit</p>
            <p className="text-2xl font-extrabold text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#245A91]">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cases Handled</p>
            <p className="text-2xl font-extrabold text-slate-900">{grievances.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Ref#, title, or report text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#16865B] text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#16865B] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Reports ({reportItems.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              statusFilter === 'approved'
                ? 'bg-[#16865B] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              statusFilter === 'pending'
                ? 'bg-[#16865B] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
        </div>
      </div>

      {/* Reports Listing Table */}
      {loading ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner size="lg" text="Retrieving Action Taken Reports..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-2xl border border-slate-200 text-center">
          <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-slate-700 text-sm">No Action Taken Reports Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'No reports match your current filters. Clear filters to see all cases.'
              : 'Investigate your assigned cases and submit your first field inspection report.'}
          </p>
          <Link
            to="/officer/grievances"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#16865B] hover:bg-[#13724d] text-white text-xs font-bold rounded-xl"
          >
            <span>Go to Assigned Cases</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Reference #</th>
                  <th className="px-5 py-3.5">Grievance Subject</th>
                  <th className="px-5 py-3.5">Report Findings</th>
                  <th className="px-5 py-3.5">CMO Review Status</th>
                  <th className="px-5 py-3.5">Submitted On</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-[#17365D]">
                      {item.reference_number}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{item.subject}</p>
                      <span className="text-[11px] text-slate-400">{item.district} • {item.category}</span>
                    </td>
                    <td className="px-5 py-4 max-w-sm">
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {item.report_text}
                      </p>
                      {item.cmo_remarks && (
                        <p className="text-[11px] text-amber-700 mt-1 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                          CMO Note: {item.cmo_remarks}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {item.cmo_review_status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved by CMO
                        </span>
                      ) : item.cmo_review_status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Review
                        </span>
                      ) : item.cmo_review_status === 'Revision Requested' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Revision Needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                          {item.cmo_review_status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {formatDate(item.submitted_at)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/officer/grievances/${item.grievance_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#16865B] bg-emerald-50 hover:bg-[#16865B] hover:text-white transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Dossier</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
