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
  { section: 'Overview', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reports', icon: BarChart3, label: 'Reports & Analytics' },
  ]},
  { section: 'User Management', items: [
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/roles', icon: Users2, label: 'Role Management' },
    { to: '/admin/permissions', icon: Shield, label: 'Permissions' },
  ]},
  { section: 'Academic', items: [
    { to: '/admin/students', icon: GraduationCap, label: 'Student Management' },
    { to: '/enrollment', icon: ClipboardCheck, label: 'Enrollment' },
    { to: '/academics/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/academics/curriculum', icon: ClipboardList, label: 'Curriculum' },
    { to: '/academics/schedules', icon: Calendar, label: 'Schedules' },
  ]},
  { section: 'Faculty & HR', items: [
    { to: '/hr/teachers', icon: Briefcase, label: 'Teachers' },
    { to: '/hr', icon: Building2, label: 'Staff & HR' },
  ]},
  { section: 'Finance', items: [
    { to: '/financial/fees', icon: DollarSign, label: 'Tuition Fees' },
    { to: '/financial/assessments', icon: DollarSign, label: 'Billing & Assessments' },
    { to: '/financial/payments', icon: CreditCard, label: 'Payments' },
  ]},
  { section: 'Scholarships & Grades', items: [
    { to: '/scholarships', icon: Award, label: 'Scholarships' },
    { to: '/grades', icon: Award, label: 'Grades' },
    { to: '/attendance', icon: UserCheck, label: 'Attendance' },
  ]},
  { section: 'Campus Management', items: [
    { to: '/library', icon: Library, label: 'Library' },
    { to: '/clinic', icon: Stethoscope, label: 'Clinic' },
    { to: '/guidance', icon: HeartHandshake, label: 'Guidance' },
    { to: '/organizations', icon: Users, label: 'Organizations' },
  ]},
  { section: 'Docs & Comms', items: [
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ]},
  { section: 'System Settings', items: [
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/super/audit-logs', icon: Lock, label: 'Audit Logs' },
  ]}
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
              (item.subItems && item.subItems.length > 0) ? (
                <AccordionItem key={idx} item={item} collapsed={collapsed} />
              ) : (
                <NavLink key={item.to || idx} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? item.label : ''}>
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
