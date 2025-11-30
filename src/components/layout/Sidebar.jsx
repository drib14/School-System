import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';
import logo from '../../assets/img/logo.png';

const Sidebar = ({ isOpen }) => {
    const { currentUser, logout } = useStorage();
    const location = useLocation();
    const role = currentUser?.role;

    const isActive = (path) => location.pathname === path;

    const menuGroups = [
        {
            title: 'Core',
            items: [
                { name: 'Dashboard', path: '/dashboard', icon: 'fa-th-large', roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
                { name: 'Enrollment', path: '/enrollment', icon: 'fa-file-signature', roles: ['Student'] },
                { name: 'Admissions', path: '/admissions', icon: 'fa-file-import', roles: ['Admin'] },
                { name: 'Students', path: '/students', icon: 'fa-user-graduate', roles: ['Admin', 'Teacher'] },
            ]
        },
        {
            title: 'Academic',
            items: [
                { name: 'Curriculum', path: '/courses', icon: 'fa-book', roles: ['Admin', 'Teacher'] },
                { name: 'Scheduling', path: '/scheduling', icon: 'fa-calendar-alt', roles: ['Admin'] },
                { name: 'Gradebook', path: '/grades', icon: 'fa-graduation-cap', roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
                { name: 'LMS', path: '/lms', icon: 'fa-laptop-code', roles: ['Admin', 'Teacher', 'Student'] },
                { name: 'Examinations', path: '/exams', icon: 'fa-edit', roles: ['Admin', 'Teacher'] },
            ]
        },
        {
            title: 'Operations',
            items: [
                { name: 'Attendance', path: '/attendance', icon: 'fa-clock', roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
                { name: 'Library', path: '/library', icon: 'fa-book-reader', roles: ['Admin', 'Teacher', 'Student'] },
                { name: 'Clinic', path: '/clinic', icon: 'fa-medkit', roles: ['Admin', 'Teacher'] },
                { name: 'Transport', path: '/transport', icon: 'fa-bus', roles: ['Admin', 'Parent'] },
                { name: 'Canteen', path: '/canteen', icon: 'fa-utensils', roles: ['Admin', 'Student'] },
            ]
        },
        {
            title: 'Administration',
            items: [
                { name: 'Users', path: '/users', icon: 'fa-users-cog', roles: ['Admin'] },
                { name: 'Finance', path: '/finance', icon: 'fa-file-invoice-dollar', roles: ['Admin', 'Parent'] },
                { name: 'HR & Staff', path: '/staff', icon: 'fa-chalkboard-teacher', roles: ['Admin'] },
                { name: 'Events', path: '/events', icon: 'fa-calendar-day', roles: ['Admin', 'Teacher', 'Student'] },
                { name: 'Reports', path: '/reports', icon: 'fa-chart-bar', roles: ['Admin'] },
                { name: 'Settings', path: '/settings', icon: 'fa-cogs', roles: ['Admin'] },
            ]
        }
    ];

    return (
        <div className={`sidebar ${isOpen ? 'active' : ''}`}>
            <div className="sidebar-header">
                <img src={logo} alt="EduCore" width="32" height="32" className="me-2" />
                <Link to="/dashboard" className="sidebar-brand text-decoration-none">EduCore</Link>
            </div>

            <div className="sidebar-menu mt-3">
                {menuGroups.map((group, gIdx) => {
                    const visibleItems = group.items.filter(i => i.roles.includes(role));
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={gIdx} className="mb-4">
                            <small className="text-muted text-uppercase fw-bold px-4 mb-2 d-block" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>
                                {group.title}
                            </small>
                            <Nav className="flex-column">
                                {visibleItems.map((link, idx) => (
                                    <Nav.Link
                                        key={idx}
                                        as={Link}
                                        to={link.path}
                                        className={isActive(link.path) ? 'active' : ''}
                                    >
                                        <i className={`fas ${link.icon}`}></i> {link.name}
                                    </Nav.Link>
                                ))}
                            </Nav>
                        </div>
                    );
                })}

                <Nav className="flex-column">
                    <Nav.Link onClick={logout} className="text-danger mt-2">
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </Nav.Link>
                </Nav>
            </div>
        </div>
    );
};

export default Sidebar;
