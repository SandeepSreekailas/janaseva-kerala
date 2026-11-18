import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Building2,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  Key,
  Shield,
  AlertCircle,
  X,
  FileText,
  RefreshCw,
  Power,
  ChevronRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import {
  getOfficers,
  createOfficer,
  updateOfficer,
  toggleOfficerStatus,
} from '../../api/cmo';
import { getDepartments } from '../../api/misc';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CMOOfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    department_id: '',
    designation: '',
    employee_id: '',
    password: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    mobile: '',
    department_id: '',
    designation: '',
    employee_id: '',
    password: '',
  });

  // Fetch Officers and Departments
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [officersData, deptsData] = await Promise.all([
        getOfficers({
          search: searchTerm || undefined,
          department: selectedDept || undefined,
          status: statusFilter || undefined,
        }),
        getDepartments(),
      ]);
      setOfficers(Array.isArray(officersData) ? officersData : officersData?.results || []);
      setDepartments(Array.isArray(deptsData) ? deptsData : deptsData?.results || []);
    } catch (err) {
      console.error('Failed to load officer directory:', err);
      setError('Failed to load officer directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setStatusFilter('');
  };

  // Open Register Modal
  const openRegister = () => {
    setRegisterForm({
      full_name: '',
      email: '',
      mobile: '',
      department_id: departments[0]?.id || '',
      designation: '',
      employee_id: '',
      password: '',
    });
    setFormError(null);
    setShowRegisterModal(true);
  };

  // Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await createOfficer({
        ...registerForm,
        department_id: Number(registerForm.department_id),
      });
      setShowRegisterModal(false);
      setSuccessMessage(`Officer ${registerForm.full_name} registered successfully.`);
      fetchData();
    } catch (err) {
      console.error('Registration error:', err);
      const data = err?.response?.data;
      const msg =
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.department_id?.[0] ||
        data?.detail ||
        'Failed to register officer. Please check the inputs.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open View Modal
  const openView = (officer) => {
    setSelectedOfficer(officer);
    setShowViewModal(true);
  };

  // Open Edit Modal
  const openEdit = (officer) => {
    setSelectedOfficer(officer);
    setEditForm({
      full_name: officer.full_name || '',
      mobile: officer.mobile || '',
      department_id: officer.department?.id || '',
      designation: officer.designation || '',
      employee_id: officer.employee_id || '',
      password: '',
    });
    setFormError(null);
    setShowEditModal(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        full_name: editForm.full_name,
        mobile: editForm.mobile,
        department_id: Number(editForm.department_id) || null,
        designation: editForm.designation,
        employee_id: editForm.employee_id,
      };
      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }
      await updateOfficer(selectedOfficer.id, payload);
      setShowEditModal(false);
      setSuccessMessage(`Officer profile updated successfully.`);
      fetchData();
    } catch (err) {
      console.error('Update error:', err);
      const data = err?.response?.data;
      const msg =
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.detail ||
        'Failed to update officer profile.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Officer Status
  const handleToggleStatus = async (officer) => {
    const actionText = officer.is_active ? 'deactivate' : 'activate';
    const confirmPrompt = `Are you sure you want to ${actionText} officer "${officer.full_name}"?${
      officer.is_active ? ' They will not receive new grievance assignments.' : ''
    }`;
    if (!window.confirm(confirmPrompt)) return;

    try {
      await toggleOfficerStatus(officer.id);
      setSuccessMessage(
        `Officer account ${officer.full_name} has been ${
          officer.is_active ? 'deactivated' : 'activated'
        }.`
      );
      fetchData();
    } catch (err) {
      console.error('Toggle status error:', err);
      alert('Failed to update officer status.');
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = officers.length;
    const active = officers.filter((o) => o.is_active).length;
    const inactive = total - active;
    const totalAssigned = officers.reduce((sum, o) => sum + (o.assigned_grievances_count || 0), 0);
    return { total, active, inactive, totalAssigned };
  }, [officers]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#17365D] text-white rounded-xl shadow-xs">
              <Users className="w-5 h-5 text-[#E4B84A]" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Department Officer Management
              </h1>
              <p className="text-xs text-slate-500">
                Register, supervise, and assign responsibilities to departmental nodal officers across Kerala.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openRegister}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#17365D] hover:bg-[#245A91] text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#E4B84A]" />
          <span>Register New Officer</span>
        </button>
      </div>

      {/* SUCCESS / ERROR NOTIFICATIONS */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUMMARY STATS TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Officers
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Registered in portal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Active Accounts
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Receiving assignments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
            Deactivated
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.inactive}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Assignments blocked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#245A91] block">
            Active Workloads
          </span>
          <p className="text-2xl font-black text-[#245A91] mt-1">{stats.totalAssigned}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Grievances assigned</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search officers by name or email address..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245A91] text-slate-900"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Deactivated Only</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Search
            </button>

            {(searchTerm || selectedDept || statusFilter) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* OFFICER DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Officer Directory</h2>
            <p className="text-[11px] text-slate-500">
              Showing {officers.length} departmental officer records
            </p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            title="Refresh directory"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-slate-500 font-semibold mt-3">Loading officers database...</p>
          </div>
        ) : officers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No officers found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || selectedDept || statusFilter
                ? 'No department officers matched your search and filter criteria. Try resetting filters.'
                : 'No department officers are currently registered in Janaseva Kerala.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Officer Name & Contact</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4 text-center">Assigned</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{officer.full_name}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono truncate max-w-[180px]">{officer.email}</span>
                      </div>
                      {officer.mobile && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{officer.mobile}</span>
                        </div>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      {officer.department ? (
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {officer.department.name}
                          </span>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                            {officer.department.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {officer.designation || (
                        <span className="text-slate-400 font-normal italic">Nodal Officer</span>
                      )}
                    </td>

                    {/* Employee ID */}
                    <td className="py-3.5 px-4">
                      {officer.employee_id ? (
                        <span className="font-mono text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                          {officer.employee_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    {/* Assigned Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#245A91] border border-blue-100">
                        {officer.assigned_grievances_count || 0}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4 text-center">
                      {officer.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openView(officer)}
                          title="View Officer Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#245A91] hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(officer)}
                          title="Edit Officer Information"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(officer)}
                          title={officer.is_active ? 'Deactivate Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            officer.is_active
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REGISTER OFFICER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#17365D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#E4B84A]" />
                <h3 className="text-sm font-bold">Register Department Officer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  placeholder="e.g. Er. Suresh Kumar"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Government Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="e.g. officer.pwd2@janaseva.kerala.gov.in"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={registerForm.department_id}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, department_id: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={registerForm.mobile}
                    onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
                    placeholder="e.g. 9447000000"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={registerForm.designation}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, designation: e.target.value })
                    }
                    placeholder="e.g. Executive Engineer"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={registerForm.employee_id}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, employee_id: e.target.value })
                    }
                    placeholder="e.g. KL-PWD-8842"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Temporary Initial Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The officer will use this password to sign in and can change it afterwards.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#17365D] hover:bg-[#245A91] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <LoadingSpinner size="sm" />}
                  <span>Register Officer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OFFICER MODAL */}
      {showEditModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#17365D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-[#E4B84A]" />
                <h3 className="text-sm font-bold">Edit Officer Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (Fixed)
                </label>
                <input
                  type="email"
                  disabled
                  value={selectedOfficer.email}
                  className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={editForm.department_id}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department_id: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={editForm.employee_id}
                    onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password (Leave blank to keep existing)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="New temporary password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#245A91]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <LoadingSpinner size="sm" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW OFFICER DETAILS MODAL */}
      {showViewModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#17365D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#E4B84A]" />
                <h3 className="text-sm font-bold">Officer Profile & Authority</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#17365D] to-[#245A91] text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                  {selectedOfficer.full_name?.charAt(0).toUpperCase()}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">
                  {selectedOfficer.full_name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOfficer.email}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  {selectedOfficer.is_active ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active Officer
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      Deactivated
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#245A91] border border-blue-100">
                    {selectedOfficer.assigned_grievances_count || 0} Grievances
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Department
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedOfficer.department?.name || 'Unassigned'} (
                      {selectedOfficer.department?.code})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Designation
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedOfficer.designation || 'Nodal Officer'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <IdCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Employee ID
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {selectedOfficer.employee_id || 'Not recorded'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Mobile Phone
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedOfficer.mobile || 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Registered Date
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedOfficer.created_at
                        ? new Date(selectedOfficer.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    openEdit(selectedOfficer);
                  }}
                  className="px-4 py-2 bg-[#245A91] hover:bg-[#17365D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Edit Officer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
