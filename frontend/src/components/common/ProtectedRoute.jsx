import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Helper to determine default dashboard URL based on user role
 */
export const getDashboardUrlByRole = (role) => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'cmo' || normalized === 'cmo_admin' || normalized === 'admin') {
    return '/cmo/dashboard';
  }
  if (normalized === 'officer') {
    return '/officer/dashboard';
  }
  return '/citizen/dashboard';
};

/**
 * ProtectedRoute:
 * - Shows loading state during auth initialization
 * - If unauthenticated: redirects to /login with state.from
 * - If authenticated but lacks role: redirects to the user's appropriate role dashboard (NEVER to /login)
 */
export default function ProtectedRoute({ children, requiredRole, role }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingSpinner size="lg" text="Verifying authentication session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleConstraint = requiredRole || role;
  if (roleConstraint) {
    const allowedRoles = Array.isArray(roleConstraint) ? [...roleConstraint] : [roleConstraint];

    // Normalize CMO aliases
    if (allowedRoles.includes('cmo_admin') && !allowedRoles.includes('cmo')) {
      allowedRoles.push('cmo', 'admin');
    }

    const userRole = (user?.role || '').toLowerCase();
    const hasRole = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!hasRole) {
      // User is authenticated but tried to access a route for another role.
      // Redirect them to their own role's dashboard.
      const redirectUrl = getDashboardUrlByRole(userRole);
      return <Navigate to={redirectUrl} replace />;
    }
  }

  return children;
}

/**
 * PublicOnlyRoute:
 * For login and register pages.
 * If user is already authenticated, redirects them straight to their dashboard.
 */
export function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname;
    if (from && !from.includes('/login') && !from.includes('/register')) {
      return <Navigate to={from} replace />;
    }
    const dashboard = getDashboardUrlByRole(user.role);
    return <Navigate to={dashboard} replace />;
  }

  return children;
}
