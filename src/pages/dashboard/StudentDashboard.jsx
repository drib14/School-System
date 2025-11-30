import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, ProgressBar, Badge, Button } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';
import api from '../../api/axios';

const StudentDashboard = () => {
    const { currentUser } = useStorage();
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch real grades
                const gradesRes = await api.get('/grades');
                setGrades(gradesRes.data);

                // Fetch real attendance
                const attRes = await api.get('/attendance/my');
                setAttendance(attRes.data);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Calculate Average
    const average = grades.length > 0
        ? (grades.reduce((acc, curr) => acc + (curr.finalGrade || 0), 0) / grades.length).toFixed(2)
        : '-';

    return (
        <div>
            <Card className="bg-primary-custom text-white mb-4 border-0">
                <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold">Welcome back, {currentUser.name}!</h3>
                        <p className="mb-0 opacity-90">Student Dashboard</p>
                    </div>
                    <div className="text-end d-none d-md-block">
                        <h2 className="mb-0">{average}</h2>
                        <small className="opacity-75">Average Grade</small>
                    </div>
                </Card.Body>
            </Card>

            <Row className="g-4">
                <Col md={8}>
                    {/* Attendance / Recent Logs */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">Recent Attendance</h6>
                            <Button size="sm" variant="link" className="text-decoration-none">View Full</Button>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {attendance.length === 0 ? (
                                <ListGroup.Item className="text-muted text-center py-4">No recent attendance logs.</ListGroup.Item>
                            ) : (
                                attendance.slice(0, 5).map((log, idx) => (
                                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="fw-bold d-block">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            <small className="text-muted">{log.timeIn}</small>
                                        </div>
                                        <Badge bg={log.status === 'Present' ? 'success' : 'warning'}>
                                            {log.status}
                                        </Badge>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    </Card>

                    {/* Assignments Mock (Placeholder for LMS) */}
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Due Assignments</h6></Card.Header>
                        <ListGroup variant="flush">
                            {/* We don't have Assignments API yet, so keep a "Clean" state or empty */}
                            <ListGroup.Item className="text-muted text-center py-4">No pending assignments.</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={4}>
                    {/* Grades Widget */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Recent Grades</h6></Card.Header>
                        <Card.Body>
                            {grades.length === 0 ? (
                                <p className="text-muted text-center">No grades available.</p>
                            ) : (
                                grades.map(g => (
                                    <div key={g._id} className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-bold">{g.subject}</span>
                                            <span className="small fw-bold text-success">{g.finalGrade}</span>
                                        </div>
                                        <ProgressBar variant={g.finalGrade >= 75 ? "success" : "danger"} now={g.finalGrade} height={5} />
                                    </div>
                                ))
                            )}
                        </Card.Body>
                    </Card>

                    {/* Announcements Mock */}
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Announcements</h6></Card.Header>
                        <Card.Body>
                            <div className="border-start border-3 border-primary ps-3 mb-3">
                                <small className="text-muted d-block">System</small>
                                <p className="mb-0 small fw-bold">Welcome to the new system!</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;
