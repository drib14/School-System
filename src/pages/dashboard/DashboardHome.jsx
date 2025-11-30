import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';
import StudentDashboard from './StudentDashboard';

const DashboardHome = () => {
    const { currentUser, users } = useStorage();

    if (currentUser.role === 'Student') {
        return <StudentDashboard />;
    }

    const getStats = () => {
        const students = users.filter(u => u.role === 'Student').length;
        const teachers = users.filter(u => u.role === 'Teacher').length;
        return { students, teachers };
    };

    const stats = getStats();

    if (currentUser.role === 'Admin') {
        return (
            <div>
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <p className="text-muted small mb-1">Total Students</p>
                                <h3 className="fw-bold mb-0">{stats.students}</h3>
                                <span className="badge badge-success-soft mt-2">Active</span>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <p className="text-muted small mb-1">Total Staff</p>
                                <h3 className="fw-bold mb-0">{stats.teachers}</h3>
                                <span className="badge badge-warning-soft mt-2">Active</span>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <p className="text-muted small mb-1">Revenue (YTD)</p>
                                <h3 className="fw-bold mb-0">$1.2M</h3>
                                <span className="badge badge-danger-soft mt-2">2%</span>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="shadow-sm">
                    <Card.Header>Recent Activity</Card.Header>
                    <Card.Body>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                                <div><i className="fas fa-user-plus text-success me-2"></i> New Student Registration</div>
                                <small className="text-muted">2 mins ago</small>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                                <div><i className="fas fa-file-invoice-dollar text-primary me-2"></i> Payment Received</div>
                                <small className="text-muted">1 hour ago</small>
                            </li>
                        </ul>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <Card className="bg-primary-custom text-white mb-4">
                <Card.Body className="p-4">
                    <h3>Welcome back, {currentUser.firstName}!</h3>
                    <p className="mb-0 opacity-75">You are logged in as {currentUser.role}.</p>
                </Card.Body>
            </Card>
            {/* Add Role Specific Dashboards later */}
        </div>
    );
};

export default DashboardHome;
