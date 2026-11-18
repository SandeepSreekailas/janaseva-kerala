import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { submitEnquiry } from '../../api/misc';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  HelpCircle,
  FileText,
  PhoneCall,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await submitEnquiry(data);
      setSubmitSuccess(true);
      reset();
    } catch (err) {
      console.error('Contact form submission error:', err);
      // If backend error response provides message
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (err?.response?.data && typeof err.response.data === 'object'
          ? Object.values(err.response.data).flat().join(' ')
          : null) ||
        'Unable to send enquiry. Please check your connection or contact helpline 1076.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const emergencyContacts = [
    { label: 'Police Control Room', number: '112', desc: 'Immediate police response' },
    { label: 'Ambulance & Medical', number: '108', desc: 'Medical emergencies & transport' },
    { label: 'Fire & Rescue Services', number: '101', desc: 'Fire incidents & natural rescue' },
    { label: 'Women Helpline (Mitra)', number: '1091', desc: '24x7 safety for women' },
    { label: 'Cyber Crime Police', number: '1930', desc: 'Financial fraud & cyber threats' },
    { label: 'Childline Helpline', number: '1098', desc: 'Child protection & rescue' },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#17365D] via-[#1c4576] to-[#245A91] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4B84A] text-xs font-semibold backdrop-blur-sm border border-white/20">
              <PhoneCall className="w-3.5 h-3.5" />
              Citizen Support & Helpdesk
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Contact Us & General Enquiries
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              Have questions regarding portal services, need technical assistance, or wish to connect with the Chief Minister's Public Grievance Redressal Cell? Reach out to our dedicated helpdesk team.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Notice differentiating Contact Enquiries from Grievances */}
        <div className="mb-10 p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-[#17365D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#245A91] shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Need to lodge an official grievance?</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                For administrative complaints requiring investigation and SLA tracking, please use the Grievance Submission form to receive an official tracking reference number.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#245A91] hover:bg-[#1b4372] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
          >
            Submit Grievance
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#17365D]">
                  Send a Message to Helpdesk
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Our citizen support cell will respond to your registered email address within 24 working hours.
                </p>
              </div>

              {/* Success Message Banner */}
              {submitSuccess && (
                <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#16865B]">
                    <CheckCircle2 className="w-5 h-5" />
                    Enquiry Submitted Successfully!
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you for reaching out. Your enquiry has been forwarded to the Janaseva Kerala Citizen Support Desk. We will get back to you shortly at the email address provided.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs font-bold text-[#16865B] underline pt-1"
                  >
                    Send another enquiry
                  </button>
                </div>
              )}

              {/* Error Message Banner */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block">Submission Failed</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' },
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Enter a valid email address',
                      },
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                    Subject / Concern Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Query regarding grievance reference tracking"
                    {...register('subject', {
                      required: 'Subject is required',
                      minLength: { value: 5, message: 'Subject must be at least 5 characters' },
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.subject ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                    Your Message / Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Please describe your enquiry in detail..."
                    {...register('message', {
                      required: 'Message is required',
                      minLength: { value: 15, message: 'Message must be at least 15 characters' },
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors resize-y ${
                      errors.message ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#245A91] hover:bg-[#1b4372] text-white font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Enquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Office Address, Helplines & Emergency */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Headquarters Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <h4 className="font-bold text-[#17365D] text-lg">
                Chief Minister's Grievance Cell
              </h4>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#245A91] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#17365D]">Secretariat Headquarters</strong>
                    <span>Chief Minister's Office, Government Secretariat, Thiruvananthapuram, Kerala — 695001</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#245A91] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#17365D]">CM Toll-Free Helpline</strong>
                    <span className="text-base font-extrabold text-[#16865B]">1076</span>
                    <span className="text-slate-500 text-xs block">Toll-free across all landline and mobile networks in Kerala</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneCall className="w-5 h-5 text-[#245A91] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#17365D]">Secretariat Helpdesk Board</strong>
                    <span>+91 471 251 2345 / +91 471 251 8000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#245A91] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#17365D]">Official Email</strong>
                    <a
                      href="mailto:janaseva@kerala.gov.in"
                      className="text-[#245A91] hover:underline"
                    >
                      janaseva@kerala.gov.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#245A91] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#17365D]">Working Hours</strong>
                    <span>Monday to Saturday: 9:00 AM – 5:30 PM (Except second Saturdays and public holidays)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Hotlines Card */}
            <div className="bg-amber-50/90 rounded-3xl p-6 sm:p-8 border border-amber-200/80 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <span>Kerala Emergency Contact Numbers</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                For urgent life safety, fire, police assistance, or immediate medical help, please contact the dedicated emergency services directly:
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {emergencyContacts.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-xs"
                  >
                    <div className="text-base font-extrabold text-[#17365D]">{c.number}</div>
                    <div className="text-[11px] font-bold text-slate-800 truncate">{c.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
