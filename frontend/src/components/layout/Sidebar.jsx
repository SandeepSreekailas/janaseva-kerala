import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  Settings,
  Bell,
  ClipboardList,
  Send,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const citizenLinks = [
  { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/citizen/submit', label: 'New Grievance', icon: PlusCircle },
  { to: '/citizen/grievances', label: 'My Grievances', icon: FileText },
  { to: '/citizen/notifications', label: 'Notifications', icon: Bell },
];

const cmoLinks = [
  { to: '/cmo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cmo/grievances', label: 'All Grievances', icon: ClipboardList },
  { to: '/cmo/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/cmo/departments', label: 'Departments', icon: Building2 },
  { to: '/cmo/notifications', label: 'Notifications', icon: Bell },
  { to: '/cmo/settings', label: 'Settings', icon: Settings },
];

const officerLinks = [
  { to: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/officer/grievances', label: 'Assigned Cases', icon: ClipboardList },
  { to: '/officer/reports', label: 'My Reports', icon: Send },
  { to: '/officer/notifications', label: 'Notifications', icon: Bell },
];

const getRoleLinks = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'cmo' || r === 'cmo_admin' || r === 'admin') {
    return cmoLinks;
  }
  if (r === 'officer') {
    return officerLinks;
  }
  return citizenLinks;
};

const getRoleLabel = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'cmo' || r === 'cmo_admin' || r === 'admin') {
    return { label: 'CMO Admin', icon: ShieldCheck, color: 'text-[#E4B84A]' };
  }
  if (r === 'officer') {
    return { label: 'Dept. Officer', icon: TrendingUp, color: 'text-[#16865B]' };
  }
  return { label: 'Citizen', icon: Users, color: 'text-[#245A91]' };
};

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const links = getRoleLinks(user?.role);
  const roleInfo = getRoleLabel(user?.role);
  const RoleIcon = roleInfo.icon;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Role badge */}
      <div className={`px-4 py-4 border-b border-gray-200 ${collapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <RoleIcon className={`w-5 h-5 ${roleInfo.color} shrink-0`} />
          {!collapsed && (
            <span className={`text-sm font-semibold ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith('dashboard')}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-[#245A91] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#17365D]'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block border-t border-gray-200 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-bold text-[#17365D]">Menu</span>
          <button
            onClick={onMobileClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
