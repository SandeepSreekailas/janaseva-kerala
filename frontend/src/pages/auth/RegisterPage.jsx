import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Check,
} from 'lucide-react';

export default function RegisterPage() {
  const { register: registerAuth, login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      mobile: '',
      password: '',
      password_confirm: '',
      terms: false,
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        mobile: data.mobile?.trim() || '',
        password: data.password,
        password_confirm: data.password_confirm,
      };

      const result = await registerAuth(payload);

      // If tokens weren't automatically set, try auto-login
      if (!result?.access) {
        try {
          await login({ email: payload.email, password: payload.password });
        } catch {
          // Fallback to login page with notice
          navigate('/login', {
            state: { message: 'Registration successful! Please sign in with your credentials.' },
          });
          return;
        }
      }

      // Redirect directly to Citizen Dashboard
      navigate('/citizen/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      let msg = 'Registration failed. Please check the form fields.';
      if (err?.response?.data) {
        const d = err.response.data;
        if (typeof d === 'string') {
          msg = d;
        } else if (d.email) {
          msg = Array.isArray(d.email) ? d.email[0] : d.email;
        } else if (d.password) {
          msg = Array.isArray(d.password) ? d.password[0] : d.password;
        } else if (d.password_confirm) {
          msg = Array.isArray(d.password_confirm) ? d.password_confirm[0] : d.password_confirm;
        } else if (d.non_field_errors) {
          msg = d.non_field_errors[0];
        } else if (typeof d === 'object') {
          msg = Object.values(d).flat().join(' ');
        }
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between text-slate-800">
      
      {/* Top Banner Header */}
      <header className="bg-[#17365D] text-white py-3 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E4B84A] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#17365D]" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">JanaSeva Kerala</span>
              <span className="text-[10px] text-slate-300 block -mt-0.5">Government of Kerala</span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Portal
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-lg">
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#16865B]/10 text-[#16865B] flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#17365D]">
                Citizen Registration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Create your verified profile to submit and track government grievances
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter your official full name"
                    autoComplete="name"
                    {...register('full_name', {
                      required: 'Full name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' },
                    })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.full_name ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Enter a valid email address',
                      },
                    })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                  Mobile Number (for SMS Tracking Alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="e.g. 9847012345"
                    autoComplete="tel"
                    {...register('mobile', {
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit Indian mobile number',
                      },
                    })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.mobile ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-red-600 mt-1">{errors.mobile.message}</p>
                )}
                <span className="text-[11px] text-slate-400 block mt-1">
                  Reference status codes and resolution notices will be SMSed to this number.
                </span>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.password ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Password Confirm */}
              <div>
                <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    {...register('password_confirm', {
                      required: 'Please confirm your password',
                      validate: (val) =>
                        val === passwordVal || 'Passwords do not match',
                    })}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#245A91] transition-colors ${
                      errors.password_confirm ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F5F7FA]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password_confirm && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.password_confirm.message}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('terms', {
                      required: 'You must acknowledge the portal terms and disclaimer',
                    })}
                    className="mt-1 rounded border-slate-300 text-[#245A91] focus:ring-[#245A91]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I declare that the information provided is accurate and agree to abide by the guidelines of the Chief Minister's Public Grievance Redressal Portal.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-red-600 mt-1">{errors.terms.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#16865B] hover:bg-[#13724d] text-white font-bold text-sm shadow-md transition-colors duration-200 disabled:opacity-60 mt-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Citizen Profile</span>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-bold text-[#245A91] hover:underline"
              >
                Sign in to your account
              </Link>
            </div>
          </div>

          {/* Security note */}
          <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16865B]" />
            <span>Encrypted & Compliant with Digital Personal Data Protection Standards</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-200">
        &copy; {new Date().getFullYear()} Government of Kerala — Chief Minister's Public Grievance Redressal Portal
      </footer>
    </div>
  );
}
