import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  HelpCircle,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PriorityBadge from '../../components/common/PriorityBadge';
import { createGrievance, uploadAttachment } from '../../api/grievances';
import { analyzeGrievance } from '../../api/misc';

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

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function SubmitGrievancePage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // AI analysis state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiApplied, setAiApplied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      district: '',
      category: '',
      subject: '',
      description: '',
      priority: 'Medium',
    },
  });

  const subjectValue = watch('subject');
  const descriptionValue = watch('description');
  const districtValue = watch('district');

  // Trigger AI Advisory Analysis
  const handleAIAnalyze = async () => {
    if (!subjectValue || subjectValue.trim().length < 5) {
      setAiError('Please enter a brief subject before requesting AI analysis.');
      return;
    }
    if (!descriptionValue || descriptionValue.trim().length < 15) {
      setAiError('Please enter a descriptive grievance summary (at least 15 characters) for AI evaluation.');
      return;
    }

    setAiAnalyzing(true);
    setAiError(null);
    setAiApplied(false);

    try {
      const response = await analyzeGrievance({
        subject: subjectValue.trim(),
        description: descriptionValue.trim(),
        district: districtValue || '',
      });
      setAiResult(response);
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setAiError(
        err.response?.data?.detail ||
          'AI Assistant could not evaluate this text at this moment. You can still fill the form manually.'
      );
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Apply AI suggestions to the form
  const handleApplyAISuggestions = () => {
    if (!aiResult) return;

    if (aiResult.suggested_category && CATEGORIES.includes(aiResult.suggested_category)) {
      setValue('category', aiResult.suggested_category, { shouldValidate: true });
    }

    if (aiResult.suggested_priority && PRIORITIES.includes(aiResult.suggested_priority)) {
      setValue('priority', aiResult.suggested_priority, { shouldValidate: true });
    }

    setAiApplied(true);
  };

  // Form submit handler
  const onSubmit = async (formData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create the grievance
      const payload = {
        district: formData.district,
        category: formData.category,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      };

      const grievanceResponse = await createGrievance(payload);

      // 2. Upload attachment if citizen selected one
      if (selectedFile && grievanceResponse?.id) {
        try {
          await uploadAttachment(grievanceResponse.id, selectedFile);
        } catch (uploadErr) {
          console.warn('Attachment upload failed, but grievance was created:', uploadErr);
        }
      }

      setSuccessData(grievanceResponse);
    } catch (err) {
      console.error('Failed to submit grievance:', err);
      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        'Failed to submit grievance. Please review your details and try again.';
      setSubmitError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const copyReferenceToClipboard = () => {
    if (!successData?.reference_number) return;
    navigator.clipboard.writeText(successData.reference_number);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleResetForNew = () => {
    reset();
    setSelectedFile(null);
    setAiResult(null);
    setAiError(null);
    setAiApplied(false);
    setSuccessData(null);
    setSubmitError(null);
  };

  // SUCCESS SCREEN
  if (successData) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-6 sm:py-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 text-center">
            {/* Green Checkmark */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16865B] flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#17365D]">
              Grievance Registered Successfully!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
              Your grievance has been lodged with the Chief Minister's Public Grievance Redressal
              System (Janaseva Kerala). A tracking number has been generated.
            </p>

            {/* Reference Number Box */}
            <div className="mt-8 p-6 bg-slate-50 border-2 border-dashed border-[#245A91]/30 rounded-xl max-w-lg mx-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">
                Your Unique Grievance Reference Number
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-wide select-all">
                  {successData.reference_number}
                </span>
                <button
                  type="button"
                  onClick={copyReferenceToClipboard}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#245A91] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                  title="Copy reference number"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Keep this reference number for all future correspondence & public tracking.
              </p>
            </div>

            {/* Submission Snapshot */}
            <div className="mt-8 text-left bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 max-w-xl mx-auto text-xs text-slate-700 space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Subject:</span>
                <span className="font-medium text-slate-900 text-right max-w-xs truncate">
                  {successData.subject}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Category & District:</span>
                <span className="font-medium text-slate-900">
                  {successData.category} &bull; {successData.district}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Priority:</span>
                <PriorityBadge priority={successData.priority} />
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Initial Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Submitted
                </span>
              </div>
            </div>

            {/* Information Callout */}
            <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 text-left flex items-start gap-3 max-w-xl mx-auto">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Next Steps in Redressal:</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  The CMO triage team will assign your grievance to the nodal officer of the
                  concerned department within 24–48 working hours. You will receive real-time notifications
                  as investigation progresses.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/grievances/${successData.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#245A91] hover:bg-[#1d4875] text-white text-sm font-semibold transition-all shadow-sm"
              >
                <FileText className="w-4 h-4" />
                View Grievance Details
              </Link>
              <button
                type="button"
                onClick={handleResetForNew}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Another Grievance
              </button>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16865B] uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-[#16865B]" />
                Official Citizen Grievance Submission
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17365D]">
                Lodge a Public Grievance
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Submit complaints, departmental delays, or civic issues directly to the Kerala State
                Administration for prompt redressal.
              </p>
            </div>
            <Link
              to="/grievances"
              className="text-xs font-semibold text-[#245A91] hover:text-[#17365D] inline-flex items-center gap-1 self-start sm:self-auto"
            >
              View previous submissions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Submit Error Banner */}
        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to submit grievance</p>
              <p className="mt-0.5 text-red-700">{submitError}</p>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-400 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 mb-1">
                Grievance Subject / Title <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                placeholder="E.g., Pot-holed road and broken culvert on NH 66 bypass near Edappally"
                {...register('subject', {
                  required: 'Grievance subject is required',
                  minLength: {
                    value: 5,
                    message: 'Subject must be at least 5 characters long',
                  },
                  maxLength: {
                    value: 250,
                    message: 'Subject cannot exceed 250 characters',
                  },
                })}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91] transition-all ${
                  errors.subject ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.subject && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.subject.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">
                  Provide exact locations, dates, and background
                </span>
              </div>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe your issue with specific details: the exact landmark or ward, how long the issue has persisted, previous departmental complaints made if any, and the required redressal action..."
                {...register('description', {
                  required: 'Detailed description is required',
                  minLength: {
                    value: 15,
                    message: 'Please provide at least 15 characters of detail',
                  },
                })}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91] transition-all leading-relaxed ${
                  errors.description ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* AI Assistant Analysis Banner / Action */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#17365D] flex items-center gap-1.5">
                      AI Grievance Assistant
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        Smart Triage
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Let our automated assistant read your subject & description to suggest the
                      best category, priority, and responsible department.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAIAnalyze}
                  disabled={aiAnalyzing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-60 shrink-0 active:scale-95"
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Issue...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
              </div>

              {/* AI Error */}
              {aiError && (
                <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Results Box */}
              {aiResult && (
                <div className="mt-4 pt-4 border-t border-indigo-200/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        AI Advisory Recommendations
                      </span>
                      {aiResult.is_fallback ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Offline Heuristic Fallback
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Live {aiResult.source || `Google Gemini (${aiResult.model || 'gemini-2.5-flash'})`}
                        </span>
                      )}
                    </div>
                    {aiApplied ? (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Recommendations Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyAISuggestions}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
                      >
                        Apply Recommendations to Form
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Suggested Department
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {aiResult.suggested_department || 'General Administration'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Suggested Category
                      </span>
                      <span className="font-bold text-indigo-700 mt-0.5 block">
                        {aiResult.suggested_category || 'Public Works'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Suggested Priority
                      </span>
                      <span className="font-bold text-amber-700 mt-0.5 block">
                        {aiResult.suggested_priority || 'Medium'}
                      </span>
                    </div>
                  </div>

                  {aiResult.summary && (
                    <div className="bg-white p-3 rounded-lg border border-indigo-100 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Executive Summary:
                      </span>
                      <p className="italic text-slate-600">{aiResult.summary}</p>
                    </div>
                  )}

                  {aiResult.reasoning && (
                    <p className="text-[11px] text-indigo-800 leading-normal">
                      <strong>Reasoning:</strong> {aiResult.reasoning}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-indigo-200/50 text-[10px] text-slate-500">
                    <span>
                      Engine:{' '}
                      <strong className={aiResult.is_fallback ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                        {aiResult.source || (aiResult.is_fallback ? 'Rule-Based Fallback' : 'Google Gemini AI')}
                      </strong>
                    </span>
                    <span className="italic">Human citizen review required prior to submission</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* District */}
              <div>
                <label htmlFor="district" className="block text-sm font-semibold text-slate-900 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  {...register('district', { required: 'Please select your district' })}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245A91] transition-all ${
                    errors.district ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select District</option>
                  {DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-900 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  {...register('category', { required: 'Please select a grievance category' })}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245A91] transition-all ${
                    errors.category ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-slate-900 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  {...register('priority', { required: 'Please select priority' })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245A91] transition-all"
                >
                  {PRIORITIES.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Supporting Document / Attachment */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Supporting Attachment (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Upload photos, scanned petitions, receipts, or FIR copy (PDF, JPEG, PNG, max 10MB)
              </p>

              {selectedFile ? (
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-[#245A91] shrink-0" />
                    <span className="font-medium truncate">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400 shrink-0">
                      ({Math.round(selectedFile.size / 1024)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-[#245A91] bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors group">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#245A91] transition-colors mb-2" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#245A91]">
                    Click to select a supporting document
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Images or PDF up to 10MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submission Consent & Button */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-2.5 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                By submitting, you certify that the information provided is genuine and truthful to
                the best of your knowledge. False complaints are punishable under Kerala public
                administration rules.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#245A91] hover:bg-[#1b4673] text-white text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Submit Grievance
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
