import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackGrievance } from '../../api/grievances';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  MapPin,
  Building2,
  ArrowRight,
  Copy,
  Check,
  Printer,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

export default function TrackGrievancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryRef = searchParams.get('ref') || '';

  const [inputRef, setInputRef] = useState(queryRef);
  const [loading, setLoading] = useState(false);
  const [grievance, setGrievance] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Search function
  const handleSearch = async (refCode) => {
    const code = (refCode || inputRef).trim();
    if (!code) {
      setError('Please enter a valid grievance reference number.');
      return;
    }

    setLoading(true);
    setError(null);
    setGrievance(null);

    // Sync URL query params
    setSearchParams({ ref: code });

    try {
      const data = await trackGrievance(code);
      if (data && (data.reference_number || data.id)) {
        setGrievance(data);
      } else {
        setError(`No grievance found matching reference "${code}". Please check the code sent via SMS/Email.`);
      }
    } catch (err) {
      console.error('Tracking API error:', err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        `No grievance found with reference "${code}". Please ensure the format is correct (e.g. KL-2026-00123).`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount if ref in query param
  useEffect(() => {
    if (queryRef) {
      setInputRef(queryRef);
      handleSearch(queryRef);
    }
  }, [queryRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(inputRef);
  };

  const handleCopyRef = () => {
    if (grievance?.reference_number) {
      navigator.clipboard.writeText(grievance.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Determine active step index for stepper
  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase().replace(/[\s-]+/g, '_');
    switch (s) {
      case 'submitted':
      case 'pending':
        return 1;
      case 'under_review':
        return 2;
      case 'assigned':
        return 3;
      case 'in_progress':
      case 'escalated':
        return 4;
      case 'resolved':
      case 'closed':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = grievance ? getStepIndex(grievance.status) : 1;

  const stepsList = [
    { title: 'Submitted', desc: 'Received & acknowledged' },
    { title: 'Under Review', desc: 'AI triage & validation' },
    { title: 'Assigned', desc: 'Sent to department' },
    { title: 'Investigation', desc: 'Field inspection active' },
    { title: 'Resolved', desc: 'ATR approved & verified' },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#17365D] via-[#1c4576] to-[#245A91] text-white py-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4B84A] text-xs font-semibold backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Real-time Public Audit Desk
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Track Grievance Status
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              Enter your tracking reference number to inspect live departmental progress, assigned field officers, and official investigation remarks.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-10 print:hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide">
              Grievance Reference Number
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. KL-2026-00123"
                  value={inputRef}
                  onChange={(e) => setInputRef(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold tracking-wider text-[#17365D] focus:outline-none focus:ring-2 focus:ring-[#245A91] bg-[#F5F7FA]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#245A91] hover:bg-[#1b4372] text-white font-bold text-sm shadow-md transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Status</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
              <span>Your reference number was sent via SMS and Email upon submission.</span>
              <span className="font-semibold text-slate-700">Need help? Dial 1076</span>
            </div>
          </form>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-16">
            <LoadingSpinner size="lg" text="Retrieving official docket records from Kerala CMO database..." />
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 text-center max-w-xl mx-auto my-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#17365D] text-lg">Grievance Record Not Found</h3>
            <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
              {error}
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setInputRef('')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear Input
              </button>
              <Link
                to="/contact"
                className="px-4 py-2 rounded-xl bg-[#245A91] text-xs font-bold text-white hover:bg-[#1b4372]"
              >
                Contact Support Desk
              </Link>
            </div>
          </div>
        )}

        {/* Grievance Result Display */}
        {grievance && !loading && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Docket Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm space-y-6">
              
              {/* Reference Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Grievance Docket ID
                    </span>
                    {grievance.is_overdue && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Overdue SLA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] font-mono tracking-wide">
                      {grievance.reference_number}
                    </h2>
                    <button
                      onClick={handleCopyRef}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Copy reference number"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge status={grievance.status} />
                  {grievance.priority && <PriorityBadge priority={grievance.priority} />}
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-xl border border-slate-200 bg-[#F5F7FA] text-slate-600 hover:bg-slate-200 transition-colors print:hidden"
                    title="Print grievance report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#17365D]">
                  {grievance.subject}
                </h3>
                {grievance.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-[#F5F7FA] p-4 rounded-2xl border border-slate-200">
                    {grievance.description}
                  </p>
                )}
              </div>

              {/* Key Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
                    <MapPin className="w-3.5 h-3.5 text-[#245A91]" />
                    District
                  </div>
                  <div className="text-sm font-bold text-[#17365D] mt-1 capitalize">
                    {grievance.district || 'Not Specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
                    <FolderOpen className="w-3.5 h-3.5 text-[#245A91]" />
                    Category
                  </div>
                  <div className="text-sm font-bold text-[#17365D] mt-1 capitalize">
                    {grievance.category?.replace(/_/g, ' ') || 'General'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
                    <Calendar className="w-3.5 h-3.5 text-[#245A91]" />
                    Filed Date
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#17365D] mt-1">
                    {formatDate(grievance.created_at)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
                    <Clock className="w-3.5 h-3.5 text-[#245A91]" />
                    Last Updated
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#17365D] mt-1">
                    {formatDate(grievance.updated_at || grievance.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Timeline Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-[#17365D] text-lg mb-8">
                Resolution Lifecycle Progress
              </h4>

              {/* Visual Multi-step stepper */}
              <div className="relative">
                {/* Horizontal progress line for desktop */}
                <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-[#16865B] transition-all duration-500"
                    style={{
                      width: `${((Math.min(currentStep, 5) - 1) / 4) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2">
                  {stepsList.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isDone = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;

                    return (
                      <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2 z-10">
                        {/* Circle */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isDone
                              ? 'bg-[#16865B] text-white shadow-md'
                              : isCurrent
                              ? 'bg-[#245A91] text-white ring-4 ring-blue-100 shadow-md'
                              : 'bg-white border-2 border-slate-200 text-slate-400'
                          }`}
                        >
                          {isDone ? <Check className="w-5 h-5" /> : stepNum}
                        </div>

                        {/* Text */}
                        <div className="sm:mt-2">
                          <p
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-[#245A91]'
                                : isDone
                                ? 'text-[#16865B]'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-[11px] text-slate-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h4 className="font-bold text-[#17365D] text-lg">
                  Official Status Transition History
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                  {grievance.history?.length || 0} Events Logged
                </span>
              </div>

              {grievance.history && grievance.history.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                  {grievance.history.map((h, i) => (
                    <div key={i} className="relative flex items-start gap-4 pl-8">
                      {/* Timeline Dot */}
                      <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#245A91] ring-4 ring-white shrink-0" />

                      <div className="bg-[#F5F7FA] rounded-2xl p-4 sm:p-5 border border-slate-200 flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#17365D]">Status Changed:</span>
                            {h.previous_status && (
                              <>
                                <span className="capitalize text-slate-500">
                                  {h.previous_status.replace(/_/g, ' ')}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              </>
                            )}
                            <span className="font-bold capitalize text-[#16865B]">
                              {h.new_status ? h.new_status.replace(/_/g, ' ') : 'Updated'}
                            </span>
                          </div>

                          <span className="text-slate-400 text-[11px]">
                            {formatDate(h.created_at)}
                          </span>
                        </div>

                        {h.remarks && (
                          <p className="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                            <strong className="text-slate-800">Official Note:</strong> {h.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs sm:text-sm">
                  Initial submission recorded. Investigation milestones will be populated as department officers log updates.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 print:hidden">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#245A91] hover:underline"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Submit another grievance
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                >
                  Print Summary
                </button>
                <Link
                  to="/contact"
                  className="px-4 py-2.5 rounded-xl bg-[#17365D] hover:bg-[#122b4d] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Report Delay to CMO
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
