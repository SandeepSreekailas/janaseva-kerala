import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Paperclip,
  Upload,
  Star,
  Building2,
  User,
  ShieldCheck,
  Sparkles,
  Send,
  Calendar,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Layers,
  Loader2,
  X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getGrievance,
  getGrievanceHistory,
  submitFeedback,
  uploadAttachment,
} from '../../api/grievances';

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

export default function GrievanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // New attachment upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Citizen feedback form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Load grievance details & history
  const loadGrievanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [grievanceData, historyData] = await Promise.all([
        getGrievance(id),
        getGrievanceHistory(id).catch(() => []),
      ]);

      setGrievance(grievanceData);
      const histList = Array.isArray(historyData)
        ? historyData
        : historyData?.results || grievanceData?.history || [];
      setHistory(histList);
    } catch (err) {
      console.error('Failed to load grievance details:', err);
      setError('Unable to load grievance details. The record might not exist or access is restricted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadGrievanceData();
    }
  }, [id]);

  const copyRefToClipboard = () => {
    if (!grievance?.reference_number) return;
    navigator.clipboard.writeText(grievance.reference_number);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Upload an additional attachment
  const handleUploadAttachment = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploadingFile(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await uploadAttachment(id, fileToUpload);
      setFileToUpload(null);
      setUploadSuccess(true);
      // Refresh grievance to show new attachment
      const refreshed = await getGrievance(id);
      setGrievance(refreshed);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      setUploadError(
        err.response?.data?.detail || 'Failed to upload attachment. Please ensure file is valid.'
      );
    } finally {
      setUploadingFile(false);
    }
  };

  // Submit resolution feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      await submitFeedback(id, {
        rating,
        comments: feedbackComment.trim(),
      });
      setFeedbackSuccess(true);
      // Refresh grievance to display submitted feedback
      const refreshed = await getGrievance(id);
      setGrievance(refreshed);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setFeedbackError(
        err.response?.data?.detail ||
          'Could not submit feedback. Only resolved grievances accept citizen feedback.'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isResolved =
    grievance?.status?.toLowerCase() === 'resolved' ||
    grievance?.status?.toLowerCase() === 'closed';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner size="lg" text="Retrieving complete grievance file..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !grievance) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Grievance Not Found</h2>
          <p className="text-sm text-slate-600 mt-2">{error || 'Record could not be retrieved.'}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => loadGrievanceData()}
              className="px-4 py-2 rounded-lg bg-[#245A91] text-white text-xs font-semibold hover:bg-[#1c4875]"
            >
              Try Again
            </button>
            <Link
              to="/grievances"
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Back to My Grievances
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Link
            to="/grievances"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245A91] hover:text-[#17365D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Grievances List
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Reference ID:
                  </span>
                  <span className="font-mono text-base sm:text-lg font-extrabold text-[#17365D] select-all">
                    {grievance.reference_number}
                  </span>
                  <button
                    onClick={copyRefToClipboard}
                    className="p-1 rounded text-slate-400 hover:text-[#245A91] transition-colors"
                    title="Copy reference number"
                  >
                    {copiedRef ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  {copiedRef && (
                    <span className="text-[11px] font-semibold text-emerald-600">Copied!</span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {grievance.subject}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Lodged: {formatDate(grievance.created_at)}
                  </span>
                  {grievance.updated_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Updated: {formatDate(grievance.updated_at)}
                    </span>
                  )}
                  {grievance.resolved_at && (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved: {formatDate(grievance.resolved_at)}
                    </span>
                  )}
                </div>
              </div>

              {/* Badges on right */}
              <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                {grievance.is_overdue && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Overdue
                  </span>
                )}
                <PriorityBadge priority={grievance.priority} />
                <StatusBadge status={grievance.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Main Details & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#245A91]" />
                Grievance Description
              </h2>
              <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {grievance.description}
              </div>

              {/* Classification metadata chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Category
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                    {grievance.category}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    District
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {grievance.district}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Priority Tier
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {grievance.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Advisory Analysis (if present) */}
            {(grievance.ai_summary || grievance.ai_suggested_department) && (
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/40 rounded-2xl border border-indigo-200/80 shadow-xs p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#17365D]">
                      AI Advisory Analysis
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Automated assessment generated at submission
                    </p>
                  </div>
                </div>

                {grievance.ai_summary && (
                  <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100 text-xs text-slate-700">
                    <span className="font-semibold text-indigo-900 block mb-0.5">Summary:</span>
                    <p className="italic">{grievance.ai_summary}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {grievance.ai_suggested_department && (
                    <div className="p-2.5 rounded-lg bg-white/70 border border-indigo-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Assigned Dept Recommendation
                      </span>
                      <span className="font-bold text-indigo-800">
                        {grievance.ai_suggested_department}
                      </span>
                    </div>
                  )}
                  {grievance.ai_suggested_priority && (
                    <div className="p-2.5 rounded-lg bg-white/70 border border-indigo-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Recommended Urgency
                      </span>
                      <span className="font-bold text-amber-800">
                        {grievance.ai_suggested_priority}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Taken Reports (ATRs) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#16865B]" />
                  Department Action Taken Reports (ATR)
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {grievance.action_reports?.length || 0} submitted
                </span>
              </div>

              {grievance.action_reports && grievance.action_reports.length > 0 ? (
                <div className="space-y-4">
                  {grievance.action_reports.map((atr) => (
                    <div
                      key={atr.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Officer: {atr.officer?.full_name || 'Department Officer'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Submitted on {formatDate(atr.submitted_at)}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          CMO Review: {atr.review_status_display || atr.cmo_review_status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                        {atr.report_text}
                      </div>

                      {atr.cmo_remarks && (
                        <div className="text-xs bg-amber-50/80 border border-amber-200/70 p-3 rounded-lg text-amber-900">
                          <span className="font-semibold block mb-0.5">CMO Review Remarks:</span>
                          <p>{atr.cmo_remarks}</p>
                        </div>
                      )}

                      {atr.attachment && (
                        <a
                          href={atr.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245A91] hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          View Officer Supporting Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>
                    Investigation in progress. The assigned department officer will inspect the issue
                    and submit an Action Taken Report (ATR) upon completing departmental verification.
                  </p>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#245A91]" />
                Supporting Documents & Attachments
              </h2>

              {/* Existing attachments */}
              {grievance.attachments && grievance.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grievance.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate mr-2">
                        <FileText className="w-4 h-4 text-[#245A91] shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate" title={att.original_filename}>
                            {att.original_filename || 'Attachment Document'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatDate(att.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={att.file}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-[#245A91] font-semibold hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-1"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No attachments submitted yet for this grievance.
                </p>
              )}

              {/* Upload new attachment form */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Upload Additional Supporting File
                </span>

                {uploadSuccess && (
                  <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Attachment uploaded successfully!</span>
                  </div>
                )}

                {uploadError && (
                  <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <form onSubmit={handleUploadAttachment} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="file"
                    id="new-attachment"
                    onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#245A91] hover:file:bg-blue-100"
                  />
                  <button
                    type="submit"
                    disabled={!fileToUpload || uploadingFile}
                    className="px-4 py-2 rounded-lg bg-[#245A91] hover:bg-[#1b4673] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-40 shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload File
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Citizen Feedback Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-[#E4B84A]" />
                Citizen Redressal Feedback
              </h2>

              {grievance.feedback ? (
                /* Feedback already submitted */
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= grievance.feedback.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-800 ml-1.5">
                        {grievance.feedback.rating} / 5 Rating
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(grievance.feedback.created_at)}
                    </span>
                  </div>

                  {grievance.feedback.comments ? (
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-emerald-100 italic">
                      "{grievance.feedback.comments}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No additional comments provided.</p>
                  )}
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Thank you! Your feedback helps the Chief Minister's Office audit departmental
                    performance.
                  </p>
                </div>
              ) : isResolved ? (
                /* Grievance resolved, ready for feedback */
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    This grievance is marked as <strong>Resolved</strong>. Please rate your
                    satisfaction with the redressal provided by the department.
                  </p>

                  {feedbackError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  )}

                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Rating (1 to 5 Stars):
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starVal <= (hoverRating || rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {hoverRating || rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label
                      htmlFor="comments"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Comments / Experience (Optional):
                    </label>
                    <textarea
                      id="comments"
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Were the department officers helpful? Did the resolution fix the problem on the ground?"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16865B] hover:bg-[#126b48] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                  >
                    {submittingFeedback ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Official Feedback
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Grievance not yet resolved */
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Feedback submission opens automatically once the grievance status is updated to{' '}
                    <strong>Resolved</strong> by the department.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timeline & Assignments (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Department Assignments Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#245A91]" />
                Department Assignments
              </h3>

              {grievance.assignments && grievance.assignments.length > 0 ? (
                <div className="space-y-3">
                  {grievance.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#17365D] text-sm">
                          {assignment.department?.name || 'Assigned Department'}
                        </span>
                        {assignment.is_active && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </div>

                      {assignment.department?.code && (
                        <p className="text-slate-500 text-[11px]">
                          Dept Code: <strong>{assignment.department.code}</strong>
                        </p>
                      )}

                      {assignment.assigned_officer && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700">
                            Assigned Officer:{' '}
                            <strong className="text-slate-900">
                              {assignment.assigned_officer.full_name}
                            </strong>
                          </span>
                        </div>
                      )}

                      {assignment.assignment_notes && (
                        <p className="text-slate-600 bg-white p-2 rounded border border-slate-100 text-[11px]">
                          <strong>Notes:</strong> {assignment.assignment_notes}
                        </p>
                      )}

                      <p className="text-[10px] text-slate-400 pt-1">
                        Assigned on {formatDate(assignment.assigned_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800">
                  Awaiting assignment. The CMO Administration will assign this case to the appropriate
                  Kerala State department shortly.
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#245A91]" />
                Status Timeline
              </h3>

              {history.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {history.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#245A91] ring-4 ring-white" />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {hist.new_status || 'Status Updated'}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatDate(hist.created_at)}
                          </span>
                        </div>

                        {hist.previous_status && (
                          <p className="text-[11px] text-slate-500">
                            Changed from{' '}
                            <span className="font-medium text-slate-700">
                              {hist.previous_status}
                            </span>
                          </p>
                        )}

                        {hist.remarks && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                            {hist.remarks}
                          </p>
                        )}

                        {hist.changed_by?.full_name && (
                          <p className="text-[10px] text-slate-400">
                            By {hist.changed_by.full_name} ({hist.changed_by.role || 'Staff'})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No status transitions logged yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
