import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Bell,
  FileText,
  Search,
  Home,
  Phone,
  Info,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const publicLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/track', label: 'Track', icon: Search },
  { to: '/how-it-works', label: 'How It Works', icon: FileText },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/about', label: 'About', icon: Info },
  { to: '/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/contact', label: 'Contact', icon: Phone },
];

const getDashboardPath = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'cmo' || r === 'cmo_admin' || r === 'admin') {
    return '/cmo/dashboard';
  }
  if (r === 'officer') {
    return '/officer/dashboard';
  }
  return '/citizen/dashboard';
};

const getNotificationPath = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'cmo' || r === 'cmo_admin' || r === 'admin') {
    return '/cmo/notifications';
  }
  if (r === 'officer') {
    return '/officer/notifications';
  }
  return '/citizen/notifications';
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-[#17365D] text-white shadow-lg sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-[#122b4d] text-xs text-center py-1 text-gray-300">
        Government of Kerala — Chief Minister's Office
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#E4B84A] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#17365D]" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-lg tracking-tight block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                JanaSeva Kerala
              </span>
              <span className="text-[10px] text-gray-400 hidden sm:block">
                ജനസേവ കേരള
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={getNotificationPath(user?.role)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#245A91] flex items-center justify-center text-sm font-semibold">
                      {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium max-w-[120px] truncate">
                      {user?.full_name || user?.name || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 text-gray-700 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#17365D] truncate">
                          {user?.full_name || user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to={getDashboardPath(user?.role)}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-[#E4B84A] text-[#17365D] rounded-lg hover:bg-[#d4a83a] transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#17365D]">
          <div className="px-4 py-3 space-y-1">
            {publicLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            <hr className="border-white/10 my-2" />

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath(user?.role)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/citizen/notifications"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm text-center font-medium rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm text-center font-medium bg-[#E4B84A] text-[#17365D] rounded-lg hover:bg-[#d4a83a] transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
