import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  Building2,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileCheck2,
  Paperclip,
  Download,
  Send,
  MessageSquare,
  History,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  Star,
} from 'lucide-react';

import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getGrievanceDetail,
  assignDepartment,
  addInternalRemark,
  updateStatus,
  escalateGrievance,
  reviewReport,
} from '../../api/cmo';
import { getDepartments } from '../../api/misc';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_CHOICES = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
  'Reopened',
];

const PRIORITY_CHOICES = ['Low', 'Medium', 'High', 'Urgent'];

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

export default function CMOGrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [grievance, setGrievance] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState(null);

  // Active Tab: 'details' | 'workflow' | 'remarks' | 'history'
  const [activeTab, setActiveTab] = useState('details');

  // Modal / Action states
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalError, setStatusModalError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [actionError, setActionError] = useState(null);

  // React Hook Forms
  const {
    register: registerAssign,
    handleSubmit: handleAssignSubmit,
    watch: watchAssign,
    setValue: setAssignValue,
    reset: resetAssign,
    formState: { isSubmitting: isAssigning, errors: assignErrors },
  } = useForm({
    defaultValues: {
      department_id: '',
      officer_id: '',
      assignment_notes: '',
    },
  });

  const {
    register: registerStatus,
    handleSubmit: handleStatusSubmit,
    reset: resetStatus,
    formState: { isSubmitting: isUpdatingStatus, errors: statusErrors },
  } = useForm({
    defaultValues: {
      status: '',
      remarks: '',
    },
  });

  const {
    register: registerEscalate,
    handleSubmit: handleEscalateSubmit,
    reset: resetEscalate,
    formState: { isSubmitting: isEscalating, errors: escalateErrors },
  } = useForm({
    defaultValues: {
      priority: 'Urgent',
      remarks: '',
    },
  });

  const {
    register: registerRemark,
    handleSubmit: handleRemarkSubmit,
    reset: resetRemark,
    formState: { isSubmitting: isAddingRemark, errors: remarkErrors },
  } = useForm({
    defaultValues: {
      remark: '',
    },
  });

  const {
    register: registerReview,
    handleSubmit: handleReviewSubmit,
    reset: resetReview,
    formState: { isSubmitting: isReviewing, errors: reviewErrors },
  } = useForm({
    defaultValues: {
      cmo_review_status: 'Approved',
      cmo_remarks: '',
    },
  });

  const watchDepartmentId = watchAssign('department_id');

  // Trigger toast notification
  const notifySuccess = (message) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Fetch grievance detail & departments
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setPageError(null);
    setActionError(null);

    try {
      const [grievanceData, deptsData] = await Promise.all([
        getGrievanceDetail(id),
        getDepartments(),
      ]);
      setGrievance(grievanceData);
      setDepartments(Array.isArray(deptsData) ? deptsData : deptsData?.results || []);

      // Pre-fill status form with current grievance status
      resetStatus({
        status: grievanceData.status || 'Under Review',
        remarks: '',
      });
    } catch (err) {
      console.error('Failed to load grievance details:', err);
      setPageError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load grievance record. Please verify the ID or check backend service.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, resetStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Find officers for the currently selected department in assignment form
  const availableOfficers = useMemo(() => {
    if (!watchDepartmentId) return [];
    const dept = departments.find((d) => String(d.id) === String(watchDepartmentId));
    return dept?.officers || [];
  }, [watchDepartmentId, departments]);

  // Auto pre-fill department if AI suggestion matches
  const handleApplyAISuggestion = () => {
    if (!grievance?.ai_suggested_department) return;
    const suggested = grievance.ai_suggested_department.toLowerCase();
    const matchedDept = departments.find(
      (d) =>
        d.name.toLowerCase().includes(suggested) ||
        suggested.includes(d.name.toLowerCase()) ||
        d.code.toLowerCase() === suggested
    );

    if (matchedDept) {
      setAssignValue('department_id', matchedDept.id);
      setAssignValue(
        'assignment_notes',
        `Triaged automatically via CMO AI Assistant: Recommended department: ${matchedDept.name}.`
      );
      notifySuccess(`Prefilled department with AI recommendation: ${matchedDept.name}`);
    } else {
      setActionError(`Could not find an exact match for suggested department: "${grievance.ai_suggested_department}". Please select manually.`);
    }
  };

  // Submit Assignment
  const onAssignSubmit = async (formData) => {
    setActionError(null);
    try {
      const payload = {
        department_id: Number(formData.department_id),
        officer_id: formData.officer_id ? Number(formData.officer_id) : null,
        assignment_notes: formData.assignment_notes || '',
      };
      await assignDepartment(id, payload);
      notifySuccess('Grievance assigned to department successfully!');
      resetAssign();
      await loadData(true);
    } catch (err) {
      console.error('Assignment error:', err);
      setActionError(
        err?.response?.data?.detail ||
          err?.response?.data?.department_id?.[0] ||
          'Failed to assign department. Please check input parameters.'
      );
    }
  };

  // Submit Status Update
  const onStatusSubmit = async (formData) => {
    setActionError(null);
    setStatusModalError(null);
    try {
      const payload = {
        status: formData.status,
        remarks: formData.remarks || '',
      };
      await updateStatus(id, payload);
      notifySuccess(`Grievance status updated to "${formData.status}"`);
      setStatusModalOpen(false);
      await loadData(true);
    } catch (err) {
      console.error('Status update error:', err);
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.status?.[0] ||
        'Failed to update grievance status.';
      setActionError(errMsg);
      setStatusModalError(errMsg);
    }
  };

  // Submit Escalation
  const onEscalateSubmit = async (formData) => {
    setActionError(null);
    try {
      const payload = {
        priority: formData.priority || 'Urgent',
        remarks: formData.remarks || '',
      };
      await escalateGrievance(id, payload);
      notifySuccess(`Grievance priority escalated to "${payload.priority}"`);
      setEscalateModalOpen(false);
      resetEscalate();
      await loadData(true);
    } catch (err) {
      console.error('Escalation error:', err);
      setActionError(
        err?.response?.data?.detail ||
          'Failed to escalate grievance priority.'
      );
    }
  };

  // Submit Internal Remark
  const onRemarkSubmit = async (formData) => {
    setActionError(null);
    try {
      await addInternalRemark(id, { remark: formData.remark });
      notifySuccess('Confidential internal remark added successfully!');
      resetRemark();
      await loadData(true);
    } catch (err) {
      console.error('Internal remark error:', err);
      setActionError(
        err?.response?.data?.detail ||
          err?.response?.data?.remark?.[0] ||
          'Failed to record internal remark.'
      );
    }
  };

  // Submit ATR Review
  const onReviewSubmit = async (formData) => {
    setActionError(null);
    try {
      // Find latest pending or primary ATR id
      const latestAtr =
        grievance?.action_reports?.find((r) => r.cmo_review_status === 'Pending') ||
        grievance?.action_reports?.[0];

      if (!latestAtr) {
        setActionError('No Action Taken Report found to review.');
        return;
      }

      await reviewReport(latestAtr.id, {
        cmo_review_status: formData.cmo_review_status,
        cmo_remarks: formData.cmo_remarks || '',
      });

      notifySuccess(`Action Taken Report review submitted (${formData.cmo_review_status})`);
      resetReview();
      await loadData(true);
    } catch (err) {
      console.error('ATR review error:', err);
      setActionError(
        err?.response?.data?.detail ||
          'Failed to submit Action Taken Report review.'
      );
    }
  };

  if (loading && !grievance) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <LoadingSpinner size="lg" text="Loading grievance details..." />
        </div>
      </DashboardLayout>
    );
  }

  if (pageError) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-red-900">Unable to load Grievance</h2>
            <p className="text-sm text-red-700">{pageError}</p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/cmo/grievances"
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to List
              </Link>
              <button
                onClick={() => loadData()}
                className="px-4 py-2 bg-[#245A91] text-white rounded-lg text-sm font-semibold hover:bg-[#17365D]"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeAssignment = grievance?.assignments?.find((a) => a.is_active) || grievance?.assignments?.[0];
  const pendingAtr = grievance?.action_reports?.find((r) => r.cmo_review_status === 'Pending');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/cmo/grievances"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#17365D] hover:bg-slate-50 transition-colors shadow-2xs"
              title="Return to repository"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#245A91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                  {grievance.reference_number}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  Created {formatDate(grievance.created_at)}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-1 line-clamp-1">
                {grievance.subject}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Status Update Trigger Button */}
            <button
              type="button"
              onClick={() => {
                resetStatus({
                  status: grievance.status,
                  remarks: '',
                });
                setStatusModalError(null);
                setStatusModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Update Status
            </button>

            {/* Escalation Trigger Button */}
            <button
              onClick={() => setEscalateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors shadow-2xs"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Escalate Case
            </button>
          </div>
        </div>

        {/* Global Action Toasts / Alerts */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold">{successToast}</p>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-semibold">{actionError}</p>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status & Priority Badge Bar */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
              <StatusBadge status={grievance.status} />
              <button
                type="button"
                onClick={() => {
                  resetStatus({
                    status: grievance.status,
                    remarks: '',
                  });
                  setStatusModalError(null);
                  setStatusModalOpen(true);
                }}
                className="ml-2 px-2.5 py-1 text-[11px] font-bold text-[#245A91] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                Change
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority:</span>
              <PriorityBadge priority={grievance.priority} />
            </div>
            {grievance.is_overdue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                OVERDUE (SLA Breach)
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {grievance.due_date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Target Due: <strong className="text-slate-800">{formatDate(grievance.due_date)}</strong>
              </span>
            )}
            {grievance.resolved_at && (
              <span className="flex items-center gap-1 text-[#16865B]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolved: <strong>{formatDate(grievance.resolved_at)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation for Detailed Sections */}
        <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-sm font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-[#245A91] text-[#245A91]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Case Overview & Citizen
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'border-[#245A91] text-[#245A91]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Department Assignment & ATR
            {pendingAtr && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('remarks')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'remarks'
                ? 'border-[#245A91] text-[#245A91]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            CMO Internal Remarks ({grievance.internal_remarks?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-[#245A91] text-[#245A91]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Audit Lifecycle Trail ({grievance.history?.length || 0})
          </button>
        </div>

        {/* TAB 1: DETAILS & CITIZEN INFO */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Description, Attachments, AI Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Assistant Insight Card */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 rounded-xl p-5 border border-indigo-100 shadow-xs relative">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-[#17365D] text-sm">
                      AI Triage & Synthesis Assistant
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Automated Analysis
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {grievance.ai_summary ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Executive Summary
                      </p>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-white/70 p-3 rounded-lg border border-indigo-50">
                        {grievance.ai_summary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      AI synthesis unavailable for this submission.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block">Suggested Dept:</span>
                      <strong className="text-slate-900 block truncate mt-0.5">
                        {grievance.ai_suggested_department || 'N/A'}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block">Suggested Category:</span>
                      <strong className="text-slate-900 block truncate mt-0.5">
                        {grievance.ai_suggested_category || 'N/A'}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block">Suggested Priority:</span>
                      <strong className="text-slate-900 block truncate mt-0.5">
                        {grievance.ai_suggested_priority || 'N/A'}
                      </strong>
                    </div>
                  </div>

                  {grievance.ai_suggested_department && (
                    <div className="pt-1">
                      <button
                        onClick={handleApplyAISuggestion}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply AI Suggested Department to Assignment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grievance Narrative Description */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-[#17365D] text-base border-b border-slate-100 pb-3">
                  Grievance Full Description
                </h3>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
                  {grievance.description || 'No detailed narrative provided.'}
                </div>
              </div>

              {/* Citizen Attachments */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-[#17365D] text-base border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                    Supporting Documents & Evidence
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    {grievance.attachments?.length || 0} attached
                  </span>
                </h3>

                {grievance.attachments && grievance.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {grievance.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-5 h-5 text-[#245A91] shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {att.original_filename || att.filename || 'Attachment Document'}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              Uploaded {formatDate(att.uploaded_at)}
                            </span>
                          </div>
                        </div>
                        {att.file && (
                          <a
                            href={att.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-1.5 rounded-md text-slate-500 hover:text-[#245A91] hover:bg-white transition-colors"
                            title="Download attachment"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No documents or photographs were submitted with this grievance.
                  </p>
                )}
              </div>

              {/* Citizen Feedback (If Resolved) */}
              {grievance.feedback && (
                <div className="bg-emerald-50/60 rounded-xl p-5 border border-emerald-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Citizen Resolution Feedback
                    </h4>
                    <span className="text-xs text-emerald-700">
                      Submitted {formatDate(grievance.feedback.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (grievance.feedback.rating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {grievance.feedback.rating} / 5 Stars
                    </span>
                  </div>
                  {grievance.feedback.comments && (
                    <p className="text-xs text-slate-700 bg-white/80 p-3 rounded-lg border border-emerald-100">
                      &quot;{grievance.feedback.comments}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right 1 Col: Citizen Profile & Meta Attributes */}
            <div className="space-y-6">
              {/* Citizen Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-[#17365D] text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#245A91]" />
                  Complainant Information
                </h3>
                {grievance.citizen ? (
                  <div className="space-y-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Full Name:</span>
                      <strong className="text-slate-900 text-sm">
                        {grievance.citizen.full_name || 'Anonymous Citizen'}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{grievance.citizen.email || 'N/A'}</span>
                    </div>
                    {grievance.citizen.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{grievance.citizen.mobile}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Citizen profile unavailable.</p>
                )}
              </div>

              {/* Administrative Metadata */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3.5">
                <h3 className="font-bold text-[#17365D] text-sm border-b border-slate-100 pb-2.5">
                  Administrative Classification
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      District
                    </span>
                    <strong className="text-slate-900">{grievance.district}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Category
                    </span>
                    <strong className="text-slate-900">{grievance.category}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Submitted
                    </span>
                    <span className="text-slate-700">{formatDate(grievance.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Target Due Date
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(grievance.due_date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Status Management Panel */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-[#17365D] text-sm border-b border-slate-100 pb-2.5">
                  Update Grievance Status
                </h3>
                <form onSubmit={handleStatusSubmit(onStatusSubmit)} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      New Status State
                    </label>
                    <select
                      {...registerStatus('status', { required: 'Status is required' })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800"
                    >
                      {STATUS_CHOICES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {statusErrors.status && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {statusErrors.status.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Status Change Remarks
                    </label>
                    <textarea
                      {...registerStatus('remarks')}
                      rows={2}
                      placeholder="Notes explaining this status modification..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="w-full py-2 px-3 rounded-lg bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    {isUpdatingStatus ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Apply Status Update
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEPARTMENT ASSIGNMENT & ACTION TAKEN REPORT */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Department & Officer Assignment */}
            <div className="space-y-6">
              {/* Current Active Assignment Status */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-[#17365D] text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#245A91]" />
                  Current Active Assignment
                </h3>
                {activeAssignment ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Department:</span>
                        <strong className="text-slate-900 text-sm">
                          {activeAssignment.department?.name} ({activeAssignment.department?.code})
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Assigned Officer:</span>
                        <span className="font-semibold text-slate-800">
                          {activeAssignment.assigned_officer?.full_name || 'Unassigned (Department Pool)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Assigned By:</span>
                        <span className="text-slate-600">
                          {activeAssignment.assigned_by?.full_name || 'CMO Administrator'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Assigned Date:</span>
                        <span className="text-slate-600">
                          {formatDate(activeAssignment.assigned_at)}
                        </span>
                      </div>
                      {activeAssignment.assignment_notes && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-500 block">Instructions / Directives:</span>
                          <p className="text-slate-700 mt-0.5 italic">
                            &quot;{activeAssignment.assignment_notes}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <p className="font-semibold">Not yet assigned to any department.</p>
                    <p className="mt-0.5 text-amber-700">
                      Select a department below to dispatch this grievance for investigation.
                    </p>
                  </div>
                )}
              </div>

              {/* Assignment Form */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-[#17365D] text-sm border-b border-slate-100 pb-2.5">
                  Assign or Reassign Department
                </h3>
                <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="space-y-4">
                  {/* Department Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Target Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...registerAssign('department_id', {
                        required: 'Please select a government department',
                      })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800"
                    >
                      <option value="">-- Choose Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                    {assignErrors.department_id && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {assignErrors.department_id.message}
                      </p>
                    )}
                  </div>

                  {/* Officer Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Assigned Officer (Optional)
                    </label>
                    <select
                      {...registerAssign('officer_id')}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800"
                    >
                      <option value="">-- Department Officer Pool (Unassigned) --</option>
                      {availableOfficers.map((off) => (
                        <option key={off.id} value={off.id}>
                          {off.full_name} ({off.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {watchDepartmentId && availableOfficers.length === 0
                        ? 'No designated officers listed under this department. Case will route to departmental queue.'
                        : 'Select a specific designated nodal officer or leave unassigned.'}
                    </p>
                  </div>

                  {/* Assignment Directives */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Directives / Instructions from CMO
                    </label>
                    <textarea
                      {...registerAssign('assignment_notes')}
                      rows={3}
                      placeholder="Special investigation directives, expected timeline, or priorities..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    {isAssigning ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Confirm Department Assignment
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Col: Action Taken Report (ATR) & Review */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-bold text-[#17365D] text-sm flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#16865B]" />
                    Action Taken Reports (ATR)
                  </h3>
                  <span className="text-xs text-slate-500">
                    {grievance.action_reports?.length || 0} reports on file
                  </span>
                </div>

                {grievance.action_reports && grievance.action_reports.length > 0 ? (
                  <div className="space-y-4">
                    {grievance.action_reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Submitted by: {report.officer?.full_name || 'Department Officer'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formatDate(report.submitted_at)}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              report.cmo_review_status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : report.cmo_review_status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : report.cmo_review_status === 'Revision Requested'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Review: {report.cmo_review_status || 'Pending'}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Investigation Findings & Actions
                          </p>
                          <p className="text-xs text-slate-800 mt-1 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                            {report.report_text || 'No text recorded in report.'}
                          </p>
                        </div>

                        {report.attachment && (
                          <div className="flex items-center gap-2 text-xs">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <a
                              href={report.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#245A91] hover:underline font-medium inline-flex items-center gap-1"
                            >
                              Download Officer Supporting Document
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {report.cmo_remarks && (
                          <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900">
                            <strong>CMO Review Remarks:</strong> {report.cmo_remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No Action Taken Report has been filed yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      The assigned officer will upload an investigation report once fieldwork concludes.
                    </p>
                  </div>
                )}
              </div>

              {/* CMO ATR Review Form */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-[#17365D] text-sm border-b border-slate-100 pb-2.5">
                  CMO Executive Review of ATR
                </h3>
                <form onSubmit={handleReviewSubmit(onReviewSubmit)} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Review Decision <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...registerReview('cmo_review_status', { required: true })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800"
                    >
                      <option value="Approved">Approved (Resolves grievance)</option>
                      <option value="Rejected">Rejected (Requires Re-investigation)</option>
                      <option value="Revision Requested">Revision Requested (Officer must revise report)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      CMO Remarks / Feedback to Officer
                    </label>
                    <textarea
                      {...registerReview('cmo_remarks')}
                      rows={3}
                      placeholder="Notes regarding whether the remedial measures are satisfactory or need rectification..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isReviewing || !grievance.action_reports?.length}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#16865B] hover:bg-[#136f4b] text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    {isReviewing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submit ATR Review Decision
                      </>
                    )}
                  </button>
                  {!grievance.action_reports?.length && (
                    <p className="text-[10px] text-slate-400 text-center">
                      Review form becomes active once an ATR is submitted by the department.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONFIDENTIAL INTERNAL REMARKS */}
        {activeTab === 'remarks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Remarks Log */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-[#17365D] text-sm">
                      Confidential CMO Internal Remarks
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Visible exclusively to CMO administrators. Hidden from citizen and public views.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    Confidential
                  </span>
                </div>

                {grievance.internal_remarks && grievance.internal_remarks.length > 0 ? (
                  <div className="space-y-3">
                    {grievance.internal_remarks.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-slate-900">
                            {r.admin?.full_name || 'CMO Administrator'}
                          </strong>
                          <span className="text-slate-400">{formatDate(r.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {r.remark}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No confidential internal remarks recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Right 1 Col: Add Internal Remark Form */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-[#17365D] text-sm border-b border-slate-100 pb-2.5">
                  Record New Internal Note
                </h3>
                <form onSubmit={handleRemarkSubmit(onRemarkSubmit)} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Internal Remark Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...registerRemark('remark', {
                        required: 'Please type an internal remark before submitting',
                      })}
                      rows={5}
                      placeholder="Add confidential observations, policy notes, or ministerial directives..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-800 resize-none"
                    />
                    {remarkErrors.remark && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {remarkErrors.remark.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingRemark}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#17365D] hover:bg-[#245A91] text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    {isAddingRemark ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Save Internal Remark
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LIFECYCLE TRAIL */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-[#17365D] text-base">
                Audit Trail & Lifecycle History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full chronological record of state changes, escalations, assignments, and reviews.
              </p>
            </div>

            {grievance.history && grievance.history.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {grievance.history.map((h, idx) => (
                  <div key={h.id || idx} className="relative group">
                    <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#245A91] ring-4 ring-white" />
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">Transition:</span>
                          <span className="text-xs font-bold text-slate-700">
                            {h.previous_status || 'Initial'}
                          </span>
                          <span className="text-xs text-slate-400">➔</span>
                          <StatusBadge status={h.new_status} />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(h.created_at)}
                        </span>
                      </div>

                      {h.remarks && (
                        <p className="text-xs text-slate-700 mt-1 italic">
                          &quot;{h.remarks}&quot;
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 pt-1">
                        Actor:{' '}
                        <strong className="text-slate-800">
                          {h.changed_by?.full_name || 'System / Administrator'}
                        </strong>{' '}
                        ({h.changed_by?.role || 'Admin'})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No history events recorded yet.
              </p>
            )}
          </div>
        )}

        {/* STATUS UPDATE MODAL (RENDERED VIA PORTAL) */}
        {statusModalOpen &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="status-modal-title"
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            >
              {/* High-contrast backdrop */}
              <div
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
                onClick={() => !isUpdatingStatus && setStatusModalOpen(false)}
              />

              {/* Accessible Modal Card */}
              <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2.5 text-[#17365D]">
                    <div className="w-9 h-9 rounded-xl bg-[#245A91]/10 flex items-center justify-center text-[#245A91]">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 id="status-modal-title" className="font-extrabold text-slate-900 text-base">
                        Update Grievance Status
                      </h3>
                      <p className="text-xs text-slate-500">Ref: {grievance.reference_number}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => setStatusModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Current Status Banner */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Current Active State
                    </span>
                    <span className="text-xs font-semibold text-slate-700">Official Status</span>
                  </div>
                  <StatusBadge status={grievance.status} />
                </div>

                {/* Form */}
                <form onSubmit={handleStatusSubmit(onStatusSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      New Status Transition <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...registerStatus('status', { required: 'Please select a status' })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900 font-bold shadow-xs"
                    >
                      {STATUS_CHOICES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {statusErrors.status && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{statusErrors.status.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Reason & Remarks for Status Change
                    </label>
                    <textarea
                      {...registerStatus('remarks')}
                      rows={3}
                      placeholder="Document administrative justification for this status modification..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900 shadow-xs resize-none"
                    />
                  </div>

                  {statusModalError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{statusModalError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => setStatusModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingStatus}
                      className="px-5 py-2.5 rounded-xl bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Updating Status...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Confirm Status Update</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* ESCALATION MODAL (RENDERED VIA PORTAL) */}
        {escalateModalOpen &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="escalate-modal-title"
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            >
              <div
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
                onClick={() => !isEscalating && setEscalateModalOpen(false)}
              />
              <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 z-10 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <ShieldAlert className="w-5 h-5" />
                    <h3 id="escalate-modal-title" className="font-bold text-slate-900 text-base">
                      Escalate Grievance Priority
                    </h3>
                  </div>
                  <button
                    type="button"
                    disabled={isEscalating}
                    onClick={() => setEscalateModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Escalating will notify the department head and shorten the resolution SLA. This action is permanently logged into the audit ledger.
                </p>

                <form onSubmit={handleEscalateSubmit(onEscalateSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Escalation Level
                    </label>
                    <select
                      {...registerEscalate('priority')}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-800 font-bold"
                    >
                      <option value="Urgent">Urgent (Chief Minister Attention)</option>
                      <option value="High">High (Departmental Priority)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Justification / Reason for Escalation
                    </label>
                    <textarea
                      {...registerEscalate('remarks', {
                        required: 'Please state the justification for escalation',
                      })}
                      rows={3}
                      placeholder="E.g., Repeated citizen appeals, public safety risk, departmental negligence..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-800 resize-none"
                    />
                    {escalateErrors.remarks && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {escalateErrors.remarks.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isEscalating}
                      onClick={() => setEscalateModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isEscalating}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isEscalating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Confirm Escalation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
      </div>
    </DashboardLayout>
  );
}
