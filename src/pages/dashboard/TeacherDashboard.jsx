import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import api from '../../api/axios';
import { useStorage } from '../../context/StorageContext';

const TeacherDashboard = () => {
    const { currentUser } = useStorage();
    const [courses, setCourses] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const coursesRes = await api.get('/courses');
                setCourses(coursesRes.data);

                // Fetch recent attendance logs (all logs for now, maybe filter by teacher's students in future)
                const attendanceRes = await api.get('/attendance');
                setAttendance(attendanceRes.data);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-5">Loading Dashboard...</div>;

    return (
        <div>
            <Card className="bg-primary-custom text-white mb-4">
                <Card.Body className="p-4">
                    <h3>Welcome back, {currentUser.name}!</h3>
                    <p className="mb-0 opacity-75">Teacher Dashboard</p>
                </Card.Body>
            </Card>

            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold">My Classes</Card.Header>
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Code</th>
                                    <th>Subject</th>
                                    <th>Schedule</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-3 text-muted">No classes assigned.</td></tr>
                                ) : (
                                    courses.map(c => (
                                        <tr key={c._id}>
                                            <td className="fw-bold">{c.code}</td>
                                            <td>{c.name}</td>
                                            <td><small>{c.schedule}</small></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold">Recent Attendance</Card.Header>
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Student</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.slice(0, 5).map(a => (
                                    <tr key={a._id}>
                                        <td>{a.student?.name}</td>
                                        <td>{a.timeIn}</td>
                                        <td><Badge bg={a.status === 'Present' ? 'success' : 'warning'}>{a.status}</Badge></td>
                                    </tr>
                                ))}
                                {attendance.length === 0 && (
                                    <tr><td colSpan="3" className="text-center py-3 text-muted">No recent logs.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TeacherDashboard;
