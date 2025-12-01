import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { FiCalendar, FiClock, FiMapPin, FiUser } from 'react-icons/fi';
import api from '../../api/axios';
import { useStorage } from '../../context/StorageContext';

const StudentSchedule = () => {
    const { currentUser } = useStorage();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollmentInfo, setEnrollmentInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Enrollment Info to know Program/Year
                // We filter by 'Active' ideally, but for now we take the latest
                const enrollRes = await api.get('/enrollments');
                const myEnrollments = enrollRes.data;

                // Sort by date desc
                const currentEnrollment = myEnrollments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                if (!currentEnrollment) {
                    setError('You are not enrolled in any program yet.');
                    setLoading(false);
                    return;
                }

                setEnrollmentInfo(currentEnrollment);

                // 2. Get Courses based on Program and YearLevel
                const { program, yearLevel } = currentEnrollment;
                const coursesRes = await api.get(`/courses?program=${encodeURIComponent(program)}&yearLevel=${encodeURIComponent(yearLevel)}`);
                setSchedule(coursesRes.data);

            } catch (err) {
                console.error("Failed to fetch schedule", err);
                setError('Failed to load schedule. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="info">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: 700, color: 'var(--bs-primary)' }}>My Class Schedule</h2>
                    <p className="text-muted mb-0">
                        {enrollmentInfo?.program} &bull; {enrollmentInfo?.yearLevel} &bull; Sem 1
                    </p>
                </div>
                <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                    Status: {enrollmentInfo?.status}
                </Badge>
            </div>

            <Row>
                {schedule.length === 0 ? (
                    <Col>
                         <Alert variant="warning">No courses found for this program schedule.</Alert>
                    </Col>
                ) : (
                    schedule.map((course) => (
                        <Col lg={4} md={6} sm={12} className="mb-4" key={course._id}>
                            <Card className="h-100 shadow-sm border-0" style={{ transition: 'transform 0.2s', borderRadius: '12px' }}>
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <Badge bg="primary" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                            {course.code}
                                        </Badge>
                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>3 Units</span>
                                    </div>

                                    <h5 className="card-title fw-bold mb-3" style={{ color: '#2c3e50' }}>{course.name}</h5>

                                    <div className="mt-auto">
                                        <div className="d-flex align-items-center mb-2 text-secondary">
                                            <FiClock className="me-2" style={{ color: 'var(--bs-primary)' }} />
                                            <span>{course.schedule || 'TBA'}</span>
                                        </div>
                                        <div className="d-flex align-items-center mb-2 text-secondary">
                                            <FiMapPin className="me-2" style={{ color: 'var(--bs-primary)' }} />
                                            <span>{course.room || 'TBA'}</span>
                                        </div>
                                        <div className="d-flex align-items-center text-secondary">
                                            <FiUser className="me-2" style={{ color: 'var(--bs-primary)' }} />
                                            <span>{course.teacher?.name || 'TBA'}</span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Optional: Table View Toggle could go here */}
            <Card className="mt-4 border-0 shadow-sm">
                <Card.Header className="bg-white py-3 fw-bold border-bottom">
                    Weekly Overview
                </Card.Header>
                <Card.Body>
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Course Code</th>
                                <th>Subject</th>
                                <th>Schedule</th>
                                <th>Room</th>
                                <th>Instructor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map(course => (
                                <tr key={course._id}>
                                    <td className="fw-bold text-primary">{course.code}</td>
                                    <td>{course.name}</td>
                                    <td>{course.schedule}</td>
                                    <td>{course.room}</td>
                                    <td>{course.teacher?.name || 'TBA'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default StudentSchedule;
