import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge, Form, InputGroup } from 'react-bootstrap';
import { FiUsers, FiSearch, FiBookOpen, FiDownload } from 'react-icons/fi';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const ClassManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudents(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
            if (data.length > 0) {
                setSelectedCourse(data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchStudents = async (course) => {
        setLoadingStudents(true);
        try {
            // Fetch enrollments that match the course's demographics
            const query = `?program=${encodeURIComponent(course.program)}&yearLevel=${encodeURIComponent(course.yearLevel)}&section=${encodeURIComponent(course.section || '')}&status=Active`;
            const { data } = await api.get(`/enrollments${query}`);
            setStudents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const filteredStudents = students.filter(enrollment =>
        enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Class Management</h2>
                <Button variant="outline-primary" onClick={() => navigate('/teacher/schedule')}>
                    View Schedule
                </Button>
            </div>

            <Row>
                {/* Course List Sidebar */}
                <Col lg={3} md={4} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3">My Classes</Card.Header>
                        <div className="list-group list-group-flush">
                            {loadingCourses ? (
                                <div className="p-3 text-center"><Spinner size="sm" /></div>
                            ) : courses.map(course => (
                                <button
                                    key={course._id}
                                    className={`list-group-item list-group-item-action py-3 ${selectedCourse?._id === course._id ? 'active' : ''}`}
                                    onClick={() => setSelectedCourse(course)}
                                    style={{
                                        backgroundColor: selectedCourse?._id === course._id ? 'var(--bs-primary)' : 'transparent',
                                        color: selectedCourse?._id === course._id ? '#fff' : 'inherit',
                                        borderLeft: selectedCourse?._id === course._id ? '4px solid white' : 'none'
                                    }}
                                >
                                    <div className="fw-bold">{course.code}</div>
                                    <div className="small opacity-75">{course.name}</div>
                                    <div className="small opacity-75 mt-1">
                                        {course.program} {course.yearLevel} - {course.section}
                                    </div>
                                </button>
                            ))}
                            {!loadingCourses && courses.length === 0 && (
                                <div className="p-3 text-center text-muted">No classes assigned.</div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Student List Area */}
                <Col lg={9} md={8}>
                    {selectedCourse ? (
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <div>
                                        <h4 className="mb-1">{selectedCourse.name}</h4>
                                        <p className="text-muted mb-0">
                                            {selectedCourse.code} &bull; {selectedCourse.schedule} &bull; Room {selectedCourse.room}
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button variant="success" onClick={() => navigate('/teacher/lms')}>
                                            <FiBookOpen className="me-2" /> Go to LMS
                                        </Button>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Class Roster ({students.length})</h5>
                                    <InputGroup style={{ maxWidth: '300px' }}>
                                        <InputGroup.Text className="bg-white"><FiSearch /></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search student..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>

                                {loadingStudents ? (
                                    <div className="text-center py-5"><Spinner animation="border" /></div>
                                ) : (
                                    <Table responsive hover className="align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Student Name</th>
                                                <th>Email</th>
                                                <th>Enrollment Date</th>
                                                <th>Status</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.length > 0 ? filteredStudents.map(enrollment => (
                                                <tr key={enrollment._id}>
                                                    <td className="fw-bold">{enrollment.student.name}</td>
                                                    <td>{enrollment.student.email}</td>
                                                    <td>{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                                                    <td><Badge bg="success">Active</Badge></td>
                                                    <td className="text-end">
                                                        <Button variant="outline-secondary" size="sm">View Profile</Button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4 text-muted">
                                                        No students found in this class.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted bg-light rounded" style={{ minHeight: '400px' }}>
                            <FiUsers size={48} className="mb-3 opacity-50" />
                            <h4>Select a class to view details</h4>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ClassManagement;
