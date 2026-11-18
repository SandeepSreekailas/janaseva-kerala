import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Send,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUnreadCount } from '../../api/misc';

const officerNavLinks = [
  { to: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/officer/grievances', label: 'Assigned Cases', icon: ClipboardList },
  { to: '/officer/reports', label: 'My Reports', icon: Send },
  { to: '/officer/notifications', label: 'Notifications', icon: Bell },
];

export default function OfficerLayout() {
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

  const displayName = user?.full_name || user?.name || 'Department Officer';
  const initial = displayName.charAt(0).toUpperCase();
  const departmentName = user?.department?.name || user?.department?.code || 'Department Officer';
  const departmentCode = user?.department?.code || 'DEPT';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* OFFICER TOP HEADER */}
      <header className="bg-[#1B365D] text-white sticky top-0 z-40 border-b border-[#245A91] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Toggle & Officer Portal Branding */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/officer/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16865B] flex items-center justify-center text-white font-black shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-white">
                      JanaSeva Officer
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#16865B] text-white uppercase tracking-wider">
                      {departmentCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 block leading-none truncate max-w-[200px] sm:max-w-none">
                    {departmentName}
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Notifications, Officer Profile Dropdown */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <Link
                to="/officer/notifications"
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

              {/* Officer Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#16865B] text-white font-bold text-xs flex items-center justify-center border border-white/20">
                    {initial}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold text-white leading-tight max-w-[130px] truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-emerald-300 font-medium leading-none">
                      {departmentCode} Officer
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-[#17365D] truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {departmentName}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/officer/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Profile & Password</span>
                      </Link>
                      <Link
                        to="/officer/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        <span>Officer Dashboard</span>
                      </Link>
                      <Link
                        to="/officer/reports"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Send className="w-4 h-4 text-slate-500" />
                        <span>My Action Reports</span>
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
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY: OFFICER SIDEBAR + MAIN VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
          <div className="p-4 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Field Officer Console
            </span>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span className="truncate">{departmentName}</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {officerNavLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/officer/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#16865B] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#17365D]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </div>
                {to === '/officer/notifications' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">Official Duties Notice</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Submit ATR within designated SLA deadlines.</p>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#1B365D] text-white">
                <span className="font-bold text-sm">Department Officer Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {officerNavLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/officer/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#16865B] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-[#17365D]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </div>
                    {to === '/officer/notifications' && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
