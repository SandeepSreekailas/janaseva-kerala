import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Tag,
  User,
  Mail,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Send,
  Upload,
  RefreshCw,
  AlertCircle,
  Building2,
  ChevronRight,
  MessageSquare,
  Shield,
  FileCheck,
  History,
  Paperclip,
  Star,
  ExternalLink,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getGrievanceDetail, updateStatus, submitReport } from '../../api/officer';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
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

const getFileName = (url) => {
  if (!url) return 'attachment';
  try {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'attachment';
  } catch {
    return 'attachment';
  }
};

export default function OfficerGrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState(null);
  const [statusErrorMsg, setStatusErrorMsg] = useState(null);

  // ATR submission states
  const [submittingAtr, setSubmittingAtr] = useState(false);
  const [atrSuccessMsg, setAtrSuccessMsg] = useState(null);
  const [atrErrorMsg, setAtrErrorMsg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // react-hook-form for Status Update Form
  const {
    register: registerStatus,
    handleSubmit: handleStatusSubmit,
    setValue: setStatusFormValue,
    reset: resetStatusForm,
    formState: { errors: statusErrors },
  } = useForm({
    defaultValues: {
      status: 'In Progress',
      remarks: '',
    },
  });

  // react-hook-form for Action Taken Report (ATR) Form
  const {
    register: registerAtr,
    handleSubmit: handleAtrSubmit,
    reset: resetAtrForm,
    formState: { errors: atrErrors },
  } = useForm({
    defaultValues: {
      report_text: '',
    },
  });

  const loadDetail = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await getGrievanceDetail(id);
      setGrievance(data);
      // Initialize status form with current or sensible next status
      if (data?.status === 'Submitted' || data?.status === 'Under Review') {
        setStatusFormValue('status', 'In Progress');
      } else {
        setStatusFormValue('status', data?.status || 'In Progress');
      }
    } catch (err) {
      console.error('Failed to load grievance details:', err);
      setError(
        err?.response?.data?.detail ||
          'Failed to retrieve grievance information. The case may not be assigned to your department.'
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDetail(true);
    }
  }, [id]);

  // Handle Status Update Submit
  const onStatusSubmit = async (formData) => {
    setUpdatingStatus(true);
    setStatusSuccessMsg(null);
    setStatusErrorMsg(null);

    try {
      await updateStatus(id, {
        status: formData.status,
        remarks: formData.remarks?.trim() || '',
      });
      setStatusSuccessMsg(`Grievance status successfully updated to "${formData.status}".`);
      resetStatusForm({
        status: formData.status,
        remarks: '',
      });
      // Refresh grievance details to update badges and history log
      await loadDetail(false);
      setTimeout(() => setStatusSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setStatusErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.status?.[0] ||
          'Failed to update status. Please try again.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick 1-click button to mark In Progress
  const handleQuickMarkInProgress = async () => {
    setUpdatingStatus(true);
    setStatusSuccessMsg(null);
    setStatusErrorMsg(null);

    try {
      await updateStatus(id, {
        status: 'In Progress',
        remarks: 'Department officer initiated field investigation and active redressal.',
      });
      setStatusSuccessMsg('Grievance marked as "In Progress". Field investigation active.');
      resetStatusForm({
        status: 'In Progress',
        remarks: '',
      });
      await loadDetail(false);
      setTimeout(() => setStatusSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to mark in progress:', err);
      setStatusErrorMsg(
        err?.response?.data?.detail || 'Failed to update status. Please try again.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Action Taken Report (ATR) Submit
  const onAtrSubmit = async (formData) => {
    setSubmittingAtr(true);
    setAtrSuccessMsg(null);
    setAtrErrorMsg(null);

    try {
      const payload = new FormData();
      payload.append('report_text', formData.report_text.trim());
      if (selectedFile) {
        payload.append('attachment', selectedFile);
      }

      await submitReport(id, payload);
      setAtrSuccessMsg(
        'Action Taken Report (ATR) successfully submitted! The case has been routed to CMO administration for verification & closure approval.'
      );
      resetAtrForm();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Re-fetch detail to refresh ATR list, status, and history
      await loadDetail(false);
      setTimeout(() => setAtrSuccessMsg(null), 7000);
    } catch (err) {
      console.error('Failed to submit Action Taken Report:', err);
      setAtrErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.report_text?.[0] ||
          'Failed to submit Action Taken Report. Please check fields and retry.'
      );
    } finally {
      setSubmittingAtr(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size validation: 15MB max
      if (file.size > 15 * 1024 * 1024) {
        setAtrErrorMsg('Attachment file size cannot exceed 15MB.');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setAtrErrorMsg(null);
    } else {
      setSelectedFile(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ProtectedRoute requiredRole="officer">
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              to="/officer/grievances"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#245A91] hover:text-[#17365D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Assigned Cases</span>
            </Link>

            <button
              onClick={() => loadDetail(false)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-red-800">
                <p className="font-bold">Error retrieving grievance record</p>
                <p className="mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => loadDetail(true)}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading View */}
          {loading ? (
            <div className="py-28 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Loading complete grievance dossier...
              </p>
            </div>
          ) : !grievance ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs p-8">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-800">Grievance Not Found</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The requested grievance record does not exist or you do not have permission to access it.
              </p>
              <button
                onClick={() => navigate('/officer/grievances')}
                className="mt-4 px-4 py-2 bg-[#245A91] text-white text-xs font-semibold rounded-lg hover:bg-[#17365D] transition-colors"
              >
                Return to Cases List
              </button>
            </div>
          ) : (
            <>
              {/* Header Dossier Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-[#17365D] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {grievance.reference_number}
                      </span>
                      <StatusBadge status={grievance.status} />
                      <PriorityBadge priority={grievance.priority} />
                      {grievance.is_overdue && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue SLA
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#17365D] leading-tight">
                      {grievance.subject}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {grievance.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {grievance.district} District
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Filed on {formatDate(grievance.created_at)}
                      </span>
                      {grievance.due_date && (
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${
                            grievance.is_overdue ? 'text-red-600 font-bold' : 'text-slate-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          SLA Target: {formatDate(grievance.due_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Button for In Progress */}
                  {(grievance.status === 'Submitted' || grievance.status === 'Under Review') && (
                    <div className="shrink-0">
                      <button
                        onClick={handleQuickMarkInProgress}
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold shadow-sm transition-all hover:shadow disabled:opacity-50"
                      >
                        <Clock className="w-4 h-4 text-sky-200" />
                        <span>{updatingStatus ? 'Updating...' : 'Mark In Progress'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left/Main Column (7 cols): Details, Attachments, Timeline, ATRs */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Verbatim Grievance Description Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#245A91]" />
                      Citizen Statement & Description
                    </h2>
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100 whitespace-pre-wrap">
                      {grievance.description || 'No detailed description provided.'}
                    </div>

                    {/* AI Assessment (if available) */}
                    {(grievance.ai_summary || grievance.ai_suggested_department) && (
                      <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-[#17365D] font-bold">
                          <Sparkles className="w-4 h-4 text-[#E4B84A]" />
                          <span>AI Triage & Key Highlights</span>
                        </div>
                        {grievance.ai_summary && (
                          <p className="text-slate-700 leading-normal">{grievance.ai_summary}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-600">
                          {grievance.ai_suggested_department && (
                            <span>
                              <strong>Suggested Dept:</strong> {grievance.ai_suggested_department}
                            </span>
                          )}
                          {grievance.ai_suggested_priority && (
                            <span>
                              <strong>Suggested Priority:</strong> {grievance.ai_suggested_priority}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supporting Attachments Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-[#245A91]" />
                      Citizen Attachments & Evidence ({grievance.attachments?.length || 0})
                    </h2>

                    {!grievance.attachments || grievance.attachments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No supporting documents or photographs attached by citizen.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {grievance.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 bg-white rounded-lg border border-slate-200 text-[#245A91] shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#245A91]">
                                  {att.original_filename || getFileName(att.file)}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {formatDate(att.uploaded_at)}
                                </p>
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-slate-400 group-hover:text-[#245A91] shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Taken Reports (ATR) History */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-[#16865B]" />
                          Action Taken Reports (ATR)
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Field investigation reports submitted for CMO verification
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        {grievance.action_reports?.length || 0} Submitted
                      </span>
                    </div>

                    {!grievance.action_reports || grievance.action_reports.length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                        <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-600">
                          No Action Taken Report submitted yet
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Conduct on-site investigation and submit an ATR using the form on the right.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {grievance.action_reports.map((atr) => {
                          const isApproved =
                            atr.cmo_review_status === 'Approved' ||
                            atr.review_status_display?.includes('Approved');
                          const isRejected =
                            atr.cmo_review_status === 'Rejected' ||
                            atr.review_status_display?.includes('Rejected');
                          const isRevision =
                            atr.cmo_review_status === 'Revision Requested' ||
                            atr.review_status_display?.includes('Revision');

                          return (
                            <div
                              key={atr.id}
                              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-bold text-[#17365D]">
                                    {atr.officer?.full_name || 'Department Officer'}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">
                                    {formatDate(atr.submitted_at)}
                                  </span>
                                </div>

                                <span
                                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                    isApproved
                                      ? 'bg-emerald-100 text-[#16865B]'
                                      : isRejected
                                      ? 'bg-rose-100 text-rose-700'
                                      : isRevision
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {atr.review_status_display || atr.cmo_review_status || 'Pending CMO Review'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {atr.report_text}
                              </p>

                              {/* ATR Attachment link */}
                              {atr.attachment && (
                                <div className="pt-1">
                                  <a
                                    href={atr.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#245A91] hover:bg-blue-50 transition-colors shadow-2xs"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Inspection Report File</span>
                                  </a>
                                </div>
                              )}

                              {/* CMO Remarks if reviewed */}
                              {atr.cmo_remarks && (
                                <div className="mt-2 p-3 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs">
                                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                                    CMO Review Note ({formatDate(atr.reviewed_at)}):
                                  </p>
                                  <p className="text-amber-800 mt-1">{atr.cmo_remarks}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Grievance Lifecycle History Timeline */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <History className="w-4 h-4 text-[#245A91]" />
                      Redressal Audit Trail & Activity Log
                    </h2>

                    {!grievance.history || grievance.history.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No lifecycle updates recorded yet.</p>
                    ) : (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {grievance.history.map((h, idx) => (
                          <div key={h.id || idx} className="relative group">
                            <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#245A91] ring-4 ring-white" />
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  {h.new_status || 'Status Transition'}
                                </span>
                                {h.previous_status && (
                                  <span className="text-[10px] text-slate-400">
                                    (from {h.previous_status})
                                  </span>
                                )}
                                <span className="text-slate-300">•</span>
                                <span className="text-[11px] text-slate-400">
                                  {formatDate(h.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-normal">
                                {h.remarks || 'No remarks provided.'}
                              </p>
                              {h.changed_by?.full_name && (
                                <p className="text-[10px] text-slate-400 font-medium">
                                  By: {h.changed_by.full_name} ({h.changed_by.role || 'System'})
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Citizen Feedback (if resolved) */}
                  {grievance.feedback && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                      <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        Citizen Redressal Feedback
                      </h2>
                      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (grievance.feedback.rating || 0)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-2">
                            {grievance.feedback.rating} / 5 Stars
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic">
                          "{grievance.feedback.comments || 'Citizen provided rating without remarks.'}"
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Submitted on {formatDate(grievance.feedback.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column (5 cols): Action Forms & Citizen Contact Info */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Citizen Info Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#245A91]" />
                      Complainant Information
                    </h2>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Citizen Name</span>
                        <span className="font-bold text-slate-800">
                          {grievance.citizen?.full_name || 'Confidential Citizen'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Contact Email</span>
                        <span className="font-semibold text-slate-800">
                          {grievance.citizen?.email || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500">Registered District</span>
                        <span className="font-semibold text-slate-800">
                          {grievance.district}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form 1: Status Progression Form (react-hook-form) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#245A91]" />
                        Update Investigation Status
                      </h2>
                      <StatusBadge status={grievance.status} />
                    </div>

                    {statusSuccessMsg && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#16865B] shrink-0 mt-0.5" />
                        <span>{statusSuccessMsg}</span>
                      </div>
                    )}

                    {statusErrorMsg && (
                      <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{statusErrorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleStatusSubmit(onStatusSubmit)} className="space-y-4">
                      {/* Status Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          New Case Status
                        </label>
                        <select
                          {...registerStatus('status', { required: 'Status is required' })}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#245A91] font-medium"
                        >
                          <option value="In Progress">In Progress (Active Field Work)</option>
                          <option value="Under Review">Under Review (Pending Re-investigation)</option>
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1 italic">
                          Note: Formal case resolution requires Action Taken Report (ATR) submission and CMO verification below.
                        </p>
                        {statusErrors.status && (
                          <p className="text-[11px] text-red-600 mt-1">
                            {statusErrors.status.message}
                          </p>
                        )}
                      </div>

                      {/* Investigation Remarks */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Investigation Remarks & Audit Note
                        </label>
                        <textarea
                          rows={3}
                          {...registerStatus('remarks')}
                          placeholder="e.g. Field inspection conducted on-site; work commenced..."
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#245A91]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updatingStatus}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#17365D] hover:bg-[#245A91] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updatingStatus ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating Status...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Update Status</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Form 2: Action Taken Report (ATR) Submission Form (react-hook-form) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#16865B] to-[#245A91]" />
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#16865B] uppercase tracking-wider mb-1">
                        <FileCheck className="w-4 h-4" />
                        <span>Field Resolution Report</span>
                      </div>
                      <h2 className="text-base font-extrabold text-[#17365D]">
                        Submit Action Taken Report (ATR)
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Compile your final or interim redressal findings. The report will be dispatched to CMO administrators for verification & closure approval.
                      </p>
                    </div>

                    {atrSuccessMsg && (
                      <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#16865B] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{atrSuccessMsg}</span>
                      </div>
                    )}

                    {atrErrorMsg && (
                      <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{atrErrorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleAtrSubmit(onAtrSubmit)} className="space-y-4">
                      {/* Report Text */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Action Taken & Findings Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={6}
                          {...registerAtr('report_text', {
                            required: 'Report text is required',
                            minLength: {
                              value: 15,
                              message: 'Please provide at least 15 characters of detail',
                            },
                          })}
                          placeholder="Provide detailed information regarding the field visit, corrective actions undertaken, contractor/officer interventions, and final recommendations..."
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16865B]"
                        />
                        {atrErrors.report_text && (
                          <p className="text-[11px] text-red-600 mt-1">
                            {atrErrors.report_text.message}
                          </p>
                        )}
                      </div>

                      {/* File Upload (supporting doc or photo) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Inspection Evidence / Signed Report (PDF, JPG, PNG)
                        </label>

                        {!selectedFile ? (
                          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-[#245A91] rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer text-center group">
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#245A91] mb-1.5 transition-colors" />
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#245A91]">
                              Click to attach signed report or inspection photos
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Maximum file size 15 MB
                            </span>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-blue-50/50">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCheck className="w-4 h-4 text-[#16865B] shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {selectedFile.name}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={removeSelectedFile}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-2 shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Notice */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          Submitting this ATR automatically marks the grievance status as <strong>In Progress</strong> and assigns it to the CMO verification queue.
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingAtr}
                        className="w-full py-3 px-4 rounded-xl bg-[#16865B] hover:bg-[#126b48] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submittingAtr ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Dispatching ATR to CMO Desk...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Action Taken Report</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
