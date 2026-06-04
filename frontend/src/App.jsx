import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
const StaffLoginPage = lazy(() => import('./pages/auth/StaffLoginPage'));
const StudentLoginPage = lazy(() => import('./pages/auth/StudentLoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Admin
const StudentsPage = lazy(() => import('./pages/admin/StudentsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));

// Enrollment
const EnrollmentPage = lazy(() => import('./pages/enrollment/EnrollmentPage'));

// Academic
const AcademicsPage = lazy(() => import('./pages/academics/AcademicsPage'));

// Grades
const GradesPage = lazy(() => import('./pages/grades/GradesPage'));

// Attendance
const AttendancePage = lazy(() => import('./pages/attendance/AttendancePage'));

// Financial
const FinancialPage = lazy(() => import('./pages/financial/FinancialPage'));

// Communication
const AnnouncementsPage = lazy(() => import('./pages/communication/AnnouncementsPage'));
const MessagesPage = lazy(() => import('./pages/communication/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/communication/NotificationsPage'));

// Campus
const LibraryPage = lazy(() => import('./pages/campus/LibraryPage'));
const RoomsPage = lazy(() => import('./pages/campus/RoomsPage'));

// Reports
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));

// Settings
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/settings/ProfilePage'));

// Super Admin
const SuperDashboardPage = lazy(() => import('./pages/super/SuperDashboardPage'));

// New pages
const HRPage = lazy(() => import('./pages/hr/HRPage'));
const ClinicPage = lazy(() => import('./pages/clinic/ClinicPage'));
const GuidancePage = lazy(() => import('./pages/guidance/GuidancePage'));
const VisitorsPage = lazy(() => import('./pages/security/VisitorsPage'));
const ClearancePage = lazy(() => import('./pages/services/ClearancePage'));
const LMSPage = lazy(() => import('./pages/lms/LMSPage'));
const AdmissionPage = lazy(() => import('./pages/admission/AdmissionPage'));

// Landing / Public Pages
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const JobApplicationPage = lazy(() => import('./pages/landing/JobApplicationPage'));
const PublicEnrollmentPage = lazy(() => import('./pages/landing/PublicEnrollmentPage'));
const TermsPage = lazy(() => import('./pages/landing/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/landing/PrivacyPage'));

// Loading spinner
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/app/dashboard" replace />;
  return children;
}

// Auth guard (redirect if already logged in)
function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

// Landing guard: if logged in, show dashboard; else show landing page
function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

export default function App() {
  const { getMe } = useAuthStore();

  useEffect(() => {
    getMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }}
      />

      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>}>
        <Routes>
          {/* ── PUBLIC LANDING & APPLICATION ROUTES ── */}
          <Route path="/" element={<LandingRoute />} />
          <Route path="/apply-job" element={<JobApplicationPage />} />
          <Route path="/enroll/new" element={<PublicEnrollmentPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Public Auth Routes */}
          <Route path="/login/staff" element={<AuthRoute><StaffLoginPage /></AuthRoute>} />
          <Route path="/login/student" element={<AuthRoute><StudentLoginPage /></AuthRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Dashboard Routes — same paths as before */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Admin */}
            <Route path="admin/students" element={<StudentsPage />} />
            <Route path="admin/users" element={<UsersPage />} />

            {/* Enrollment */}
            <Route path="enrollment" element={<EnrollmentPage />} />
            <Route path="my-enrollment" element={<EnrollmentPage />} />

            {/* Academics */}
            <Route path="academics/*" element={<AcademicsPage />} />
            <Route path="my-schedule" element={<AcademicsPage />} />
            <Route path="my-classes" element={<AcademicsPage />} />

            {/* Grades */}
            <Route path="grades" element={<GradesPage />} />
            <Route path="my-grades" element={<GradesPage />} />

            {/* Attendance */}
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="my-attendance" element={<AttendancePage />} />

            {/* Financial */}
            <Route path="financial/*" element={<FinancialPage />} />
            <Route path="my-payments" element={<FinancialPage />} />

            {/* Communication */}
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

            {/* Campus */}
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/*" element={<LibraryPage />} />
            <Route path="campus/rooms" element={<RoomsPage />} />

            {/* Reports */}
            <Route path="reports" element={<ReportsPage />} />

            {/* Super Admin */}
            <Route path="super/*" element={<ProtectedRoute roles={['super_admin']}><SuperDashboardPage /></ProtectedRoute>} />

            {/* Profile & Settings */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Parent routes */}
            <Route path="parent/*" element={<DashboardPage />} />

            {/* HR */}
            <Route path="hr" element={<HRPage />} />
            <Route path="hr/*" element={<HRPage />} />

            {/* Guidance / Clinic / Security */}
            <Route path="guidance" element={<GuidancePage />} />
            <Route path="clinic" element={<ClinicPage />} />
            <Route path="visitors" element={<VisitorsPage />} />
            <Route path="incidents" element={<VisitorsPage />} />
            <Route path="security" element={<VisitorsPage />} />
            <Route path="gate-pass" element={<VisitorsPage />} />

            {/* Clearance / Documents / Services */}
            <Route path="clearance" element={<ClearancePage />} />
            <Route path="documents" element={<DashboardPage />} />
            <Route path="organizations" element={<DashboardPage />} />
            <Route path="ojt" element={<DashboardPage />} />
            <Route path="qr-system" element={<DashboardPage />} />

            {/* LMS */}
            <Route path="lms" element={<LMSPage />} />
            <Route path="lms/*" element={<LMSPage />} />

            {/* Admission */}
            <Route path="/admission" element={<AdmissionPage />} />
            <Route path="/admission/*" element={<AdmissionPage />} />
          </Route>

          {/* Top-level fallback: redirect unknown to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
