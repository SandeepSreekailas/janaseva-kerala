import { Link } from 'react-router-dom';
import {
  FileQuestion,
  Home,
  LayoutDashboard,
  Search,
  Phone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardUrlByRole } from '../../components/common/ProtectedRoute';

export default function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const dashboardUrl = getDashboardUrlByRole(user?.role);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        {/* Visual Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#245A91] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            The requested application page does not exist or you may not have administrative privileges to access it.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAuthenticated ? (
            <Link
              to={dashboardUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#245A91] hover:bg-[#17365D] text-white font-bold text-xs shadow-md transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#17365D] hover:bg-[#0F233D] text-white font-bold text-xs shadow-md transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          )}

          <Link
            to="/track"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Track Grievance</span>
          </Link>
        </div>

        {/* Helpful Support Links */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link to="/contact" className="hover:text-[#245A91] font-medium flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Helpdesk</span>
          </Link>
          <span>•</span>
          <Link to="/faq" className="hover:text-[#245A91] font-medium">
            Portal FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
