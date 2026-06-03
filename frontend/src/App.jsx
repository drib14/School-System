import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
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
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

// Auth guard (redirect if already logged in)
function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
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
          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

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
            <Route path="hr/*" element={<DashboardPage />} />

            {/* Guidance / Clinic */}
            <Route path="guidance" element={<DashboardPage />} />
            <Route path="clinic" element={<DashboardPage />} />
            <Route path="visitors" element={<DashboardPage />} />
            <Route path="incidents" element={<DashboardPage />} />

            {/* Clearance / Documents */}
            <Route path="clearance" element={<DashboardPage />} />
            <Route path="documents" element={<DashboardPage />} />
            <Route path="qr-system" element={<DashboardPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
