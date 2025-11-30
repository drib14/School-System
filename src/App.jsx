import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StorageProvider, useStorage } from './context/StorageContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerificationPage from './pages/auth/VerificationPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import StudentList from './pages/sis/StudentList';
import EnrollmentPage from './pages/enrollment/EnrollmentPage';
import AdmissionsPage from './pages/admissions/AdmissionsPage';
import CoursesPage from './pages/academic/CoursesPage';
import GradesPage from './pages/academic/GradesPage';
import FinancePage from './pages/finance/FinancePage';
import StaffPage from './pages/hr/StaffPage';
import PlaceholderPage from './components/common/PlaceholderPage';

// Public Pages
import LandingPage from './pages/public/LandingPage';

// New Modules
import AttendancePage from './pages/operations/AttendancePage';
import LibraryPage from './pages/operations/LibraryPage';
import ClinicPage from './pages/operations/ClinicPage';
import TransportPage from './pages/operations/TransportPage';
import CanteenPage from './pages/operations/CanteenPage';
import EventsPage from './pages/admin/EventsPage';
import LMSPage from './pages/academic/LMSPage';
import ExamsPage from './pages/academic/ExamsPage';
import SchedulingPage from './pages/academic/SchedulingPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProfilePage from './pages/admin/ProfilePage';
import UserManagementPage from './pages/admin/UserManagementPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { currentUser, getItems, STORAGE_KEYS } = useStorage();
    const location = useLocation();

    if (!currentUser) return <Navigate to="/login" />;

    // Force Enrollment for Students
    if (currentUser.role === 'Student') {
         const enrollments = getItems(STORAGE_KEYS.ENROLLMENTS);
         const isEnrolled = enrollments.some(e => e.studentId === currentUser.id && e.status === 'Active');
         // If pending approval, we can treat as enrolled for now (accessing dashboard),
         // OR restrict access until Active.
         // Requirement: "enrollment must process payment... before being approved"
         // If Pending Approval, maybe they can access dashboard but with limited view?
         // For now, let's allow access if Pending Approval too, so they can see status.
         const isPending = enrollments.some(e => e.studentId === currentUser.id && e.status === 'Pending Approval');

         if (!isEnrolled && !isPending && location.pathname !== '/enrollment') {
             return <Navigate to="/enrollment" />;
         }
    }

    return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerificationPage />} />

      {/* Protected Dashboard Routes */}
      <Route element={
          <ProtectedRoute>
              <DashboardLayout />
          </ProtectedRoute>
      }>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/enrollment" element={<EnrollmentPage />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/staff" element={<StaffPage />} />

          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/clinic" element={<ClinicPage />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/canteen" element={<CanteenPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/lms" element={<LMSPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<UserManagementPage />} />

          <Route path="/reports" element={<PlaceholderPage title="Reports & Analytics" />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <StorageProvider>
      <Router>
        <AppRoutes />
      </Router>
    </StorageProvider>
  )
}

export default App
