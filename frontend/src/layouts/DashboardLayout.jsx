import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { SocketProvider } from '../context/SocketContext';

const PAGE_TITLES = {

  '/dashboard': 'Dashboard',
  '/admin/students': 'Student Management',
  '/admin/users': 'User Management',
  '/enrollment': 'Enrollment',
  '/grades': 'Grading System',
  '/attendance': 'Attendance',
  '/academics/programs': 'Academic Programs',
  '/academics/subjects': 'Subjects',
  '/academics/curriculum': 'Curriculum',
  '/academics/schedules': 'Class Schedules',
  '/financial/fees': 'Fee Management',
  '/financial/assessments': 'Billing & Assessment',
  '/financial/payments': 'Payments',
  '/financial/summary': 'Financial Reports',
  '/announcements': 'Announcements',
  '/messages': 'Messages',
  '/library': 'Library',
  '/library/books': 'Book Catalog',
  '/library/borrowing': 'Borrowing',
  '/campus/rooms': 'Room Management',
  '/campus/assets': 'Asset Management',
  '/clinic': 'Clinic Management',
  '/guidance': 'Guidance Counseling',
  '/visitors': 'Visitor Management',
  '/incidents': 'Incident Reports',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
  '/profile': 'My Profile',
  '/my-grades': 'My Grades',
  '/my-attendance': 'My Attendance',
  '/my-schedule': 'My Schedule',
  '/my-payments': 'My Payments',
  '/my-enrollment': 'My Enrollment',
  '/qr-system': 'QR System',
  '/documents': 'Documents',
  '/clearance': 'Student Clearance',
  '/super/schools': 'School Management',
  '/super/subscriptions': 'Subscriptions',
  '/super/monitoring': 'System Monitoring',
  '/super/audit-logs': 'Audit Logs',
  '/hr/payroll': 'Payroll',
  '/hr/recruitment': 'Recruitment',
  '/notifications': 'Notifications',
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'ISCP School System';

  useEffect(() => {
    document.title = `${title} | ISCP`;
  }, [title]);

  return (
    <SocketProvider>
      <div className="app-layout">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
        <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
          <Topbar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} title={title} />
          <main className="page-content animate-fade">
            <Outlet />
          </main>
        </div>
      </div>
    </SocketProvider>
  );

}
