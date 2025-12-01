import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useStorage } from '../../context/StorageContext';
import logo from '../../assets/img/logo.png';

const Topbar = ({ toggleSidebar }) => {
    const { currentUser, logout } = useStorage();
    const navigate = useNavigate();

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="topbar">
            <div className="d-flex align-items-center">
                <Button variant="link" className="text-dark me-3 p-0" onClick={toggleSidebar}>
                    <FiMenu size={24} />
                </Button>
                 <div className="bg-primary-custom text-white rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center me-2" style={{width: 30, height: 30, fontSize: 14}}>
                    <FiUser />
                </div>
                <h4 className="mb-0 fw-bold" style={{ color: 'var(--bs-primary)' }}>EduCore University</h4>
            </div>

            <div className="d-flex align-items-center gap-4">
                <div className="position-relative d-none d-md-block">
                    <FiBell size={20} className="text-secondary" style={{cursor: 'pointer'}} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.5rem'}}>3</span>
                </div>

                <Dropdown align="end">
                    <Dropdown.Toggle as="div" className="user-profile bs-toggle-hide" id="dropdown-custom-components">
                         <div className="text-end me-2 d-none d-sm-block">
                            <div className="fw-bold small">{currentUser?.name}</div>
                            <div className="text-muted small" style={{fontSize: '0.75rem'}}>{currentUser?.role}</div>
                        </div>
                        <div className="user-avatar">
                            {getInitials(currentUser?.name)}
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="border-0 shadow">
                        <Dropdown.Item onClick={() => navigate('/profile')}>My Profile</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate('/settings')}>Settings</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logout} className="text-danger">Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
};

export default Topbar;
