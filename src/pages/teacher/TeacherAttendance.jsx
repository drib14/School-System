import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { FiCalendar, FiUserCheck, FiUserX, FiCheckCircle, FiCamera, FiRefreshCw } from 'react-icons/fi';
import api from '../../api/axios';
import QRScannerModal from '../../components/common/QRScannerModal';

const TeacherAttendance = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mergedList, setMergedList] = useState([]); // Students + Logs
    const [loading, setLoading] = useState(false);

    // Scanner
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchClassData();
        }
    }, [selectedCourse, date]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
            if (data.length > 0) setSelectedCourse(data[0]);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClassData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Students (Enrollments)
            const query = `?program=${encodeURIComponent(selectedCourse.program)}&yearLevel=${encodeURIComponent(selectedCourse.yearLevel)}&section=${encodeURIComponent(selectedCourse.section || '')}&status=Active`;
            const studentsRes = await api.get(`/enrollments${query}`);
            const enrollments = studentsRes.data;

            // 2. Fetch Attendance Logs for Date
            const logsRes = await api.get(`/attendance?courseId=${selectedCourse._id}&date=${date}`);
            const logs = logsRes.data;

            // 3. Merge
            const merged = enrollments.map(enrollment => {
                const studentId = enrollment.student._id;
                const log = logs.find(l => l.student._id === studentId || l.student === studentId);
                return {
                    enrollment,
                    student: enrollment.student,
                    log: log || null
                };
            });

            setMergedList(merged);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async (scannedValue) => {
        // Scanned value should be student ID (mongo ID)
        try {
            await api.post('/attendance/scan', {
                studentId: scannedValue,
                courseId: selectedCourse._id,
                status: 'Present'
            });
            // Beep or Notify
            alert('Scanned successfully!');
            fetchClassData(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || 'Scan failed');
        }
    };

    const handleStatusUpdate = async (studentId, status) => {
        try {
            await api.post('/attendance/scan', {
                studentId: studentId,
                courseId: selectedCourse._id,
                status: status
            });
            fetchClassData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Class Attendance</h2>
                <Button variant="primary" onClick={() => setShowScanner(true)}>
                    <FiCamera className="me-2" /> Scan QR Code
                </Button>
            </div>

            <Row className="mb-4">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Select Class</Form.Label>
                        <Form.Select
                            value={selectedCourse?._id || ''}
                            onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                        >
                            {courses.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.code} - {c.section} ({c.schedule})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                    <Button variant="outline-secondary" onClick={fetchClassData}>
                        <FiRefreshCw /> Refresh
                    </Button>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table responsive hover className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Student</th>
                                    <th>ID Number</th>
                                    <th>Time In</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mergedList.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4">No students found for this class.</td></tr>
                                ) : mergedList.map(({ student, log }) => (
                                    <tr key={student._id}>
                                        <td className="fw-bold">{student.name}</td>
                                        <td>{student.studentId || 'N/A'}</td>
                                        <td>{log?.timeIn || '--:--'}</td>
                                        <td>
                                            <Badge bg={
                                                log?.status === 'Present' ? 'success' :
                                                log?.status === 'Late' ? 'warning' :
                                                log?.status === 'Absent' ? 'danger' : 'secondary'
                                            }>
                                                {log?.status || 'Pending'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <Button size="sm" variant={log?.status === 'Present' ? 'success' : 'outline-success'} onClick={() => handleStatusUpdate(student._id, 'Present')}>P</Button>
                                                <Button size="sm" variant={log?.status === 'Late' ? 'warning' : 'outline-warning'} onClick={() => handleStatusUpdate(student._id, 'Late')}>L</Button>
                                                <Button size="sm" variant={log?.status === 'Absent' ? 'danger' : 'outline-danger'} onClick={() => handleStatusUpdate(student._id, 'Absent')}>A</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <QRScannerModal
                show={showScanner}
                onHide={() => setShowScanner(false)}
                onScan={handleScan}
            />
        </Container>
    );
};

export default TeacherAttendance;
