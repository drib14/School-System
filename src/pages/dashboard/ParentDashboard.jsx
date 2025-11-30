import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, ProgressBar } from 'react-bootstrap';
import api from '../../api/axios';

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/dashboard/parent');
                setChildren(data.children || []);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-5">Loading Dashboard...</div>;

    if (children.length === 0) {
        return (
            <Card className="shadow-sm border-0">
                <Card.Body className="text-center p-5">
                    <h4>Welcome, Parent!</h4>
                    <p className="text-muted">No students are currently linked to your account.</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div>
            <h3 className="mb-4 fw-bold text-primary-custom">Parent Dashboard</h3>
            {children.map(child => (
                <div key={child.id} className="mb-5">
                    <Card className="bg-primary-custom text-white mb-4 border-0 shadow-sm">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="fw-bold mb-1">{child.name}</h4>
                                <p className="mb-0 opacity-75">Student ID: {child.id}</p>
                            </div>
                            <div className="text-end bg-white text-primary-custom px-3 py-2 rounded-3 shadow-sm">
                                <h2 className="mb-0 fw-bold">{child.averageGrade || '-'}</h2>
                                <small className="fw-bold">AVG GRADE</small>
                            </div>
                        </Card.Body>
                    </Card>

                    <Row className="g-4">
                        <Col md={8}>
                            {/* Attendance History */}
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white fw-bold">Recent Attendance</Card.Header>
                                <Table responsive hover className="mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Time In</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {child.attendance && child.attendance.length > 0 ? (
                                            child.attendance.map(a => (
                                                <tr key={a._id}>
                                                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                                                    <td>{a.timeIn}</td>
                                                    <td><Badge bg={a.status === 'Present' ? 'success' : 'warning'}>{a.status}</Badge></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="3" className="text-center text-muted py-3">No records found.</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card>
                        </Col>
                        <Col md={4}>
                             {/* Grades Overview */}
                             <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white fw-bold">Grades Overview</Card.Header>
                                <Card.Body>
                                    {child.grades && child.grades.length > 0 ? (
                                        child.grades.map(g => (
                                            <div key={g._id} className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="small fw-bold">{g.subject}</span>
                                                    <span className="small fw-bold">{g.finalGrade}</span>
                                                </div>
                                                <ProgressBar variant={g.finalGrade >= 75 ? "success" : "danger"} now={g.finalGrade} height={6} />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted small text-center">No grades available.</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            ))}
        </div>
    );
};

export default ParentDashboard;
