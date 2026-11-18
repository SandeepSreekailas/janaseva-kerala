import { useState, useEffect } from 'react';
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
  Briefcase,
  IdCard,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, updateProfile, changePassword } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboardUrlByRole } from '../../components/common/ProtectedRoute';

export default function ProfilePage() {
  const { user: authUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    address: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Load latest profile from API
  const fetchProfile = async () => {
    try {
      const data = await getCurrentUser();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        mobile: data.mobile || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error('Failed to load user profile:', err);
      if (authUser) {
        setProfile(authUser);
        setFormData({
          full_name: authUser.full_name || '',
          mobile: authUser.mobile || '',
          address: authUser.address || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Submit Profile Info
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsUpdatingProfile(true);

    try {
      const updated = await updateProfile({
        full_name: formData.full_name,
        mobile: formData.mobile,
        address: formData.address,
      });
      setProfile(updated);
      setProfileSuccess('Your profile details have been updated successfully.');
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      const data = err?.response?.data;
      const msg =
        data?.full_name?.[0] ||
        data?.mobile?.[0] ||
        data?.address?.[0] ||
        data?.detail ||
        'Failed to update profile details.';
      setProfileError(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must contain at least 6 characters.');
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setPasswordSuccess('Password updated successfully.');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error('Password change failed:', err);
      const data = err?.response?.data;
      const msg =
        data?.old_password?.[0] ||
        data?.new_password?.[0] ||
        data?.detail ||
        'Failed to change password. Please verify your current password.';
      setPasswordError(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  const userRole = profile?.role || authUser?.role;
  const isCitizen = userRole === 'citizen';
  const isOfficer = userRole === 'officer';
  const isCMO = userRole === 'cmo_admin' || userRole === 'cmo' || userRole === 'admin';

  const dashboardUrl = getDashboardUrlByRole(userRole);
  const displayName = profile?.full_name || profile?.name || 'Portal User';

  const roleBadge = isCMO
    ? { title: "Chief Minister's Office Administrator", bg: 'bg-amber-50 text-amber-900 border-amber-200' }
    : isOfficer
    ? { title: 'Department Officer', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' }
    : { title: 'Registered Citizen', bg: 'bg-blue-50 text-[#245A91] border-blue-200' };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-semibold mt-3">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* HEADER & BREADCRUMB */}
      <div className="pb-3 border-b border-slate-200">
        <Link
          to={dashboardUrl}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245A91] hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              User Profile & Account Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your personal contact details, verified government credentials, and security password.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchProfile}
            title="Refresh profile data"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: OFFICIAL CREDENTIAL CARD */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="text-center pb-5 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#17365D] to-[#245A91] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-3">{displayName}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{profile?.email}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold border ${roleBadge.bg}`}
            >
              {roleBadge.title}
            </span>
          </div>

          {/* Role-Specific Official Info */}
          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Login Email
                </span>
                <span className="font-semibold text-slate-900 break-all">{profile?.email}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Verified system identifier
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Contact Mobile
                </span>
                <span className="font-semibold text-slate-900">
                  {profile?.mobile || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Officer Credentials */}
            {isOfficer && (
              <>
                <div className="flex items-start gap-3 text-slate-700">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Assigned Department
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.department?.name || profile?.department?.code || 'Not Assigned'}
                    </span>
                    {profile?.department?.code && (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 mt-0.5">
                        {profile.department.code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Designation
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.designation || 'Nodal Grievance Officer'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700">
                  <IdCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Employee ID
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {profile?.employee_id || 'Not recorded'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Citizen Details */}
            {isCitizen && (
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Residential Address
                  </span>
                  <span className="font-semibold text-slate-900 whitespace-pre-wrap">
                    {profile?.address || 'No address provided yet'}
                  </span>
                </div>
              </div>
            )}

            {/* CMO Details */}
            {isCMO && (
              <div className="flex items-start gap-3 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-[#E4B84A] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Administrative Scope
                  </span>
                  <span className="font-semibold text-slate-900">
                    Statewide Oversight & Redressal Super-Admin
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 text-slate-700 pt-2 border-t border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Account Created Date
                </span>
                <span className="font-semibold text-slate-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PERMITTED FIELDS & CHANGE PASSWORD */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: EDIT PROFILE FORM */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-[#245A91]" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Edit Permitted Profile Information</h2>
                <p className="text-[11px] text-slate-500">
                  Update your contact number, personal name, and residential information.
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileSuccess(null)}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  &times;
                </button>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. 9447000000"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>
              </div>

              {/* Citizen Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Residential / Communication Address
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your permanent or communication address in Kerala..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                />
              </div>

              {/* Fixed Read-Only Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Official role, assigned department, and login email address are managed by the Chief
                  Minister's Office and cannot be modified directly.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 bg-[#17365D] hover:bg-[#245A91] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isUpdatingProfile ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#E4B84A]" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: CHANGE PASSWORD FORM */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Key className="w-5 h-5 text-[#245A91]" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Change Account Password</h2>
                <p className="text-[11px] text-slate-500">
                  Ensure your new password is at least 6 characters long and kept confidential.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordSuccess(null)}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  &times;
                </button>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Existing Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.old_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, old_password: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Secure Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password: e.target.value })
                    }
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm_password: e.target.value })
                    }
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isChangingPass ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
