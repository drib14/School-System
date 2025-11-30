import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import api from '../../api/axios';

const DashboardHome = () => {
    const { currentUser } = useStorage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser.role === 'Admin') {
            const fetchStats = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get('/dashboard/admin');
                    setStats(data);
                } catch (error) {
                    console.error(error);
                }
                setLoading(false);
            };
            fetchStats();
        }
    }, [currentUser.role]);

    if (currentUser.role === 'Student') {
        return <StudentDashboard />;
    }

    if (currentUser.role === 'Parent') {
        return <ParentDashboard />;
    }

    if (currentUser.role === 'Admin') {
        if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

        return (
            <div>
                 <Card className="bg-primary-custom text-white mb-4">
                    <Card.Body className="p-4">
                        <h3>Welcome back, {currentUser.name}!</h3>
                        <p className="mb-0 opacity-75">Admin Dashboard</p>
                    </Card.Body>
                </Card>

                <Row className="g-4 mb-4">
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <p className="text-muted small mb-1">Total Students</p>
                                <h3 className="fw-bold mb-0 text-primary-custom">{stats?.students || 0}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <p className="text-muted small mb-1">Total Staff</p>
                                <h3 className="fw-bold mb-0 text-info">{stats?.teachers || 0}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <p className="text-muted small mb-1">Total Parents</p>
                                <h3 className="fw-bold mb-0 text-warning">{stats?.parents || 0}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white fw-bold">Recent Activity</Card.Header>
                    <Card.Body>
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {stats.recentActivity.map((act, idx) => (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                                        <div><i className="fas fa-user-circle text-primary me-2"></i> {act.text}</div>
                                        <small className="text-muted">{new Date(act.time).toLocaleDateString()}</small>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">No recent activity.</p>
                        )}
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <Card className="bg-primary-custom text-white mb-4">
                <Card.Body className="p-4">
                    <h3>Welcome back, {currentUser.name}!</h3>
                    <p className="mb-0 opacity-75">You are logged in as {currentUser.role}.</p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default DashboardHome;
