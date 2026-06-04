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

const studentNav = [
  { section: 'Overview', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
  ]},
  { section: 'Academics', items: [
    { to: '/enrollment', icon: ClipboardCheck, label: 'Enrollment' },
    { to: '/my-classes', icon: BookOpen, label: 'Classes & Subjects' },
    { to: '/my-schedule', icon: Calendar, label: 'Class Schedule' },
    { to: '/my-grades', icon: Award, label: 'Grades' },
    { to: '/my-attendance', icon: UserCheck, label: 'Attendance' },
    { to: '/lms', icon: MonitorPlay, label: 'LMS & Lessons' },
  ]},
  { section: 'Finance', items: [
    { to: '/my-payments', icon: DollarSign, label: 'Billing & Payments' },
    { to: '/scholarships', icon: Award, label: 'Scholarships' },
  ]},
  { section: 'Campus Life', items: [
    { to: '/qr-system', icon: QrCode, label: 'Digital ID / QR' },
    { to: '/library', icon: Library, label: 'Library' },
    { to: '/organizations', icon: Users, label: 'Organizations' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/clinic', icon: Heart, label: 'Clinic' },
    { to: '/guidance', icon: UserCircle, label: 'Guidance' },
  ]},
  { section: 'Career & Exit', items: [
    { to: '/ojt', icon: Briefcase, label: 'Internship / OJT' },
    { to: '/research', icon: BookOpen, label: 'Research / Thesis' },
    { to: '/clearance', icon: Shield, label: 'Clearance' },
    { to: '/documents', icon: FileText, label: 'Document Requests' },
    { to: '/alumni', icon: GraduationCap, label: 'Alumni' },
  ]},
  { section: 'Communication', items: [
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/announcements', icon: Megaphone, label: 'Announcements' },
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
              user?.role === 'super_admin' ? (
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
