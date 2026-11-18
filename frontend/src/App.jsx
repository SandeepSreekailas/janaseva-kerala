import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Guards
import ProtectedRoute, { PublicOnlyRoute, getDashboardUrlByRole } from './components/common/ProtectedRoute';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import CitizenLayout from './components/layout/CitizenLayout';
import CMOLayout from './components/layout/CMOLayout';
import OfficerLayout from './components/layout/OfficerLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import DepartmentsPage from './pages/public/DepartmentsPage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import TrackGrievancePage from './pages/public/TrackGrievancePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Citizen Portal Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitGrievancePage from './pages/citizen/SubmitGrievancePage';
import GrievanceListPage from './pages/citizen/GrievanceListPage';
import GrievanceDetailPage from './pages/citizen/GrievanceDetailPage';
import NotificationsPage from './pages/citizen/NotificationsPage';

// CMO Administrative Portal Pages
import CMODashboard from './pages/cmo/CMODashboard';
import CMOGrievanceList from './pages/cmo/CMOGrievanceList';
import CMOGrievanceDetail from './pages/cmo/CMOGrievanceDetail';
import AnalyticsPage from './pages/cmo/AnalyticsPage';
import CMODepartmentsPage from './pages/cmo/CMODepartmentsPage';
import CMOOfficersPage from './pages/cmo/CMOOfficersPage';
import CMOSettingsPage from './pages/cmo/CMOSettingsPage';

// Department Officer Portal Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerGrievanceList from './pages/officer/OfficerGrievanceList';
import OfficerGrievanceDetail from './pages/officer/OfficerGrievanceDetail';
import OfficerReportsPage from './pages/officer/OfficerReportsPage';

// Shared Pages
import ProfilePage from './pages/common/ProfilePage';
import NotFoundPage from './pages/common/NotFoundPage';

/**
 * Smart Notification Router
 * Auto-routes /notifications to the user's role-specific notifications page
 */
function RoleNotificationRedirect() {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  if (role === 'cmo' || role === 'cmo_admin' || role === 'admin') {
    return <Navigate to="/cmo/notifications" replace />;
  }
  if (role === 'officer') {
    return <Navigate to="/officer/notifications" replace />;
  }
  return <Navigate to="/citizen/notifications" replace />;
}

/**
 * Smart Dashboard Router
 * Auto-routes /dashboard to the user's role-specific dashboard
 */
function RoleDashboardRedirect() {
  const { user } = useAuth();
  const dashboard = getDashboardUrlByRole(user?.role);
  return <Navigate to={dashboard} replace />;
}

/**
 * Smart Profile Router
 * Auto-routes /profile to the user's role-specific dashboard layout profile page
 */
function RoleProfileRedirect() {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  if (role === 'cmo' || role === 'cmo_admin' || role === 'admin') {
    return <Navigate to="/cmo/profile" replace />;
  }
  if (role === 'officer') {
    return <Navigate to="/officer/profile" replace />;
  }
  return <Navigate to="/citizen/profile" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ============================================================ */}
          {/* A. PUBLIC WEBSITE LAYOUT (Unauthenticated / Public Pages)      */}
          {/* ============================================================ */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/track" element={<TrackGrievancePage />} />
          </Route>

          {/* ============================================================ */}
          {/* AUTHENTICATION (Standalone - redirects if already logged in) */}
          {/* ============================================================ */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* ============================================================ */}
          {/* B. CITIZEN DASHBOARD LAYOUT (Protected: Citizen)              */}
          {/* ============================================================ */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute requiredRole="citizen">
                <CitizenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/citizen/dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="submit" element={<SubmitGrievancePage />} />
            <Route path="grievances" element={<GrievanceListPage />} />
            <Route path="grievances/:id" element={<GrievanceDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* ============================================================ */}
          {/* C. CMO ADMIN LAYOUT (Protected: CMO Admin)                    */}
          {/* ============================================================ */}
          <Route
            path="/cmo"
            element={
              <ProtectedRoute requiredRole="cmo_admin">
                <CMOLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/cmo/dashboard" replace />} />
            <Route path="dashboard" element={<CMODashboard />} />
            <Route path="grievances" element={<CMOGrievanceList />} />
            <Route path="grievances/:id" element={<CMOGrievanceDetail />} />
            <Route path="officers" element={<CMOOfficersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="departments" element={<CMODepartmentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<CMOSettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* ============================================================ */}
          {/* D. DEPARTMENT OFFICER LAYOUT (Protected: Officer)             */}
          {/* ============================================================ */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute requiredRole="officer">
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="grievances" element={<OfficerGrievanceList />} />
            <Route path="grievances/:id" element={<OfficerGrievanceDetail />} />
            <Route path="reports" element={<OfficerReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* ============================================================ */}
          {/* SHARED AUTHENTICATED ROUTES & SMART REDIRECTS                 */}
          {/* ============================================================ */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <RoleProfileRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <RoleNotificationRedirect />
              </ProtectedRoute>
            }
          />

          {/* Convenience aliases for citizen grievances */}
          <Route path="/grievances" element={<Navigate to="/citizen/grievances" replace />} />
          <Route path="/grievances/new" element={<Navigate to="/citizen/submit" replace />} />
          <Route
            path="/grievances/:id"
            element={
              <ProtectedRoute requiredRole="citizen">
                <Navigate to="/citizen/grievances" replace />
              </ProtectedRoute>
            }
          />

          {/* ============================================================ */}
          {/* 404 NOT FOUND (renders dedicated NotFoundPage)               */}
          {/* ============================================================ */}
          <Route
            path="*"
            element={
              <PublicLayout>
                <NotFoundPage />
              </PublicLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
