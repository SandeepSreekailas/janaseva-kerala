import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Users,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const getRedirectPath = (user) => {
    // If user was routed from a protected page, honor it first
    if (location.state?.from?.pathname) {
      return location.state.from.pathname;
    }

    const role = (user?.role || '').toLowerCase();
    if (role === 'cmo' || role === 'cmo_admin' || role === 'admin') {
      return '/cmo/dashboard';
    }
    if (role === 'officer') {
      return '/officer/dashboard';
    }
    return '/citizen/dashboard';
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await login({
        email: data.email.trim(),
        password: data.password,
      });

      const loggedUser = response?.user;
      const targetPath = getRedirectPath(loggedUser);
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        (err?.response?.data && typeof err.response.data === 'object'
          ? Object.values(err.response.data).flat().join(' ')
          : null) ||
        'Invalid email or password. Please verify your credentials.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to fill demo credentials
  const fillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
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
        <div className="w-full max-w-md space-y-6">
          
          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg">
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#245A91]/10 text-[#245A91] flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#17365D]">
                Portal Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Access your citizen dashboard or administrative workspace
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
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
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

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#17365D] uppercase tracking-wide">
                    Password
                  </label>
                  <Link
                    to="/contact"
                    className="text-xs text-[#245A91] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'Password is required',
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#245A91] hover:bg-[#1b4372] text-white font-bold text-sm shadow-md transition-colors duration-200 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials for Fast Testing */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                Demo Accounts Quick-Fill
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemo('citizen@example.com', 'citizen123')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 truncate"
                  title="Citizen: citizen@example.com"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('officer.pwd@janaseva.kerala.gov.in', 'officer123')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 truncate"
                  title="Officer: officer.pwd@janaseva.kerala.gov.in"
                >
                  Officer
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('cmo@janaseva.kerala.gov.in', 'admin123')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 truncate"
                  title="CMO Admin: cmo@janaseva.kerala.gov.in"
                >
                  CMO Admin
                </button>
              </div>
            </div>

            {/* Registration link */}
            <div className="mt-6 text-center text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-[#245A91] hover:underline"
              >
                Register as a Citizen
              </Link>
            </div>
          </div>

          {/* Privacy & Trust Badge */}
          <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16865B]" />
            <span>Official Government Single Sign-On Infrastructure</span>
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
