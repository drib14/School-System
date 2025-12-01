import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Form, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { FiDownload, FiFilter } from 'react-icons/fi';
import api from '../../api/axios';

const AttendanceAdmin = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchLogs();
    }, [date]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/attendance?date=${date}`);
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Daily Attendance Report</h2>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Filter by Date</Form.Label>
                                <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-primary" className="w-100">
                                <FiDownload className="me-2" /> Export CSV
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Student</th>
                                    <th>ID Number</th>
                                    <th>Time In</th>
                                    <th>Course / Location</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? <tr><td colSpan="5" className="text-center py-4">No records for this date.</td></tr> :
                                    logs.map(log => (
                                        <tr key={log._id}>
                                            <td className="fw-bold">{log.student?.name || 'Unknown'}</td>
                                            <td>{log.student?.studentId || 'N/A'}</td>
                                            <td>{log.timeIn || '--:--'}</td>
                                            <td>{log.course?.code || 'Main Gate'}</td>
                                            <td><Badge bg={log.status === 'Present' ? 'success' : 'warning'}>{log.status}</Badge></td>
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

export default AttendanceAdmin;
