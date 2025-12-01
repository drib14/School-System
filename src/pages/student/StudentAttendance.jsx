import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { FiClock, FiCalendar } from 'react-icons/fi';
import api from '../../api/axios';

const StudentAttendance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const { data } = await api.get('/attendance/my');
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch attendance", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">My Attendance Log</h2>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-primary text-white">
                        <Card.Body className="d-flex align-items-center">
                            <FiClock size={40} className="me-3 opacity-50" />
                            <div>
                                <h6 className="mb-0">Total Present</h6>
                                <h2 className="mb-0 fw-bold">{logs.filter(l => l.status === 'Present').length}</h2>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                     <Card className="shadow-sm border-0 bg-danger text-white">
                        <Card.Body className="d-flex align-items-center">
                            <FiCalendar size={40} className="me-3 opacity-50" />
                            <div>
                                <h6 className="mb-0">Absences</h6>
                                <h2 className="mb-0 fw-bold">{logs.filter(l => l.status === 'Absent').length}</h2>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <div className="text-center p-4"><Spinner animation="border"/></div> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Class / Event</th>
                                    <th>Time In</th>
                                    <th>Status</th>
                                    <th>Verified By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? <tr><td colSpan="5" className="text-center">No logs found.</td></tr> :
                                    logs.map(log => (
                                        <tr key={log._id}>
                                            <td>{new Date(log.createdAt).toLocaleDateString()}</td>
                                            <td>{log.course ? log.course.code : 'Daily Entry'}</td>
                                            <td>{log.timeIn || '--:--'}</td>
                                            <td>
                                                <Badge bg={
                                                    log.status === 'Present' ? 'success' :
                                                    log.status === 'Late' ? 'warning' : 'danger'
                                                }>{log.status}</Badge>
                                            </td>
                                            <td>{log.verifiedBy ? 'Teacher' : 'System'}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default StudentAttendance;
