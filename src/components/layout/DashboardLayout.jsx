import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="main-content w-100">
                <Topbar toggleSidebar={toggleSidebar} />
                <div className="container-fluid p-0">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
