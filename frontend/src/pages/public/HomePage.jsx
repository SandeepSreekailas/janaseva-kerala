import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Cpu,
  Building2,
  Users,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award,
  PhoneCall,
  Lock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import heroImage from '../../assets/hero.png';
import { useAuth } from '../../contexts/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [quickRef, setQuickRef] = useState('');
  const navigate = useNavigate();

  const submitUrl = isAuthenticated
    ? (user?.role === 'cmo' || user?.role === 'cmo_admin'
        ? '/cmo/dashboard'
        : user?.role === 'officer'
        ? '/officer/dashboard'
        : '/citizen/submit')
    : '/citizen/submit';

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickRef.trim()) {
      navigate(`/track?ref=${encodeURIComponent(quickRef.trim())}`);
    }
  };

  const stats = [
    { label: 'Resolution Rate', value: '98.4%', icon: TrendingUp },
    { label: 'Districts Covered', value: '14 / 14', icon: Building2 },
    { label: 'AI Triage Speed', value: '< 24 Hrs', icon: Clock },
    { label: 'Grievances Resolved', value: '1.2L+', icon: Award },
  ];

  const steps = [
    {
      num: '01',
      title: 'Submit Grievance',
      desc: 'Register online, specify your district & issue, and attach supporting photos or documents in under 3 minutes.',
      icon: FileText,
      tag: 'Citizen Action',
    },
    {
      num: '02',
      title: 'AI Analysis & Triage',
      desc: 'Our AI model analyzes grievance context, assigns priority, and instantly routes it to the designated department.',
      icon: Cpu,
      tag: 'Automated',
    },
    {
      num: '03',
      title: 'Official Investigation',
      desc: 'Field officers from the assigned department inspect the issue on ground and submit an Action Taken Report (ATR).',
      icon: Building2,
      tag: 'Field Action',
    },
    {
      num: '04',
      title: 'CMO Review & Resolution',
      desc: 'Chief Minister\'s Office audits the resolution, updates you via SMS/portal, and invites your feedback rating.',
      icon: ShieldCheck,
      tag: 'Verified Closure',
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Direct CMO Oversight',
      desc: 'Grievances are tracked at the Chief Minister\'s Office level to eliminate administrative delays and red-tape.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Smart Routing',
      desc: 'Natural language analysis classifies complaints, flags emergency urgency, and routes directly to the right department.',
    },
    {
      icon: Search,
      title: 'Transparent Real-time Tracking',
      desc: 'Track the exact audit stage of your petition with complete history timestamps and official remarks.',
    },
    {
      icon: Clock,
      title: 'Mandated Resolution SLAs',
      desc: 'Time-bound escalations ensure that cases not addressed within stipulated deadlines are auto-escalated to senior secretaries.',
    },
    {
      icon: Users,
      title: 'Citizen-Centric Feedback',
      desc: 'Your satisfaction score matters. Unsatisfactory resolutions can be reopened for reassessment by CMO administrators.',
    },
    {
      icon: Lock,
      title: 'Data Privacy & Security',
      desc: 'Protected by Government of Kerala secure cloud infrastructure, ensuring full confidentiality of sensitive citizen petitions.',
    },
  ];

  const topDepartments = [
    { code: 'PWD', name: 'Public Works Department', role: 'Roads, bridges, public buildings' },
    { code: 'WRD', name: 'Water Resources (KWA)', role: 'Drinking water & irrigation' },
    { code: 'KSEB', name: 'Kerala State Electricity Board', role: 'Power distribution & lines' },
    { code: 'REV', name: 'Revenue Department', role: 'Land records, survey & certificates' },
    { code: 'LSG', name: 'Local Self Government', role: 'Panchayat & municipal civic works' },
    { code: 'HLT', name: 'Health & Family Welfare', role: 'Hospitals & public wellness' },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800">
      {/* Top Advisory Banner */}
      <div className="bg-[#122b4d] text-slate-200 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#E4B84A] text-[#17365D] font-bold text-[11px]">
              OFFICIAL
            </span>
            <span>Government of Kerala — Chief Minister's Public Grievance Redressal Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#E4B84A]" /> CM Helpline: <strong className="text-white">1076</strong>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Emergency Police: <strong className="text-white">112</strong></span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#17365D] via-[#1f4a7c] to-[#16865B] text-white py-16 sm:py-20 lg:py-24">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#E4B84A]">
                <Sparkles className="w-4 h-4 text-[#E4B84A]" />
                <span>Next-Gen AI Powered Governance</span>
                <span className="text-white/60">•</span>
                <span className="text-slate-200 font-normal">ജനസേവ കേരള</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Swift, Transparent & <br className="hidden sm:inline" />
                <span className="text-[#E4B84A]">Accountable Grievance</span> Redressal
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                Empowering the citizens of Kerala with direct access to the Chief Minister's Office.
                Equipped with intelligent AI triage, automatic department allocation, and strict time-bound resolution tracking across all 14 districts.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={submitUrl}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E4B84A] text-[#17365D] font-bold text-sm sm:text-base hover:bg-[#d8ad3e] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <FileText className="w-5 h-5 text-[#17365D]" />
                  Submit Grievance
                  <ArrowRight className="w-4 h-4 text-[#17365D]" />
                </Link>

                <Link
                  to="/track"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/30 backdrop-blur-sm transition-all duration-200"
                >
                  <Search className="w-5 h-5 text-slate-200" />
                  Track Grievance
                </Link>
              </div>

              {/* Quick Tracker Search Box in Hero */}
              <div className="pt-4 max-w-lg">
                <form
                  onSubmit={handleQuickTrack}
                  className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-2 flex items-center gap-2 shadow-2xl"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter Reference Number (e.g. KL-2026-00123)"
                      value={quickRef}
                      onChange={(e) => setQuickRef(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent text-white placeholder-slate-300 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#16865B] hover:bg-[#13724d] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
                  >
                    Track Status
                  </button>
                </form>
                <p className="text-[11px] text-slate-300 mt-2 px-1">
                  Have an existing reference code? Track its live progress without logging in.
                </p>
              </div>
            </div>

            {/* Right Column: Hero Graphic & Visual Badge */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Visual Glassmorphic Card */}
                <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg p-6 space-y-6">
                  
                  {/* Image display */}
                  <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/20 bg-[#122b4d]/60 flex items-center justify-center">
                    <img
                      src={heroImage}
                      alt="Kerala Public Grievance Redressal"
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17365D] via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4B84A] block">
                        Government of Kerala
                      </span>
                      <p className="text-xs font-semibold">Chief Minister's Computerized Grievance Cell</p>
                    </div>
                  </div>

                  {/* Feature snippets on card */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-[#E4B84A]/20 flex items-center justify-center shrink-0">
                        <Cpu className="w-4 h-4 text-[#E4B84A]" />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-white">AI Contextual Classification</p>
                        <p className="text-slate-300 text-[11px]">Auto-detects department, district, and priority</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-[#16865B]/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#5be3ab]" />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-white">Direct CMO Audit Cell</p>
                        <p className="text-slate-300 text-[11px]">Strict verification before resolving any petition</p>
                      </div>
                    </div>
                  </div>

                  {/* Trust guarantee badge */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E4B84A]" /> 100% Free of Cost
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E4B84A]" /> Secure & Confidential
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Key Impact Statistics */}
      <section className="bg-white border-b border-slate-200 py-8 relative -mt-6 mx-4 sm:mx-8 lg:mx-auto max-w-6xl rounded-2xl shadow-lg z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5F7FA] border border-slate-200 flex items-center justify-center text-[#245A91] shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#17365D]">
                    {s.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245A91]/10 text-[#245A91] text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            Transparent Redressal Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17365D]">
            How Janaseva Kerala Works
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            From grievance submission to verified field resolution in four transparent, auditable stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-[#F5F7FA] text-[#17365D] border border-slate-200">
                      STEP {st.num}
                    </span>
                    <span className="text-[11px] font-semibold text-[#16865B] bg-emerald-50 px-2 py-0.5 rounded-full">
                      {st.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#245A91]/10 text-[#245A91] group-hover:bg-[#245A91] group-hover:text-white transition-colors flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-[#17365D] mb-2">{st.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{st.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#245A91]">
                  <span>Audited on Portal</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#245A91] hover:text-[#17365D] underline underline-offset-4"
          >
            Learn more about the investigation & escalation process
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#F5F7FA] py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16865B]">
              State-of-the-Art Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17365D] mt-2">
              Engineered for Speed, Accuracy & Accountability
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Addressing citizens' concerns through cutting-edge technology and rigorous administrative supervision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#245A91]/10 text-[#245A91] flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#17365D] mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Departments Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#245A91]">
              Department Integration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] mt-1">
              Key Government Departments Integrated
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Petitions are directly assigned to authorized officers across major state departments.
            </p>
          </div>

          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#245A91] hover:text-[#17365D]"
          >
            View all departments
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topDepartments.map((d) => (
            <div
              key={d.code}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#245A91]/40 transition-colors shadow-sm flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] border border-slate-200 flex items-center justify-center font-bold text-xs text-[#17365D] shrink-0">
                {d.code}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#17365D] truncate">{d.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{d.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Legal & Emergency Disclaimer */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-[#17365D] text-base">
                Official Government Disclaimer & Emergency Protocols
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>Janaseva Kerala</strong> is an official administrative grievance redressal mechanism established under the Chief Minister's Office, Government of Kerala.
                This platform is strictly designated for civic, administrative, and governmental service grievances.
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-amber-800">Do not use this portal for emergency situations.</strong> In cases of immediate life safety, crime in progress, medical emergencies, or fire hazards, dial the emergency response numbers: 
                <span className="font-semibold text-[#17365D]"> 112 (Police)</span>, 
                <span className="font-semibold text-[#17365D]"> 108 (Ambulance)</span>, 
                <span className="font-semibold text-[#17365D]"> 101 (Fire & Rescue)</span>, or 
                <span className="font-semibold text-[#17365D]"> 1091 (Women Helpline)</span>.
                Frivolous, false, or defamatory petitions may incur legal consequences under relevant cyber and civil statues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[#17365D] to-[#245A91] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto">
            Your grievance will be directly routed to responsible department authorities with transparent timeline tracking and Chief Minister's Office supervision.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? submitUrl : '/register'}
              className="px-6 py-3 rounded-xl bg-[#E4B84A] text-[#17365D] font-bold text-sm hover:bg-[#d8ad3e] transition-colors shadow-lg"
            >
              Register & File Petition
            </Link>
            <Link
              to="/faq"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
            >
              Frequently Asked Questions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
