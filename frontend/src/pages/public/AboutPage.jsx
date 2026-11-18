import { Link } from 'react-router-dom';
import {
  Target,
  Compass,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Building2,
  Sparkles,
  Clock,
  HeartHandshake,
  Scale,
  AlertTriangle,
  FileText,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Scale,
      title: 'Integrity & Transparency',
      desc: 'Every petition is logged with an immutable audit trail. Status changes, departmental reassignments, and investigation reports are visible to citizens.',
    },
    {
      icon: Clock,
      title: 'Time-Bound Accountability',
      desc: 'Resolution timelines (SLAs) are strictly monitored. Unaddressed grievances trigger automatic escalations to district collectors and the CMO.',
    },
    {
      icon: Sparkles,
      title: 'Technological Excellence',
      desc: 'State-of-the-art AI contextual classification ensures accurate departmental routing, minimizing bureaucratic redirection and human delay.',
    },
    {
      icon: HeartHandshake,
      title: 'Citizen-First Empathy',
      desc: 'Public servants are stewards of the people. Citizen feedback and satisfaction ratings directly influence administrative evaluations.',
    },
  ];

  const pillars = [
    {
      title: 'Chief Minister\'s Office (CMO)',
      role: 'Direct Oversight & Escalation',
      desc: 'Apex monitoring body maintaining active surveillance over resolution quality, red-flagging delays, and reviewing Action Taken Reports (ATRs).',
      badge: 'State Apex',
    },
    {
      title: 'Department Secretariats',
      role: 'Policy & Execution Standards',
      desc: 'State-level authorities ensuring departmental guidelines, resource allocation, and field directives are executed effectively.',
      badge: 'State Departments',
    },
    {
      title: 'District Grievance Cells',
      role: '14 District Coordination Desks',
      desc: 'Chaired by District Collectors to bridge local issues with relevant local self-governments, PWD circles, and water/power divisions.',
      badge: 'District Level',
    },
    {
      title: 'Field Investigation Officers',
      role: 'On-Ground Resolution',
      desc: 'Authorized field engineers and officers who conduct physical inspections, enact repairs, and document evidence-backed reports.',
      badge: 'Grassroots Action',
    },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#17365D] via-[#1c4576] to-[#245A91] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4B84A] text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Building2 className="w-3.5 h-3.5" />
              Government of Kerala Initiative
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              About Janaseva Kerala
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              Bridging the gap between the people of Kerala and governance through intelligent automation, prompt redressal, and uncompromised administrative transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-4 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#16865B]/15 text-[#16865B] flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#16865B] block">
              Our Core Mission
            </span>
            <h3 className="text-2xl font-bold text-[#17365D]">
              Delivering Swift & Responsive Governance
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              To empower every citizen residing across Kerala’s 14 districts with a friction-free, secure, and modern channel to voice administrative grievances. We aim to guarantee that every legitimate concern is investigated thoroughly by responsible officials and resolved within measurable, public timelines.
            </p>
            <div className="pt-2">
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16865B] shrink-0" />
                  Zero-tolerance for administrative sluggishness and unresolved files.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16865B] shrink-0" />
                  Direct channel from citizens to the Chief Minister’s Office.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16865B] shrink-0" />
                  Accessible to urban and rural populations alike.
                </li>
              </ul>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-4 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#245A91]/15 text-[#245A91] flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#245A91] block">
              Our Vision
            </span>
            <h3 className="text-2xl font-bold text-[#17365D]">
              A Model of Digital Citizen Governance
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              To establish Kerala as a benchmark in digital public administration where grievance resolution is proactive rather than reactive. By merging cutting-edge artificial intelligence with compassionate civil service, we build a future where civic integrity and public trust are permanently sustained.
            </p>
            <div className="pt-2">
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#245A91] shrink-0" />
                  Continuous AI monitoring to anticipate regional infrastructure bottlenecks.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#245A91] shrink-0" />
                  Complete transparency where every action report is verifiable.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#245A91] shrink-0" />
                  Citizen satisfaction scores forming key performance metrics for officers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-[#F5F7FA] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16865B]">
              Foundational Principles
            </span>
            <h2 className="text-3xl font-extrabold text-[#17365D] mt-2">
              Our Guiding Values
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Every design decision and operational procedure in Janaseva Kerala is anchored in four cardinal values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#245A91]/10 text-[#245A91] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-[#17365D] text-lg mb-2">{v.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Administrative Hierarchy & Structure */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#245A91]">
            Governance Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-[#17365D] mt-2">
            Multi-Tier Redressal Framework
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Structured hierarchy ensuring seamless coordination between state secretariats and on-ground field personnel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-[#F5F7FA] text-[#17365D] border border-slate-200 mb-3">
                  {p.badge}
                </span>
                <h4 className="font-bold text-[#17365D] text-lg mb-1">{p.title}</h4>
                <p className="text-xs font-semibold text-[#16865B] mb-3">{p.role}</p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Legal & Institutional Disclaimer */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-[#17365D] text-base">
                Official Government Mandate & Legal Disclaimer
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>Janaseva Kerala</strong> operates under the direct executive mandate of the Chief Minister's Office, Government of Kerala. 
                Petitions submitted through this portal are intended strictly for administrative and civic service grievances relating to state government departments and agencies.
              </p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p>
                  • <strong>Judicial Matters:</strong> Cases pending before any Court of Law, Consumer Forum, or Tribunal cannot be admitted or arbitrated through this portal.
                </p>
                <p>
                  • <strong>Right to Information (RTI):</strong> This portal is not an RTI application gateway. Citizens seeking formal RTI information should file through the official Kerala RTI Online portal.
                </p>
                <p>
                  • <strong>Service Matters:</strong> Submissions relating to internal service disputes or disciplinary actions of government employees are governed by separate administrative service rules.
                </p>
                <p>
                  • <strong>Emergency Notice:</strong> This portal is not an emergency hotline. In the event of threats to life, property, or health, dial <strong>112 (Police)</strong>, <strong>108 (Ambulance)</strong>, or <strong>101 (Fire)</strong> immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-[#17365D] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Join Hands in Building a Better Kerala
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Whether you have a grievance to resolve or need to check an ongoing petition, Janaseva Kerala is at your service 24/7.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-[#E4B84A] text-[#17365D] font-bold text-sm hover:bg-[#d8ad3e] transition-colors"
            >
              Submit Grievance
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
