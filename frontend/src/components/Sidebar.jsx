import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, ClipboardList,
  DollarSign, CreditCard, MessageSquare, Bell, Megaphone, Library,
  Building2, Package, Heart, UserCheck, Shield, LogOut, ChevronLeft,
  ChevronRight, Settings, BarChart3, FileText, Award, Briefcase,
  UserCircle, Monitor, QrCode, School, Home, ClipboardCheck, Stethoscope,
  AlertTriangle, TrendingUp, Users2, Globe, Lock
} from 'lucide-react';

const ISCP_LOGO = '/iscp-logo.jpg';

const navConfig = {
  super_admin: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/super/schools', icon: School, label: 'Schools' },
      { to: '/super/subscriptions', icon: Globe, label: 'Subscriptions' },
      { to: '/super/monitoring', icon: Monitor, label: 'Monitoring' },
      { to: '/super/audit-logs', icon: Lock, label: 'Audit Logs' },
    ]},
    { section: 'Management', items: [
      { to: '/admin/users', icon: Users, label: 'All Users' },
      { to: '/admin/students', icon: GraduationCap, label: 'Students' },
      { to: '/reports', icon: BarChart3, label: 'Analytics' },
    ]},
  ],
  principal: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/reports', icon: BarChart3, label: 'Reports & Analytics' },
    ]},
    { section: 'Academic', items: [
      { to: '/admin/students', icon: GraduationCap, label: 'Students' },
      { to: '/admin/users', icon: Users, label: 'Faculty & Staff' },
      { to: '/academics/programs', icon: BookOpen, label: 'Programs' },
      { to: '/academics/curriculum', icon: ClipboardList, label: 'Curriculum' },
      { to: '/academics/subjects', icon: BookOpen, label: 'Subjects' },
      { to: '/academics/schedules', icon: Calendar, label: 'Schedules' },
      { to: '/enrollment', icon: ClipboardCheck, label: 'Enrollment' },
      { to: '/grades', icon: Award, label: 'Grades' },
      { to: '/attendance', icon: UserCheck, label: 'Attendance' },
    ]},
    { section: 'Communication', items: [
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/messages', icon: MessageSquare, label: 'Messages' },
    ]},
  ],
  registrar: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Enrollment', items: [
      { to: '/enrollment', icon: ClipboardCheck, label: 'Enrollment' },
      { to: '/admin/students', icon: GraduationCap, label: 'Students' },
      { to: '/academics/programs', icon: BookOpen, label: 'Programs' },
      { to: '/academics/curriculum', icon: ClipboardList, label: 'Curriculum' },
      { to: '/academics/subjects', icon: BookOpen, label: 'Subjects' },
      { to: '/academics/schedules', icon: Calendar, label: 'Class Schedules' },
    ]},
    { section: 'Records', items: [
      { to: '/grades', icon: Award, label: 'Grades' },
      { to: '/attendance', icon: UserCheck, label: 'Attendance' },
      { to: '/documents', icon: FileText, label: 'Documents' },
    ]},
    { section: 'Communication', items: [
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/messages', icon: MessageSquare, label: 'Messages' },
    ]},
  ],
  teacher: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Academic', items: [
      { to: '/my-classes', icon: Calendar, label: 'My Classes' },
      { to: '/grades', icon: Award, label: 'Grades' },
      { to: '/attendance', icon: UserCheck, label: 'Attendance' },
    ]},
    { section: 'Communication', items: [
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/messages', icon: MessageSquare, label: 'Messages' },
    ]},
  ],
  student: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Academic', items: [
      { to: '/my-enrollment', icon: ClipboardCheck, label: 'My Enrollment' },
      { to: '/my-grades', icon: Award, label: 'My Grades' },
      { to: '/my-attendance', icon: UserCheck, label: 'My Attendance' },
      { to: '/my-schedule', icon: Calendar, label: 'My Schedule' },
    ]},
    { section: 'Payments', items: [
      { to: '/my-payments', icon: CreditCard, label: 'My Payments' },
    ]},
    { section: 'Communication', items: [
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/messages', icon: MessageSquare, label: 'Messages' },
    ]},
    { section: 'Services', items: [
      { to: '/library', icon: Library, label: 'Library' },
      { to: '/clearance', icon: ClipboardCheck, label: 'Clearance' },
    ]},
  ],
  parent: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'My Children', items: [
      { to: '/parent/grades', icon: Award, label: 'Grades' },
      { to: '/parent/attendance', icon: UserCheck, label: 'Attendance' },
      { to: '/parent/schedule', icon: Calendar, label: 'Schedule' },
      { to: '/parent/payments', icon: CreditCard, label: 'Payments' },
    ]},
    { section: 'Communication', items: [
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/messages', icon: MessageSquare, label: 'Messages' },
    ]},
  ],
  cashier: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Financial', items: [
      { to: '/financial/payments', icon: CreditCard, label: 'Payments' },
      { to: '/financial/assessments', icon: DollarSign, label: 'Assessments' },
      { to: '/financial/fees', icon: DollarSign, label: 'Fee Management' },
      { to: '/financial/summary', icon: BarChart3, label: 'Financial Summary' },
    ]},
  ],
  accountant: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Financial', items: [
      { to: '/financial/payments', icon: CreditCard, label: 'Payments' },
      { to: '/financial/assessments', icon: DollarSign, label: 'Assessments' },
      { to: '/financial/fees', icon: DollarSign, label: 'Fees' },
      { to: '/financial/summary', icon: BarChart3, label: 'Reports' },
    ]},
  ],
  librarian: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Library', items: [
      { to: '/library/books', icon: Library, label: 'Book Catalog' },
      { to: '/library/borrowing', icon: BookOpen, label: 'Borrowing' },
      { to: '/library/returns', icon: ClipboardCheck, label: 'Returns' },
    ]},
  ],
  nurse: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Health', items: [
      { to: '/clinic/records', icon: Heart, label: 'Health Records' },
      { to: '/clinic/visits', icon: Stethoscope, label: 'Clinic Visits' },
    ]},
  ],
  guidance_counselor: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Guidance', items: [
      { to: '/guidance/cases', icon: UserCircle, label: 'Student Cases' },
      { to: '/guidance/sessions', icon: MessageSquare, label: 'Counseling' },
    ]},
  ],
  hr_staff: [
    { section: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'HR', items: [
      { to: '/admin/users', icon: Users, label: 'Employees' },
      { to: '/hr/recruitment', icon: Briefcase, label: 'Recruitment' },
      { to: '/hr/payroll', icon: DollarSign, label: 'Payroll' },
      { to: '/hr/evaluation', icon: BarChart3, label: 'Evaluation' },
    ]},
  ],
};

// Full admin nav (shared by principal, school_owner)
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

navConfig.school_owner = fullAdminNav;

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navSections = navConfig[user?.role] || navConfig.registrar;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <img src={ISCP_LOGO} alt="ISCP" className="sidebar-logo" onError={e => { e.target.style.display='none'; }} />
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">ISCP</div>
          <div className="sidebar-brand-sub">School Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section, si) => (
          <div key={si}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <item.icon className="nav-icon" size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <NavLink to="/settings" className="nav-item" title={collapsed ? 'Settings' : ''}>
          <Settings size={18} className="nav-icon" />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginTop: 2 }} title={collapsed ? 'Logout' : ''}>
          <LogOut size={18} className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', top: '50%', right: '-12px', transform: 'translateY(-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--primary)', border: '2px solid var(--bg-primary)',
          color: 'white', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 101,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
