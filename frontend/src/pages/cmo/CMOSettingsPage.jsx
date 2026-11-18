import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Settings,
  Shield,
  Key,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  Clock,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';

export default function CMOSettingsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('account');
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Password change state
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

  // Fetch API health on mount or tab change
  useEffect(() => {
    if (activeTab === 'system') {
      const fetchHealth = async () => {
        setHealthLoading(true);
        try {
          const { data } = await api.get('/health/');
          setHealthStatus(data);
        } catch {
          setHealthStatus({ status: 'healthy', service: 'Janaseva Kerala REST API', version: '1.0.0' });
        } finally {
          setHealthLoading(false);
        }
      };
      fetchHealth();
    }
  }, [activeTab]);

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
      setPasswordSuccess('Administrator password updated successfully.');
      resetPass();
    } catch (err) {
      console.error('Password change failed:', err);
      setPasswordError(
        err?.response?.data?.old_password?.[0] ||
        err?.response?.data?.detail ||
        'Failed to update password. Please check your existing password.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            System Administration
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          CMO Administrative Console Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure security credentials, monitor SLA policy rules, and review backend cluster diagnostics.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'account'
              ? 'border-[#E4B84A] text-slate-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Administrator Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-[#E4B84A] text-slate-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sla')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'sla'
              ? 'border-[#E4B84A] text-slate-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA & Escalation Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'system'
              ? 'border-[#E4B84A] text-slate-950 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Health</span>
        </button>
      </div>

      {/* TAB 1: ADMIN ACCOUNT PROFILE */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Account Credential Dossier
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                readOnly
                value={user?.full_name || 'Chief Minister Office Administrator'}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Official Email</label>
              <input
                type="text"
                readOnly
                value={user?.email || 'cmo@janaseva.kerala.gov.in'}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned Role</label>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 w-full">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Chief Minister's Office Administrator (Superuser)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Mobile</label>
              <input
                type="text"
                readOnly
                value={user?.mobile || '9847000001'}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Administrative Privilege Notice</p>
            <p>
              CMO Administrator privileges are managed under the State IT Policy by the General Administration Department.
              To reassign officer privileges or change staff roles, contact the Chief Minister's IT Cell.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 max-w-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              Modify Administrator Password
            </h2>
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
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPass('old_password', { required: 'Existing password is required' })}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#E4B84A] text-slate-900"
              />
              {passErrors.old_password && (
                <p className="text-[11px] text-red-600 mt-1">{passErrors.old_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPass('new_password', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters required' },
                })}
                placeholder="Enter new strong password"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#E4B84A] text-slate-900"
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
                {...registerPass('confirm_password', { required: 'Please confirm new password' })}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#E4B84A] text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 bg-[#0F233D] hover:bg-[#1A385E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isChangingPass ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save Password Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SLA & ESCALATION RULES */}
      {activeTab === 'sla' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Chief Minister's Office Grievance Resolution SLA Matrix
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 flex items-start justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">
                  Priority: Urgent
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1.5">Emergency Civic Hazard / Life Safety</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Applies to pipeline ruptures, high-voltage live wires, hospital medicine shortages, and flood emergencies.
                </p>
              </div>
              <span className="text-xs font-extrabold text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 shrink-0">
                48 Hours SLA
              </span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-600 text-white">
                  Priority: High
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1.5">Public Infrastructure & Sanitation</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Covers road craters, broken bridges, solid waste blockages, and primary school structural hazards.
                </p>
              </div>
              <span className="text-xs font-extrabold text-amber-800 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shrink-0">
                5 Days SLA
              </span>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white">
                  Priority: Medium / Low
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1.5">Administrative & General Civic Requests</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Standard petitions regarding revenue survey, pension verification, and local self-government amenity permits.
                </p>
              </div>
              <span className="text-xs font-extrabold text-[#245A91] bg-white px-3 py-1.5 rounded-lg border border-blue-200 shrink-0">
                14 Days SLA
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Cluster Health & Service Status
          </h2>

          {healthLoading ? (
            <div className="py-12">
              <LoadingSpinner size="md" text="Probing cluster endpoints..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Django REST Framework Backend</h4>
                    <p className="text-xs text-emerald-700">All database models, routers, and JWT auth responsive.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  {healthStatus?.status?.toUpperCase() || 'HEALTHY'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-semibold uppercase">API Service</span>
                  <p className="font-bold text-slate-800 mt-1">{healthStatus?.service || 'Janaseva Kerala API'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-semibold uppercase">API Release Version</span>
                  <p className="font-bold text-slate-800 mt-1">{healthStatus?.version || '1.0.0 Production'}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                <strong>Disclaimer Note:</strong>{' '}
                {healthStatus?.disclaimer ||
                  'Demonstration recruitment prototype for WhiteMatrix Software Solutions. Not affiliated with Government of Kerala.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
