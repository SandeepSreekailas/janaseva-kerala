import { Link } from 'react-router-dom';
import {
  FileText,
  Cpu,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Upload,
  AlertCircle,
  Building2,
  Star,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function HowItWorksPage() {
  const stages = [
    {
      step: '01',
      title: 'Submit Grievance',
      subtitle: 'Online submission in under 3 minutes',
      icon: FileText,
      color: 'bg-blue-50 text-[#245A91] border-blue-200',
      tag: 'Step 1: Citizen Action',
      badgeColor: 'bg-blue-100 text-blue-800',
      details: [
        'Register with your name, verified email, and 10-digit mobile number.',
        'Select your Kerala District (e.g. Ernakulam, Thiruvananthapuram, Kozhikode, etc.).',
        'Choose an initial Category or let AI detect it from your problem description.',
        'Detail the location (Panchayat/Municipality, Ward, Landmark).',
        'Upload supporting evidence: photographs, bills, or official notices (PDF/JPG/PNG up to 10MB).',
      ],
      deliverable: 'Instant SMS & Email with your unique Tracking Reference Number (e.g., KL-2026-00123).',
      sla: 'Instant Confirmation',
    },
    {
      step: '02',
      title: 'AI Analysis & Triage',
      subtitle: 'Contextual NLP categorization & priority tagging',
      icon: Cpu,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      tag: 'Step 2: Automated Intelligence',
      badgeColor: 'bg-purple-100 text-purple-800',
      details: [
        'Janaseva AI scans complaint narrative in English or Malayalam transliteration.',
        'Automatically identifies key grievance themes and suggests the responsible department (e.g. KSEB, KWA, PWD, LSGD).',
        'Assigns an initial priority score (Normal, High, Urgent) based on risk and public safety indicators.',
        'The docket appears instantly in the CMO Administrative triage queue for automated or one-click officer assignment.',
        'Defines the mandatory Resolution SLA timeline based on urgency category.',
      ],
      deliverable: 'AI Triage summary generated and assigned to department officer queue.',
      sla: 'Within 24 Hours',
    },
    {
      step: '03',
      title: 'Investigation & Field Action',
      subtitle: 'Assigned department officer resolves the issue on site',
      icon: Building2,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      tag: 'Step 3: Department Field Action',
      badgeColor: 'bg-amber-100 text-amber-800',
      details: [
        'The designated Department Officer receives the petition directly on their Janaseva portal.',
        'Officer conducts an on-site physical inspection, coordinates with local contractors or panchayat engineers.',
        'Remedial actions (pipe repairs, road patching, electrical transformer fixing, revenue clearance) are carried out.',
        'Officer drafts an official Action Taken Report (ATR) documenting actions taken, repair completion dates, and photographic proof.',
        'Status is updated to "Action Taken Report Submitted" visible on public tracker.',
      ],
      deliverable: 'Verified Action Taken Report (ATR) with photographic proof uploaded by officer.',
      sla: '7 to 14 Working Days',
    },
    {
      step: '04',
      title: 'Resolution & Citizen Feedback',
      subtitle: 'CMO verification and citizen satisfaction rating',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-[#16865B] border-emerald-200',
      tag: 'Step 4: Quality Audit & Closure',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      details: [
        'Chief Minister’s Office Review Cell reviews the submitted ATR to ensure thoroughness and genuine remedy.',
        'Upon approval, the status is officially updated to "Resolved".',
        'Citizen receives an immediate SMS notification with the resolution summary and link to view the complete ATR.',
        'Citizen is invited to submit a 1 to 5-star satisfaction rating and written feedback.',
        'If citizen indicates that the problem was not satisfactorily resolved, CMO administrators may reopen the case for reinspection.',
      ],
      deliverable: 'Resolution Certificate, completed audit history, and citizen feedback record.',
      sla: '24-48 Hours after ATR',
    },
  ];

  const slaTable = [
    {
      priority: 'Urgent',
      badge: 'bg-red-50 text-red-700 ring-red-600/20',
      scope: 'Immediate public safety hazards, critical hospital supply shortages, live exposed high-voltage power cables, main water transmission burst.',
      maxDays: '48 to 72 Hours',
      escalationTrigger: 'Escalates to District Collector at 48 hours',
    },
    {
      priority: 'High',
      badge: 'bg-orange-50 text-orange-700 ring-orange-600/20',
      scope: 'Major arterial road potholes, local drinking water supply disruption, damaged school roofs during monsoon, community streetlighting failure.',
      maxDays: '7 Working Days',
      escalationTrigger: 'Escalates to Department Head at Day 5',
    },
    {
      priority: 'Normal',
      badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      scope: 'General administrative delays, certificate issuance queries, drainage desilting requests, panchayat pathway maintenance.',
      maxDays: '14 to 21 Working Days',
      escalationTrigger: 'Escalates to CMO Review Cell at Day 14',
    },
  ];

  const tips = [
    {
      title: 'Provide Accurate Location Details',
      desc: 'Mention District, Taluk, Grama Panchayat / Municipality, Ward number, and landmark for rapid officer dispatch.',
    },
    {
      title: 'Attach Clear Visual Evidence',
      desc: 'Photos of road potholes, broken water mains, or burnt transformers drastically accelerate investigation.',
    },
    {
      title: 'One Concern per Grievance',
      desc: 'Do not combine unrelated issues (e.g. road repair and electricity bill) in one petition to avoid inter-departmental delays.',
    },
    {
      title: 'Keep Your Reference Number Safe',
      desc: 'You can check the live audit history at any time without logging in simply by entering your reference code.',
    },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#17365D] via-[#1c4576] to-[#245A91] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4B84A] text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              End-to-End Redressal Architecture
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              How Janaseva Kerala Works
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              A transparent, 4-stage journey designed to ensure your petition is acknowledged immediately, processed by intelligent AI, inspected by responsible officials, and verified by the Chief Minister's Office.
            </p>
          </div>
        </div>
      </section>

      {/* Visual 4-Stage Process Flow */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16865B]">
            Process Walkthrough
          </span>
          <h2 className="text-3xl font-extrabold text-[#17365D] mt-2">
            The 4-Stage Redressal Lifecycle
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Every petition filed on Janaseva Kerala follows this rigorous, audited workflow.
          </p>
        </div>

        <div className="space-y-12">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl bg-[#F5F7FA] text-[#17365D] border border-slate-200 shrink-0">
                      {st.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${st.badgeColor}`}>
                          {st.tag}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#17365D]">{st.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-500">{st.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 self-start sm:self-center">
                    <Clock className="w-4 h-4 text-[#245A91]" />
                    <span className="text-xs font-semibold text-slate-700">Target SLA:</span>
                    <span className="text-xs font-bold text-[#17365D]">{st.sla}</span>
                  </div>
                </div>

                {/* Stage Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
                  <div className="lg:col-span-8 space-y-3">
                    <h4 className="font-bold text-[#17365D] text-sm uppercase tracking-wide">
                      What Happens in this Stage:
                    </h4>
                    <ul className="space-y-2.5">
                      {st.details.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-3 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#16865B] mt-0.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:col-span-4 bg-[#F5F7FA] rounded-2xl p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#17365D] uppercase tracking-wide">
                      <FileCheck className="w-4 h-4 text-[#245A91]" />
                      Stage Deliverable
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                      {st.deliverable}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SLA & Priority Standards */}
      <section className="py-16 bg-[#F5F7FA] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#245A91]">
              Mandated Timelines
            </span>
            <h2 className="text-3xl font-extrabold text-[#17365D] mt-2">
              Service Level Agreements (SLA)
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Resolution deadlines are calculated objectively to guarantee prompt redressal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {slaTable.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${item.badge}`}>
                      {item.priority} Priority
                    </span>
                    <span className="text-base font-extrabold text-[#17365D]">
                      {item.maxDays}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#17365D] text-base mb-2">Scope & Criteria</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {item.scope}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{item.escalationTrigger}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Citizen Tips for Faster Resolution */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16865B]">
            Help Us Help You
          </span>
          <h2 className="text-3xl font-extrabold text-[#17365D] mt-2">
            Tips for Rapid Grievance Resolution
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Follow these best practices to ensure zero ambiguity during official investigations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-[#16865B]/10 text-[#16865B] flex items-center justify-center font-bold text-sm mb-4">
                0{idx + 1}
              </div>
              <h4 className="font-bold text-[#17365D] text-base mb-2">{t.title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ready CTA */}
      <section className="py-16 bg-[#17365D] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Ready to File Your Grievance?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience prompt and accountable citizen governance. Submit your concern now or track your existing petition.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-[#E4B84A] text-[#17365D] font-bold text-sm hover:bg-[#d8ad3e] transition-colors shadow-lg"
            >
              Submit Grievance
            </Link>
            <Link
              to="/track"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
            >
              Track by Reference Code
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
