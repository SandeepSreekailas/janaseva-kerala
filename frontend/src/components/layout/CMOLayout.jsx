import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Building2,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Shield,
  Activity,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUnreadCount } from '../../api/misc';

const cmoNavLinks = [
  { to: '/cmo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cmo/grievances', label: 'All Grievances', icon: ClipboardList },
  { to: '/cmo/officers', label: 'Officer Management', icon: Users },
  { to: '/cmo/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/cmo/departments', label: 'Departments', icon: Building2 },
  { to: '/cmo/notifications', label: 'Notifications', icon: Bell },
  { to: '/cmo/settings', label: 'Settings', icon: Settings },
];

export default function CMOLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const data = await getUnreadCount();
        if (isMounted && data) {
          setUnreadCount(typeof data.count === 'number' ? data.count : (typeof data.unread_count === 'number' ? data.unread_count : 0));
        }
      } catch {
        // Silently catch
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const displayName = user?.full_name || user?.name || 'CMO Administrator';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      {/* CMO ADMINISTRATIVE TOP HEADER */}
      <header className="bg-[#0F233D] text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Toggle & Admin Branding */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/cmo/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E4B84A] to-[#C99C32] flex items-center justify-center text-[#0F233D] font-black shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-white">
                      JanaSeva Admin
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider bg-amber-400 text-slate-950 uppercase">
                      CMO Cell
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-none">
                    Chief Minister's Office Grievance Monitoring & Audit
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Live Monitor indicator, Notifications, Admin Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SLA Engine Active</span>
              </div>

              {/* Notification Bell */}
              <Link
                to="/cmo/notifications"
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Admin Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E4B84A] text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-sm">
                    {initial}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-white leading-tight max-w-[130px] truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-amber-300 font-semibold leading-none">CMO Admin</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        CMO Administrator
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/cmo/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>System & Security Settings</span>
                      </Link>
                      <Link
                        to="/cmo/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/cmo/analytics"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-slate-500" />
                        <span>Statewide Analytics</span>
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                        <span>Public Portal</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Console</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY: CMO SIDEBAR + MAIN VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
          <div className="p-4 border-b border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Chief Minister's Office
            </span>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Grievance Oversight</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {cmoNavLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/cmo/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#E4B84A] text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </div>
                {to === '/cmo/notifications' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">CM Special Cell</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Government of Kerala</p>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <span className="font-bold text-sm text-amber-400">CMO Administrative Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {cmoNavLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/cmo/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#E4B84A] text-slate-950 font-extrabold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </div>
                    {to === '/cmo/notifications' && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN OUTLET CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
