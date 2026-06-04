import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, ClipboardList,
  DollarSign, CreditCard, MessageSquare, Bell, Megaphone, Library,
  Building2, Package, Heart, UserCheck, Shield, LogOut, ChevronLeft,
  ChevronRight, Settings, BarChart3, FileText, Award, Briefcase,
  UserCircle, Monitor, QrCode, School, Home, ClipboardCheck, Stethoscope,
  AlertTriangle, TrendingUp, Users2, Globe, Lock, MapPin, MonitorPlay,
  Receipt, HeartHandshake, Building, DoorOpen, AlertCircle
} from 'lucide-react';

const ISCP_LOGO = '/iscp-logo.jpg';

const superAdminNav = [
  { section: 'Dashboard', items: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', subItems: [
      { to: '/dashboard/students', label: 'Total Students' },
      { to: '/dashboard/teachers', label: 'Total Teachers' },
      { to: '/dashboard/staff', label: 'Total Staff' },
      { to: '/dashboard/revenue', label: 'Revenue Summary' },
      { to: '/dashboard/enrollment', label: 'Enrollment Statistics' },
      { to: '/dashboard/attendance', label: 'Attendance Statistics' },
      { to: '/dashboard/activities', label: 'Recent Activities' },
    ]}
  ]},
  { section: 'User Management', items: [
    { label: 'Manage All Users', icon: Users, to: '/admin/users', subItems: [
      { to: '/admin/users/all', label: 'Manage All Users' },
      { to: '/admin/users/create', label: 'Create User' },
      { to: '/admin/users/edit', label: 'Edit User' },
      { to: '/admin/users/deactivate', label: 'Deactivate User' },
      { to: '/admin/users/reset', label: 'Reset Password' },
    ]},
    { label: 'Manage Roles', icon: Users2, to: '/admin/roles', subItems: [
      { to: '/admin/roles/principal', label: 'Principal' },
      { to: '/admin/roles/registrar', label: 'Registrar' },
      { to: '/admin/roles/teacher', label: 'Teacher' },
      { to: '/admin/roles/cashier', label: 'Cashier' },
      { to: '/admin/roles/accountant', label: 'Accountant' },
      { to: '/admin/roles/librarian', label: 'Librarian' },
      { to: '/admin/roles/counselor', label: 'Guidance Counselor' },
      { to: '/admin/roles/hr', label: 'HR' },
      { to: '/admin/roles/parent', label: 'Parent' },
      { to: '/admin/roles/student', label: 'Student' },
    ]},
    { label: 'Permissions', icon: Shield, to: '/admin/permissions', subItems: [
      { to: '/admin/permissions/create', label: 'Create Custom Roles' },
      { to: '/admin/permissions/assign', label: 'Assign Permissions' },
      { to: '/admin/permissions/restrict', label: 'Restrict Access' },
    ]},
  ]},
  { section: 'Student Management', items: [
    { label: 'Students', icon: GraduationCap, to: '/admin/students', subItems: [
      { to: '/admin/students/view', label: 'View All Students' },
      { to: '/admin/students/create', label: 'Create Students' },
      { to: '/admin/students/update', label: 'Update Students' },
      { to: '/admin/students/archive', label: 'Archive Students' },
      { to: '/admin/students/transfer', label: 'Transfer Students' },
      { to: '/admin/students/graduate', label: 'Graduate Students' },
      { to: '/admin/students/reactivate', label: 'Reactivate Students' },
    ]}
  ]},
  { section: 'Enrollment Management', items: [
    { label: 'Enrollments', icon: ClipboardCheck, to: '/enrollment', subItems: [
      { to: '/enrollment/open', label: 'Open Enrollment' },
      { to: '/enrollment/close', label: 'Close Enrollment' },
      { to: '/enrollment/approve', label: 'Approve Enrollments' },
      { to: '/enrollment/reject', label: 'Reject Enrollments' },
      { to: '/enrollment/requirements', label: 'Configure Enrollment Requirements' },
      { to: '/enrollment/process', label: 'Configure Enrollment Process' },
    ]}
  ]},
  { section: 'Academic Management', items: [
    { label: 'Subjects', icon: BookOpen, to: '/academics/subjects', subItems: [
      { to: '/academics/subjects/create', label: 'Create Subjects' },
      { to: '/academics/subjects/edit', label: 'Edit Subjects' },
      { to: '/academics/subjects/archive', label: 'Archive Subjects' },
    ]},
    { label: 'Curriculum', icon: ClipboardList, to: '/academics/curriculum', subItems: [
      { to: '/academics/curriculum/create', label: 'Create Curriculum' },
      { to: '/academics/curriculum/update', label: 'Update Curriculum' },
      { to: '/academics/curriculum/assign', label: 'Assign Curriculum' },
    ]},
    { label: 'Scheduling', icon: Calendar, to: '/academics/schedules', subItems: [
      { to: '/academics/schedules/generate', label: 'Generate Schedules' },
      { to: '/academics/schedules/assign-teachers', label: 'Assign Teachers' },
      { to: '/academics/schedules/assign-rooms', label: 'Assign Rooms' },
    ]},
  ]},
  { section: 'Faculty & HR', items: [
    { label: 'Teachers', icon: Briefcase, to: '/hr/teachers', subItems: [
      { to: '/hr/teachers/add', label: 'Add Teachers' },
      { to: '/hr/teachers/assign-subjects', label: 'Assign Subjects' },
      { to: '/hr/teachers/assign-classes', label: 'Assign Classes' },
      { to: '/hr/teachers/monitor', label: 'Monitor Performance' },
    ]},
    { label: 'Staff', icon: Building2, to: '/hr', subItems: [
      { to: '/hr/staff/add', label: 'Add Staff' },
      { to: '/hr/staff/update', label: 'Update Staff' },
      { to: '/hr/staff/remove', label: 'Remove Staff' },
    ]},
  ]},
  { section: 'Finance Management', items: [
    { label: 'Tuition Management', icon: DollarSign, to: '/financial/fees', subItems: [
      { to: '/financial/fees/tuition', label: 'Set Tuition Fees' },
      { to: '/financial/fees/misc', label: 'Set Miscellaneous Fees' },
      { to: '/financial/fees/discounts', label: 'Set Discounts' },
    ]},
    { label: 'Billing', icon: Receipt, to: '/financial/assessments', subItems: [
      { to: '/financial/assessments/generate', label: 'Generate Assessments' },
      { to: '/financial/assessments/bills', label: 'Generate Bills' },
      { to: '/financial/assessments/balances', label: 'Manage Balances' },
    ]},
    { label: 'Payments', icon: CreditCard, to: '/financial/payments', subItems: [
      { to: '/financial/payments/verify', label: 'Verify Payments' },
      { to: '/financial/payments/approve', label: 'Approve Payments' },
      { to: '/financial/payments/refund', label: 'Refund Payments' },
    ]},
  ]},
  { section: 'Scholarship Management', items: [
    { label: 'Scholarships', icon: Award, to: '/scholarships', subItems: [
      { to: '/scholarships/create', label: 'Create Scholarships' },
      { to: '/scholarships/requirements', label: 'Configure Requirements' },
      { to: '/scholarships/approve', label: 'Approve Scholars' },
      { to: '/scholarships/monitor', label: 'Monitor Scholars' },
    ]}
  ]},
  { section: 'Grade & Attendance', items: [
    { label: 'Grade Management', icon: Award, to: '/grades', subItems: [
      { to: '/grades/view', label: 'View All Grades' },
      { to: '/grades/lock', label: 'Lock Grades' },
      { to: '/grades/unlock', label: 'Unlock Grades' },
      { to: '/grades/approve', label: 'Approve Grades' },
      { to: '/grades/report-cards', label: 'Generate Report Cards' },
    ]},
    { label: 'Attendance Management', icon: UserCheck, to: '/attendance', subItems: [
      { to: '/attendance/view', label: 'View Attendance' },
      { to: '/attendance/correct', label: 'Correct Attendance' },
      { to: '/attendance/rules', label: 'Configure Attendance Rules' },
    ]},
  ]},
  { section: 'Campus Management', items: [
    { label: 'Library Management', icon: Library, to: '/library', subItems: [
      { to: '/library/books', label: 'Manage Books' },
      { to: '/library/borrowing', label: 'Manage Borrowing' },
      { to: '/library/fines', label: 'Manage Fines' },
    ]},
    { label: 'Clinic Management', icon: Stethoscope, to: '/clinic', subItems: [
      { to: '/clinic/records', label: 'View Medical Records' },
      { to: '/clinic/visits', label: 'Manage Clinic Visits' },
    ]},
    { label: 'Guidance Management', icon: HeartHandshake, to: '/guidance', subItems: [
      { to: '/guidance/cases', label: 'View Cases' },
      { to: '/guidance/records', label: 'Manage Counseling Records' },
    ]},
    { label: 'Student Organizations', icon: Users, to: '/organizations', subItems: [
      { to: '/organizations/create', label: 'Create Organizations' },
      { to: '/organizations/officers', label: 'Manage Officers' },
      { to: '/organizations/activities', label: 'Approve Activities' },
    ]},
  ]},
  { section: 'Docs & Comms', items: [
    { label: 'Document Management', icon: FileText, to: '/documents', subItems: [
      { to: '/documents/generate', label: 'Generate Documents' },
      { to: '/documents/tor', label: 'Transcript of Records' },
      { to: '/documents/certificates', label: 'Certificates' },
      { to: '/documents/report-cards', label: 'Report Cards' },
      { to: '/documents/enrollment-cert', label: 'Enrollment Certificates' },
      { to: '/documents/good-moral', label: 'Good Moral Certificates' },
    ]},
    { label: 'Announcements', icon: Megaphone, to: '/announcements', subItems: [
      { to: '/announcements/create', label: 'Create Announcements' },
      { to: '/announcements/schedule', label: 'Schedule Announcements' },
    ]},
    { label: 'Messaging', icon: MessageSquare, to: '/messages', subItems: [
      { to: '/messages/send', label: 'Send Messages' },
      { to: '/messages/broadcast', label: 'Broadcast Messages' },
    ]},
    { label: 'Notifications', icon: Bell, to: '/notifications', subItems: [
      { to: '/notifications/push', label: 'Push Notifications' },
      { to: '/notifications/email', label: 'Email Notifications' },
      { to: '/notifications/sms', label: 'SMS Notifications' },
    ]},
  ]},
  { section: 'Reports & Analytics', items: [
    { label: 'Reports', icon: BarChart3, to: '/reports', subItems: [
      { to: '/reports/student', label: 'Student Reports' },
      { to: '/reports/enrollment', label: 'Enrollment Reports' },
      { to: '/reports/performance', label: 'Performance Reports' },
      { to: '/reports/attendance', label: 'Attendance Reports' },
      { to: '/reports/financial', label: 'Financial Reports' },
      { to: '/reports/revenue', label: 'Revenue Reports' },
      { to: '/reports/payment', label: 'Payment Reports' },
      { to: '/reports/hr', label: 'HR Reports' },
      { to: '/reports/employee', label: 'Employee Reports' },
    ]},
  ]},
  { section: 'Settings', items: [
    { label: 'School Settings', icon: Building, to: '/settings/school', subItems: [
      { to: '/settings/school/info', label: 'School Information' },
      { to: '/settings/school/name', label: 'School Name' },
      { to: '/settings/school/logo', label: 'Logo' },
      { to: '/settings/school/contact', label: 'Contact Information' },
    ]},
    { label: 'Academic Settings', icon: BookOpen, to: '/settings/academic', subItems: [
      { to: '/settings/academic/year', label: 'Academic Year' },
      { to: '/settings/academic/semesters', label: 'Semesters' },
      { to: '/settings/academic/grading', label: 'Grading System' },
    ]},
    { label: 'System Settings', icon: Monitor, to: '/settings/system', subItems: [
      { to: '/settings/system/security', label: 'Security Settings' },
      { to: '/settings/system/passwords', label: 'Password Policies' },
      { to: '/settings/system/login', label: 'Login Policies' },
    ]},
    { label: 'Audit Logs', icon: Lock, to: '/super/audit-logs', subItems: [
      { to: '/super/audit-logs/all', label: 'View All Activities' },
      { to: '/super/audit-logs/track', label: 'Track User Actions' },
      { to: '/super/audit-logs/history', label: 'Monitor Login History' },
    ]},
  ]},
];


];

const studentNav = [
  { section: 'Overview', items: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', subItems: [
      { to: '/dashboard', label: 'Student Dashboard' }
    ]},
    { label: 'Profile', icon: UserCircle, to: '/student/profile', subItems: [
      { to: '/student/profile/view', label: 'View Profile' },
      { to: '/student/profile/edit', label: 'Update Contact Info' },
      { to: '/student/profile/security', label: 'Change Password' },
      { to: '/student/profile/avatar', label: 'Upload Profile Pic' },
      { to: '/student/profile/parent', label: 'Parent Info' },
    ]},
  ]},
  { section: 'Academic Life', items: [
    { label: 'Enrollment', icon: ClipboardCheck, to: '/student/enrollment', subItems: [
      { to: '/student/enrollment/apply', label: 'Submit Enrollment' },
      { to: '/student/enrollment/re-enroll', label: 'Re-enroll' },
      { to: '/student/enrollment/requirements', label: 'Upload Requirements' },
      { to: '/student/enrollment/status', label: 'Track Status' },
      { to: '/student/enrollment/history', label: 'Enrollment History' },
    ]},
    { label: 'Academics', icon: BookOpen, to: '/student/academics', subItems: [
      { to: '/student/academics/subjects', label: 'View Subjects' },
      { to: '/student/academics/curriculum', label: 'View Curriculum' },
      { to: '/student/academics/prerequisites', label: 'View Prerequisites' },
      { to: '/student/academics/progress', label: 'Academic Progress' },
    ]},
    { label: 'Class Schedule', icon: Calendar, to: '/student/schedule', subItems: [
      { to: '/student/schedule/view', label: 'View Schedule' },
      { to: '/student/schedule/download', label: 'Download Schedule' },
      { to: '/student/schedule/classrooms', label: 'Classroom Assignments' },
      { to: '/student/schedule/teachers', label: 'Teacher Assignments' },
    ]},
    { label: 'LMS', icon: MonitorPlay, to: '/student/lms', subItems: [
      { to: '/student/lms/lessons', label: 'View Lessons' },
      { to: '/student/lms/videos', label: 'Watch Videos' },
      { to: '/student/lms/materials', label: 'Download Materials' },
      { to: '/student/lms/assignments', label: 'Submit Assignments' },
      { to: '/student/lms/quizzes', label: 'Take Quizzes' },
      { to: '/student/lms/discussions', label: 'Join Discussions' },
    ]},
    { label: 'Grades & Attendance', icon: Award, to: '/student/grades-attendance', subItems: [
      { to: '/student/grades/view', label: 'View Grades' },
      { to: '/student/grades/gpa', label: 'View GPA' },
      { to: '/student/grades/standing', label: 'Academic Standing' },
      { to: '/student/grades/report-card', label: 'Download Report Card' },
      { to: '/student/attendance/view', label: 'View Attendance' },
      { to: '/student/attendance/absences', label: 'View Absences' },
      { to: '/student/attendance/excuses', label: 'Submit Excuse Letter' },
    ]},
  ]},
  { section: 'Finance & Payments', items: [
    { label: 'Billing & Finance', icon: DollarSign, to: '/student/billing', subItems: [
      { to: '/student/billing/assessment', label: 'View Assessment' },
      { to: '/student/billing/breakdown', label: 'Tuition Breakdown' },
      { to: '/student/billing/balance', label: 'View Balance' },
      { to: '/student/billing/history', label: 'Payment History' },
    ]},
    { label: 'Payments', icon: CreditCard, to: '/student/payments', subItems: [
      { to: '/student/payments/pay', label: 'Pay Online' },
      { to: '/student/payments/upload', label: 'Upload Proof' },
      { to: '/student/payments/receipts', label: 'Download Receipts' },
    ]},
    { label: 'Scholarships', icon: Award, to: '/student/scholarships', subItems: [
      { to: '/student/scholarships/apply', label: 'Apply Scholarship' },
      { to: '/student/scholarships/upload', label: 'Upload Requirements' },
      { to: '/student/scholarships/status', label: 'View Status' },
      { to: '/student/scholarships/renewal', label: 'Renewal Rules' },
    ]},
  ]},
  { section: 'Campus & Services', items: [
    { label: 'Library', icon: Library, to: '/student/library', subItems: [
      { to: '/student/library/search', label: 'Search Books' },
      { to: '/student/library/reserve', label: 'Reserve Books' },
      { to: '/student/library/borrowed', label: 'Borrowed Books' },
      { to: '/student/library/due-dates', label: 'Due Dates' },
      { to: '/student/library/fines', label: 'View Fines' },
    ]},
    { label: 'Clinic & Guidance', icon: Heart, to: '/student/health-guidance', subItems: [
      { to: '/student/clinic/records', label: 'View Health Records' },
      { to: '/student/clinic/appointment', label: 'Request Medical Appt' },
      { to: '/student/guidance/request', label: 'Request Counseling' },
      { to: '/student/guidance/appointment', label: 'Schedule Appointment' },
      { to: '/student/guidance/status', label: 'Appointment Status' },
    ]},
    { label: 'Orgs & Events', icon: Users2, to: '/student/orgs-events', subItems: [
      { to: '/student/orgs/join', label: 'Join Organizations' },
      { to: '/student/orgs/memberships', label: 'View Memberships' },
      { to: '/student/orgs/activities', label: 'Register for Activities' },
      { to: '/student/events/register', label: 'Register for Events' },
      { to: '/student/events/schedule', label: 'Event Schedule' },
      { to: '/student/events/passes', label: 'Download Event Passes' },
    ]},
    { label: 'Student ID', icon: QrCode, to: '/student/id', subItems: [
      { to: '/student/id/digital', label: 'View Digital ID' },
      { to: '/student/id/download', label: 'Download Digital ID' },
      { to: '/student/id/request', label: 'Request Replacement' },
      { to: '/student/qr/attendance', label: 'QR Attendance Check-In' },
      { to: '/student/qr/campus', label: 'QR Campus Access' },
    ]},
  ]},
  { section: 'Academic Pathways', items: [
    { label: 'Internship / OJT', icon: Briefcase, to: '/student/ojt', subItems: [
      { to: '/student/ojt/requirements', label: 'Submit Requirements' },
      { to: '/student/ojt/hours', label: 'Log Hours' },
      { to: '/student/ojt/reports', label: 'Upload Reports' },
      { to: '/student/ojt/progress', label: 'Track Progress' },
    ]},
    { label: 'Research / Thesis', icon: FileText, to: '/student/thesis', subItems: [
      { to: '/student/thesis/proposal', label: 'Submit Proposal' },
      { to: '/student/thesis/upload', label: 'Upload Documents' },
      { to: '/student/thesis/feedback', label: 'View Adviser Feedback' },
      { to: '/student/thesis/defense', label: 'View Defense Schedule' },
    ]},
    { label: 'Clearance & Docs', icon: ClipboardList, to: '/student/clearance-docs', subItems: [
      { to: '/student/clearance/status', label: 'View Clearance Status' },
      { to: '/student/clearance/request', label: 'Submit Clearance Request' },
      { to: '/student/clearance/track', label: 'Track Approval Status' },
      { to: '/student/docs/request', label: 'Request Documents (TOR/Cert)' },
      { to: '/student/docs/track', label: 'Track Document Requests' },
    ]},
    { label: 'Alumni', icon: Globe, to: '/student/alumni', subItems: [
      { to: '/student/alumni/update', label: 'Update Alumni Info' },
      { to: '/student/alumni/register', label: 'Register as Alumni' },
      { to: '/student/alumni/events', label: 'Join Alumni Events' },
    ]},
  ]},
  { section: 'Docs & Comms', items: [
    { label: 'Messaging', icon: MessageSquare, to: '/student/messages', subItems: [
      { to: '/student/messages/teachers', label: 'Message Teachers' },
      { to: '/student/messages/classmates', label: 'Message Classmates' },
      { to: '/student/messages/inbox', label: 'Inbox / Send Message' },
    ]},
    { label: 'Announcements', icon: Megaphone, to: '/student/announcements', subItems: [
      { to: '/student/announcements/school', label: 'School Announcements' },
      { to: '/student/announcements/department', label: 'Dept Announcements' },
      { to: '/student/announcements/class', label: 'Class Announcements' },
    ]},
    { label: 'Notifications', icon: Bell, to: '/student/notifications', subItems: [
      { to: '/student/notifications/all', label: 'View Notifications' },
    ]},
  ]},
];

const fullAdminNav = [
  { section: 'Overview', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reports', icon: BarChart3, label: 'Reports & Analytics' },
  ]},
  { section: 'Academic', items: [
    { to: '/admin/students', icon: GraduationCap, label: 'Students' },
    { to: '/academics/programs', icon: BookOpen, label: 'Programs' },
    { to: '/academics/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/academics/curriculum', icon: ClipboardList, label: 'Curriculum' },
    { to: '/academics/schedules', icon: Calendar, label: 'Schedules' },
    { to: '/enrollment', icon: ClipboardCheck, label: 'Enrollment' },
    { to: '/grades', icon: Award, label: 'Grades' },
    { to: '/attendance', icon: UserCheck, label: 'Attendance' },
  ]},
  { section: 'Financial', items: [
    { to: '/financial/fees', icon: DollarSign, label: 'Fees' },
    { to: '/financial/assessments', icon: DollarSign, label: 'Assessments' },
    { to: '/financial/payments', icon: CreditCard, label: 'Payments' },
    { to: '/financial/summary', icon: BarChart3, label: 'Financial Report' },
  ]},
  { section: 'Faculty & HR', items: [
    { to: '/admin/users', icon: Users, label: 'Faculty & Staff' },
    { to: '/hr/payroll', icon: DollarSign, label: 'Payroll' },
  ]},
  { section: 'Campus', items: [
    { to: '/library', icon: Library, label: 'Library' },
    { to: '/campus/rooms', icon: Building2, label: 'Rooms' },
    { to: '/campus/assets', icon: Package, label: 'Assets' },
    { to: '/clinic', icon: Heart, label: 'Clinic' },
    { to: '/guidance', icon: UserCircle, label: 'Guidance' },
    { to: '/visitors', icon: Shield, label: 'Visitors' },
    { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  ]},
  { section: 'Communication', items: [
    { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
  ]},
  { section: 'Tools', items: [
    { to: '/qr-system', icon: QrCode, label: 'QR System' },
    { to: '/documents', icon: FileText, label: 'Documents' },
  ]},
];

const navConfig = {
  super_admin: superAdminNav,
  principal: fullAdminNav,
  registrar: fullAdminNav,
  school_owner: fullAdminNav,
  student: studentNav,
  hr: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'HR Operations', items: [
      { to: '/admin/users', icon: Users, label: 'Employees' },
      { to: '/hr', icon: Briefcase, label: 'Recruitment & Records' },
      { to: '/hr/payroll', icon: DollarSign, label: 'Payroll' },
    ]},
  ],
  default: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
  ]
};

const AccordionItem = ({ item, collapsed }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  
  const isActive = location.pathname.startsWith(item.to);
  
  useEffect(() => {
    if (isActive && !collapsed) {
      setOpen(true);
    }
  }, [isActive, collapsed]);

  if (!hasSubItems) {
    return (
      <NavLink to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? item.label : ''}>
        <item.icon className="nav-icon" size={18} />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div className="nav-accordion" style={{ marginBottom: 4 }}>
      <div className={`nav-item ${open || isActive ? 'active' : ''}`} onClick={() => setOpen(!open)} title={collapsed ? item.label : ''} style={{ cursor: 'pointer', background: open ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
        <item.icon className="nav-icon" size={18} />
        <span>{item.label}</span>
        {!collapsed && <ChevronRight size={16} style={{ marginLeft: 'auto', transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s', color: 'var(--text-muted)' }} />}
      </div>
      {!collapsed && open && (
        <div className="nav-subitems" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0 4px 12px', borderLeft: '1px solid rgba(255,255,255,0.05)', marginLeft: 20 }}>
          {item.subItems.map(sub => (
            <NavLink key={sub.to} to={sub.to} className={({ isActive }) => `nav-item sub-item ${isActive ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 13, background: 'transparent' }}>
              <span>{sub.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};


export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore();
  const navSections = navConfig[user?.role] || navConfig.default;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div className="sidebar-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-card)' }}>
        <img src={ISCP_LOGO} alt="ISCP" className="sidebar-logo" style={{ borderRadius: '50%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
        <div className="sidebar-brand">
          <div className="sidebar-brand-name" style={{ fontSize: 13, lineHeight: 1.2 }}>International State Colleges of the PH</div>
          <div className="sidebar-brand-sub">ISCP Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" style={{ paddingBottom: 24 }}>
        {navSections.map((section, si) => (
          <div key={si}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item, idx) => (
              item.subItems && item.subItems.length > 0 ? (
                <AccordionItem key={idx} item={item} collapsed={collapsed} />
              ) : (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? item.label : ''}>
                  <item.icon className="nav-icon" size={18} />
                  <span>{item.label}</span>
                </NavLink>
              )
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0, background: 'var(--bg-card)', zIndex: 10 }}>
        <NavLink to="/settings" className="nav-item" title={collapsed ? 'Settings' : ''}>
          <Settings size={18} className="nav-icon" />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginTop: 2 }} title={collapsed ? 'Logout' : ''}>
          <LogOut size={18} className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
