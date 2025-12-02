import React from 'react';
import { Nav, Accordion } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome, FiUsers, FiBookOpen, FiCalendar, FiDollarSign, FiSettings,
    FiFileText, FiCheckSquare, FiClipboard, FiClock, FiActivity, FiTruck,
    FiCoffee, FiAward, FiMessageSquare, FiGrid, FiUser, FiHelpCircle, FiBell,
    FiBriefcase, FiLayers, FiMonitor
} from 'react-icons/fi';
import { useStorage } from '../../context/StorageContext';
import logo from '../../assets/img/logo.png';

const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const { currentUser, logout } = useStorage();
    const role = currentUser?.role || 'Guest';

    const isActive = (path) => location.pathname === path;

    const renderLink = (to, icon, label) => (
        <Nav.Link
            as={Link}
            to={to}
            className={`d-flex align-items-center px-3 py-2 text-decoration-none ${isActive(to) ? 'bg-primary text-white' : 'text-dark'}`}
            style={{
                borderRadius: '8px',
                marginBottom: '4px',
                transition: 'all 0.2s',
                backgroundColor: isActive(to) ? 'var(--bs-primary)' : 'transparent',
                color: isActive(to) ? '#fff' : 'inherit'
            }}
        >
            <span style={{ fontSize: '1.2rem', marginRight: '12px' }}>{icon}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{label}</span>
        </Nav.Link>
    );

    const renderSectionHeader = (title) => (
        <div className="px-3 py-2 mt-3 mb-1 text-uppercase text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            {title}
        </div>
    );

    return (
        <div
            className={`bg-white shadow-sm border-end h-100 d-flex flex-column ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
            style={{
                width: isOpen ? '260px' : '0',
                minWidth: isOpen ? '260px' : '0',
                transition: 'width 0.3s ease',
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'fixed',
                zIndex: 1000,
                top: '60px', // Below topbar
                bottom: 0
            }}
        >
            <div className="flex-grow-1 py-3">
                <Nav className="flex-column px-2">
                    {renderLink('/dashboard', <FiHome />, 'Dashboard')}

                    {/* --- STUDENT MENU --- */}
                    {role === 'Student' && (
                        <>
                            {renderSectionHeader('Academic')}
                            {renderLink('/student/schedule', <FiCalendar />, 'My Schedule')}
                            {renderLink('/student/lms', <FiBookOpen />, 'LMS / Classes')}
                            {renderLink('/student/exams', <FiFileText />, 'Exams & Results')}
                            {renderLink('/student/grades', <FiActivity />, 'Grades & Report Card')}

                            {renderSectionHeader('Administrative')}
                            {renderLink('/student/enrollment', <FiCheckSquare />, 'Enrollment')}
                            {renderLink('/student/finance', <FiDollarSign />, 'Financials / Fees')}
                            {renderLink('/student/requests', <FiClipboard />, 'Document Requests')}

                            {renderSectionHeader('Campus Life')}
                            {renderLink('/student/attendance', <FiClock />, 'Attendance Log')}
                            {renderLink('/student/library', <FiBookOpen />, 'Library')}
                            {renderLink('/student/canteen', <FiCoffee />, 'Canteen Menu')}
                            {renderLink('/student/events', <FiAward />, 'Events')}
                            {renderLink('/student/orgs', <FiUsers />, 'Organizations')}

                            {renderSectionHeader('Support')}
                            {renderLink('/student/notifications', <FiBell />, 'Notifications')}
                            {renderLink('/student/help', <FiHelpCircle />, 'Help & Support')}
                        </>
                    )}

                    {/* --- TEACHER MENU --- */}
                    {role === 'Teacher' && (
                        <>
                            {renderSectionHeader('Teaching')}
                            {renderLink('/teacher/classes', <FiUsers />, 'Class Management')}
                            {renderLink('/teacher/schedule', <FiCalendar />, 'My Schedule')}
                            {renderLink('/teacher/gradebook', <FiActivity />, 'Gradebook')}
                            {renderLink('/teacher/attendance', <FiCheckSquare />, 'Attendance')}
                            {renderLink('/teacher/lms', <FiBookOpen />, 'LMS (Modules/Assignments)')}

                            {renderSectionHeader('Performance')}
                            {renderLink('/teacher/exams', <FiFileText />, 'Exams & Grading')}
                            {renderLink('/teacher/analytics', <FiActivity />, 'Class Analytics')}

                            {renderSectionHeader('Admin & Support')}
                            {renderLink('/teacher/documents', <FiClipboard />, 'Documents & Forms')}
                            {renderLink('/teacher/communication', <FiMessageSquare />, 'Communication')}
                            {renderLink('/teacher/support', <FiHelpCircle />, 'IT Support')}
                        </>
                    )}

                    {/* --- ADMIN MENU --- */}
                    {role === 'Admin' && (
                        <>
                            {renderSectionHeader('Core Operations')}
                            {renderLink('/admin/enrollment', <FiCheckSquare />, 'Enrollment')}
                            {renderLink('/admin/students', <FiUsers />, 'Student Information')}
                            {renderLink('/admin/academic', <FiBookOpen />, 'Academic Management')}
                            {renderLink('/admin/scheduling', <FiCalendar />, 'Scheduling')}
                            {renderLink('/admin/grades', <FiActivity />, 'Grades & Assessment')}
                            {renderLink('/admin/attendance', <FiClock />, 'Attendance Tracking')}

                            {renderSectionHeader('Staff & HR')}
                            {renderLink('/admin/teacher-load', <FiBriefcase />, 'Teacher Load')}
                            {renderLink('/admin/hr', <FiUsers />, 'HR Management')}

                            {renderSectionHeader('Facilities & Services')}
                            {renderLink('/admin/finance', <FiDollarSign />, 'Finance & Billing')}
                            {renderLink('/admin/library', <FiBookOpen />, 'Library System')}
                            {renderLink('/admin/clinic', <FiActivity />, 'Clinic/Health')}
                            {renderLink('/admin/transport', <FiTruck />, 'Transport')}
                            {renderLink('/admin/canteen', <FiCoffee />, 'Canteen')}

                            {renderSectionHeader('System')}
                            {renderLink('/admin/events', <FiAward />, 'Events & Calendar')}
                            {renderLink('/admin/reports', <FiActivity />, 'Reports & Analytics')}
                            {renderLink('/admin/communication', <FiMessageSquare />, 'Communication')}
                            {renderLink('/admin/users', <FiUser />, 'User Management')}
                            {renderLink('/admin/system', <FiSettings />, 'System Settings')}
                        </>
                    )}

                    {/* --- PARENT MENU --- */}
                    {role === 'Parent' && (
                         <>
                            {renderSectionHeader('Children')}
                            {/* Dashboard is already in Core group */}
                            {renderLink('/student/grades', <FiActivity />, 'Grades')}
                            {renderLink('/finance', <FiDollarSign />, 'Fees')}
                         </>
                    )}

                    <div className="my-4 border-top"></div>
                    {renderLink('/profile', <FiUser />, 'My Profile')}
                    {renderLink('/settings', <FiSettings />, 'Settings')}
                    <Nav.Link onClick={logout} className="d-flex align-items-center px-3 py-2 text-decoration-none text-danger" style={{cursor: 'pointer'}}>
                        <span style={{ fontSize: '1.2rem', marginRight: '12px' }}><FiMonitor/></span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Logout</span>
                    </Nav.Link>
                </Nav>
            </div>
        </div>
    );
};

export default Sidebar;
