import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboardUrlByRole } from '../../components/common/ProtectedRoute';

export default function ProfilePage() {
  const { user } = useAuth();

  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { isSubmitting: isChangingPass, errors: passErrors },
  } = useForm({
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onPasswordSubmit = async (formData) => {
    setPasswordSuccess(null);
    setPasswordError(null);

    if (formData.new_password !== formData.confirm_password) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      await changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      setPasswordSuccess('Password updated successfully.');
      resetPass();
    } catch (err) {
      console.error('Password change failed:', err);
      setPasswordError(
        err?.response?.data?.old_password?.[0] ||
        err?.response?.data?.detail ||
        'Failed to update password. Please verify your current password.'
      );
    }
  };

  const dashboardUrl = getDashboardUrlByRole(user?.role);
  const displayName = user?.full_name || user?.name || 'Portal User';
  const roleDisplay =
    user?.role === 'cmo_admin' || user?.role === 'cmo' || user?.role === 'admin'
      ? "Chief Minister's Office Administrator"
      : user?.role === 'officer'
      ? 'Department Officer'
      : 'Registered Citizen';

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Breadcrumb */}
      <div>
        <Link
          to={dashboardUrl}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A91] hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Dashboard</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900">
          User Account & Security Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your credentials, verified role authority, and manage account password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="text-center pb-5 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#17365D] to-[#245A91] text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-3">{displayName}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#245A91] border border-blue-100">
              {roleDisplay}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3 text-slate-700">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                <span className="font-semibold text-slate-900">{displayName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Email</span>
                <span className="font-semibold text-slate-900 truncate block">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                <span className="font-semibold text-slate-900">{user?.mobile || 'Not specified'}</span>
              </div>
            </div>

            {user?.department && (
              <div className="flex items-center gap-3 text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Department</span>
                  <span className="font-semibold text-slate-900">
                    {user?.department?.name || user?.department?.code}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5">
            <Key className="w-5 h-5 text-[#245A91]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Change Account Password</h2>
              <p className="text-[11px] text-slate-500">Ensure your new password contains at least 6 characters.</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePassSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Existing Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPass('old_password', { required: 'Please enter your current password' })}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
              />
              {passErrors.old_password && (
                <p className="text-[11px] text-red-600 mt-1">{passErrors.old_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Secure Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPass('new_password', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
              />
              {passErrors.new_password && (
                <p className="text-[11px] text-red-600 mt-1">{passErrors.new_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPass('confirm_password', { required: 'Please confirm your new password' })}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPass}
                className="px-5 py-2.5 bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isChangingPass ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
