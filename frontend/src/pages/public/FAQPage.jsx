import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Search,
  HelpCircle,
  FileText,
  Cpu,
  Clock,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

const faqs = [
  {
    id: 1,
    category: 'General',
    question: 'What is Janaseva Kerala and who is eligible to file a petition?',
    answer:
      'Janaseva Kerala is the official computerized Public Grievance Redressal Portal under the direct supervision of the Chief Minister\'s Office (CMO), Government of Kerala. Any resident of Kerala or Non-Resident Keralite (NRK) who has an unaddressed civic or administrative issue involving state government departments, autonomous boards, or local self-government institutions is eligible to file a petition.',
  },
  {
    id: 2,
    category: 'General',
    question: 'What kinds of grievances can be registered on this portal?',
    answer:
      'You can register grievances relating to road damage and public works (PWD), drinking water supply and pipeline leakages (KWA), electricity supply disruptions and transformer repairs (KSEB), revenue certificates, land mutations, and survey disputes (Revenue), public health centers and hospitals, sanitation and waste management (LSGD/Panchayats), ration distribution, and public transport (KSRTC).',
  },
  {
    id: 3,
    category: 'General',
    question: 'What issues are strictly outside the jurisdiction of this portal?',
    answer:
      'The portal cannot accept: (1) Matters that are sub-judice or pending before any Court of Law, Lokayukta, or Judicial Tribunal; (2) Right to Information (RTI) applications (which must be filed on the Kerala RTI portal); (3) Commercial vendor contract disputes or private civil disputes; (4) Grievances regarding religious institutions; (5) Internal service matters of government employees governed by Kerala Service Rules (KSR).',
  },
  {
    id: 4,
    category: 'AI & Triage',
    question: 'How does the AI Assistant assist in processing my grievance?',
    answer:
      'When you submit your complaint narrative in English or Malayalam, our AI engine scans the text to extract the core problem, geographical location, and public safety impact. It automatically recommends the appropriate department (e.g. KWA, PWD, Revenue) and tags urgency priority (Normal, High, or Urgent). This eliminates human delays at sorting desks and routes your petition directly to the relevant nodal desk within 24 hours.',
  },
  {
    id: 5,
    category: 'Tracking',
    question: 'What is the Tracking Reference Number and how do I track my grievance?',
    answer:
      'Upon submitting your grievance, a unique reference number formatted like "KL-2026-XXXXX" is generated and sent to you via SMS and email. You can check the live status anytime by visiting the "Track Grievance" page and entering this code. The tracking page displays the full audit history, assigned department, officer actions, and timestamps without requiring you to log in.',
  },
  {
    id: 6,
    category: 'Timelines',
    question: 'What are the mandated resolution timelines (SLAs)?',
    answer:
      'Resolution timelines depend on priority classification: (1) Urgent Priority: 48 to 72 hours (immediate public safety, fallen power lines, major hospital shortages); (2) High Priority: 7 working days (major road potholes, main drinking water pipeline bursts); (3) Normal Priority: 14 to 21 working days (general administrative and civic maintenance works).',
  },
  {
    id: 7,
    category: 'Timelines',
    question: 'What happens if a department officer fails to resolve my petition within the SLA?',
    answer:
      'Janaseva Kerala enforces an automated escalation matrix. If a petition remains unaddressed as the SLA nears expiration, the system issues automatic alerts. Once the deadline passes without an Action Taken Report (ATR), the petition is automatically marked as "Overdue" and escalated to the District Collector and the Chief Minister\'s Office Review Cell for intervention.',
  },
  {
    id: 8,
    category: 'General',
    question: 'Can I attach photos, documents, and site videos to my petition?',
    answer:
      'Yes. You can attach up to 5 supporting documents, letters, bills, or high-resolution photos in PDF, JPG, JPEG, or PNG format (up to 10MB per file). Photographic evidence of road potholes, broken pipelines, or damaged transformers significantly speeds up field investigations.',
  },
  {
    id: 9,
    category: 'Privacy',
    question: 'Is my personal identity and contact information kept confidential?',
    answer:
      'Yes. Your contact details (mobile number, home address, email) are encrypted and accessible only to the investigating department officer and authorized CMO administrators solely for verification purposes. Internal administrative remarks remain strictly confidential and protected.',
  },
  {
    id: 10,
    category: 'Tracking',
    question: 'What recourse do I have if I am dissatisfied with the Action Taken Report (ATR)?',
    answer:
      'When your petition is marked resolved, you will receive an SMS with a link to review the Action Taken Report and provide a 1 to 5-star citizen satisfaction score. If you rate the resolution as unsatisfactory (1 or 2 stars) and provide specific reasons, the CMO review desk may reopen the docket for a re-investigation or secondary audit.',
  },
  {
    id: 11,
    category: 'General',
    question: 'Is there any fee or application charge for using Janaseva Kerala?',
    answer:
      'No. Janaseva Kerala is 100% free of cost. The Government of Kerala does not charge any application fee, stamp duty, or processing charge for lodging, tracking, or resolving public grievances on this portal.',
  },
  {
    id: 12,
    category: 'Tracking',
    question: 'Will I receive SMS updates on my registered mobile number?',
    answer:
      'Yes. Automated SMS alerts are sent to your registered mobile number at every milestone: upon successful submission with your reference code, when assigned to a specific department officer, upon submission of the Action Taken Report, and when officially closed by the CMO review desk.',
  },
];

const categories = ['All', 'General', 'AI & Triage', 'Tracking', 'Timelines', 'Privacy'];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openItems, setOpenItems] = useState({ 1: true }); // Open first question by default

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all = {};
    faqs.forEach((f) => (all[f.id] = true));
    setOpenItems(all);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  const filteredFaqs = faqs.filter((faq) => {
    const term = searchTerm.toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#17365D] via-[#1c4576] to-[#245A91] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4B84A] text-xs font-semibold backdrop-blur-sm border border-white/20">
              <HelpCircle className="w-3.5 h-3.5" />
              Citizen Knowledge Base
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              Find instant answers to common questions about filing grievances, automated AI triage, resolution timelines, and tracking your petition.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Category Filter Toolbar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-10 space-y-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions or keywords (e.g. tracking, timelines, AI, documents)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] bg-[#F5F7FA]"
            />
          </div>

          {/* Category Pills & Expand/Collapse Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#17365D] text-white'
                      : 'bg-[#F5F7FA] text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#245A91]">
              <button onClick={expandAll} className="hover:underline">
                Expand All
              </button>
              <span className="text-slate-300">•</span>
              <button onClick={collapseAll} className="hover:underline">
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* FAQs List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-start justify-between gap-4 focus:outline-none hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 mb-1">
                        {faq.category}
                      </span>
                      <h3 className="font-bold text-[#17365D] text-base sm:text-lg">
                        {faq.question}
                      </h3>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center shrink-0 text-slate-500 transition-transform duration-200 mt-1 ${
                        isOpen ? 'rotate-180 bg-[#245A91] text-white' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-[#17365D] mb-1">No Matching Questions</h4>
            <p className="text-sm text-slate-500 mb-4">
              We couldn't find any FAQs matching your query "{searchTerm}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#245A91] text-white text-xs font-bold"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Bottom Helpdesk Banner */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="font-bold text-[#17365D] text-xl">
              Still have unanswered questions?
            </h4>
            <p className="text-sm text-slate-600 max-w-lg">
              Our citizen support officers at the Chief Minister's Office helpline are ready to assist you.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[#16865B] pt-1">
              <PhoneCall className="w-4 h-4" />
              <span>Dial Toll-Free: 1076 (Monday to Saturday: 9 AM - 5:30 PM)</span>
            </div>
          </div>

          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-[#16865B] hover:bg-[#13724d] text-white font-bold text-xs sm:text-sm whitespace-nowrap transition-colors shadow-sm"
          >
            Contact Helpdesk Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
