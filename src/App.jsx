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
import AboutPage from './pages/public/AboutPage';
import AdmissionsInfoPage from './pages/public/AdmissionsInfoPage';
import ProgramsPage from './pages/public/ProgramsPage';
import ContactPage from './pages/public/ContactPage';

// --- NEW MODULES ---
// Student
import StudentSchedule from './pages/student/StudentSchedule';
import StudentLMS from './pages/student/StudentLMS';
import StudentExams from './pages/student/StudentExams';
import StudentRequests from './pages/student/StudentRequests';
import StudentOrgs from './pages/student/StudentOrgs';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentHelp from './pages/student/StudentHelp';

// Teacher
import ClassManagement from './pages/teacher/ClassManagement';
import TeacherSchedule from './pages/teacher/TeacherSchedule';
import TeacherGradebook from './pages/teacher/TeacherGradebook';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherLMS from './pages/teacher/TeacherLMS';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherDocs from './pages/teacher/TeacherDocs';
import TeacherCommunication from './pages/teacher/TeacherCommunication';
import TeacherSupport from './pages/teacher/TeacherSupport';

// Admin Modules
import EnrollmentAdmin from './pages/admin-modules/EnrollmentAdmin';
import AcademicManagement from './pages/admin-modules/AcademicManagement';
import SchedulingAdmin from './pages/admin-modules/SchedulingAdmin';
import GradesAdmin from './pages/admin-modules/GradesAdmin';
import AttendanceAdmin from './pages/admin-modules/AttendanceAdmin';
import TeacherLoad from './pages/admin-modules/TeacherLoad';
import ExamsAdmin from './pages/admin-modules/ExamsAdmin';
import HRManagement from './pages/admin-modules/HRManagement';
import FinanceAdmin from './pages/admin-modules/FinanceAdmin';
import LibraryAdmin from './pages/admin-modules/LibraryAdmin';
import Clinic from './pages/admin-modules/Clinic';
import Transport from './pages/admin-modules/Transport';
import Canteen from './pages/admin-modules/Canteen';
import EventsAdmin from './pages/admin-modules/EventsAdmin';
import CommunicationAdmin from './pages/admin-modules/CommunicationAdmin';
import SystemAdmin from './pages/admin-modules/SystemAdmin';

// Existing Admin Pages that might need mapping or are redundant with new modules
import SettingsPage from './pages/admin/SettingsPage';
import ProfilePage from './pages/admin/ProfilePage';
import UserManagementPage from './pages/admin/UserManagementPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useStorage();
    if (!currentUser) return <Navigate to="/login" />;
    return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/admissions-info" element={<AdmissionsInfoPage />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/contact" element={<ContactPage />} />
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

          {/* Common */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Student Panel Routes */}
          <Route path="/student/schedule" element={<StudentSchedule />} />
          <Route path="/student/lms" element={<StudentLMS />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/enrollment" element={<EnrollmentPage />} />
          <Route path="/student/grades" element={<GradesPage />} />
          <Route path="/student/finance" element={<FinancePage />} />
          <Route path="/student/requests" element={<StudentRequests />} />
          <Route path="/student/orgs" element={<StudentOrgs />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/help" element={<StudentHelp />} />

          {/* Teacher Panel Routes */}
          <Route path="/teacher/classes" element={<ClassManagement />} />
          <Route path="/teacher/schedule" element={<TeacherSchedule />} />
          <Route path="/teacher/gradebook" element={<TeacherGradebook />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/lms" element={<TeacherLMS />} />
          <Route path="/teacher/exams" element={<TeacherExams />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="/teacher/documents" element={<TeacherDocs />} />
          <Route path="/teacher/communication" element={<TeacherCommunication />} />
          <Route path="/teacher/support" element={<TeacherSupport />} />

          {/* Admin Routes - Standard Modules */}
          <Route path="/admin/enrollment" element={<EnrollmentAdmin />} />
          <Route path="/admin/students" element={<StudentList />} /> {/* Using existing polished list */}
          <Route path="/admin/academic" element={<AcademicManagement />} />
          <Route path="/admin/scheduling" element={<SchedulingAdmin />} />
          <Route path="/admin/grades" element={<GradesAdmin />} />
          <Route path="/admin/attendance" element={<AttendanceAdmin />} />
          <Route path="/admin/teacher-load" element={<TeacherLoad />} />
          <Route path="/admin/exams" element={<ExamsAdmin />} />
          <Route path="/admin/hr" element={<HRManagement />} />
          <Route path="/admin/finance" element={<FinanceAdmin />} />
          <Route path="/admin/library" element={<LibraryAdmin />} />
          <Route path="/admin/clinic" element={<Clinic />} />
          <Route path="/admin/transport" element={<Transport />} />
          <Route path="/admin/canteen" element={<Canteen />} />
          <Route path="/admin/events" element={<EventsAdmin />} />
          <Route path="/admin/communication" element={<CommunicationAdmin />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/system" element={<SystemAdmin />} />

          {/* Legacy/Other Routes (keeping for compatibility if needed, or mapping them) */}
          <Route path="/enrollment" element={<EnrollmentPage />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/staff" element={<StaffPage />} />

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
