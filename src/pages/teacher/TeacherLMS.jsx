import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Badge, Spinner, Modal, Form, Table } from 'react-bootstrap';
import { FiBook, FiPlus, FiCheckCircle, FiFileText, FiClock, FiUser, FiChevronLeft } from 'react-icons/fi';
import api from '../../api/axios';

const TeacherLMS = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Assignment State
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null); // If set, show Submissions View

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignments();
            setSelectedAssignment(null); // Reset detail view
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
            if (data.length > 0) setSelectedCourse(data[0]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchAssignments = async () => {
        setLoadingAssignments(true);
        try {
            const { data } = await api.get(`/lms/assignments?courseId=${selectedCourse._id}`);
            setAssignments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingAssignments(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            courseId: selectedCourse._id,
            title: formData.get('title'),
            description: formData.get('description'),
            points: formData.get('points'),
            dueDate: formData.get('dueDate')
        };
        try {
            await api.post('/lms/assignments', payload);
            setShowCreateModal(false);
            fetchAssignments();
        } catch (error) {
            alert('Failed to create assignment');
        }
    };

    return (
        <Container fluid className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">LMS & Assignments</h2>
            </div>

            <Row>
                {/* Courses Sidebar */}
                <Col lg={3} md={4} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3">My Classes</Card.Header>
                         <ListGroup variant="flush">
                            {loadingCourses ? <div className="p-3 text-center"><Spinner size="sm" /></div> :
                                courses.map(course => (
                                    <ListGroup.Item
                                        key={course._id}
                                        action
                                        active={selectedCourse?._id === course._id}
                                        onClick={() => setSelectedCourse(course)}
                                        className="d-flex justify-content-between align-items-center py-3"
                                        style={{ borderLeft: selectedCourse?._id === course._id ? '4px solid white' : 'none' }}
                                    >
                                        <div>
                                            <div className="fw-bold">{course.code}</div>
                                            <small className="text-muted">{course.section}</small>
                                        </div>
                                        <FiBook />
                                    </ListGroup.Item>
                                ))
                            }
                        </ListGroup>
                    </Card>
                </Col>

                {/* Main Content */}
                <Col lg={9} md={8}>
                    {selectedCourse ? (
                        selectedAssignment ? (
                            <SubmissionView
                                assignment={selectedAssignment}
                                onBack={() => setSelectedAssignment(null)}
                            />
                        ) : (
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                        <div>
                                            <h4 className="mb-1">{selectedCourse.name}</h4>
                                            <p className="text-muted mb-0">{selectedCourse.program} {selectedCourse.yearLevel} - Sec {selectedCourse.section}</p>
                                        </div>
                                        <Button onClick={() => setShowCreateModal(true)}>
                                            <FiPlus className="me-2" /> Create Assignment
                                        </Button>
                                    </div>

                                    {loadingAssignments ? <Spinner animation="border" /> : (
                                        assignments.length === 0 ? <div className="text-muted">No assignments created yet.</div> :
                                        <div className="list-group">
                                            {assignments.map(assign => (
                                                <div key={assign._id} className="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center" onClick={() => setSelectedAssignment(assign)} style={{ cursor: 'pointer' }}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-light p-3 rounded me-3 text-primary"><FiFileText size={20}/></div>
                                                        <div>
                                                            <h6 className="mb-1 fw-bold">{assign.title}</h6>
                                                            <small className="text-muted">Due: {new Date(assign.dueDate).toLocaleDateString()} &bull; {assign.points} pts</small>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline-primary" size="sm">View Submissions</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        )
                    ) : (
                        <div className="text-center p-5 text-muted bg-light rounded">Select a class to manage assignments.</div>
                    )}
                </Col>
            </Row>

            {/* Create Assignment Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Form onSubmit={handleCreateAssignment}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Assignment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control name="title" required placeholder="e.g. Midterm Essay" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={4} name="description" placeholder="Instructions..." />
                        </Form.Group>
                         <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Points</Form.Label>
                                    <Form.Control type="number" name="points" defaultValue={100} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Due Date</Form.Label>
                                    <Form.Control type="datetime-local" name="dueDate" required />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Create Assignment</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

const SubmissionView = ({ assignment, onBack }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gradingSubmission, setGradingSubmission] = useState(null); // Logic for grading modal

    useEffect(() => {
        fetchSubmissions();
    }, [assignment]);

    const fetchSubmissions = async () => {
        try {
            const { data } = await api.get(`/lms/submissions/${assignment._id}`);
            setSubmissions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.put(`/lms/submissions/${gradingSubmission._id}/grade`, {
                grade: formData.get('grade'),
                feedback: formData.get('feedback')
            });
            setGradingSubmission(null);
            fetchSubmissions();
        } catch (error) {
            alert('Failed to save grade');
        }
    };

    return (
        <Card className="shadow-sm border-0 h-100">
            <Card.Body>
                 <div className="mb-4">
                    <Button variant="link" className="p-0 text-decoration-none mb-2" onClick={onBack}>
                        <FiChevronLeft /> Back to Assignments
                    </Button>
                    <h3 className="fw-bold">{assignment.title} <span className="text-muted h6">Submissions</span></h3>
                </div>

                {loading ? <Spinner animation="border" /> : (
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Student</th>
                                <th>Status</th>
                                <th>Submitted At</th>
                                <th>Grade</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length === 0 ? <tr><td colSpan="5" className="text-center py-4">No submissions yet.</td></tr> :
                                submissions.map(sub => (
                                    <tr key={sub._id}>
                                        <td className="fw-bold">{sub.student.name}</td>
                                        <td><Badge bg={sub.status === 'Graded' ? 'success' : 'info'}>{sub.status}</Badge></td>
                                        <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                                        <td>{sub.grade !== undefined ? `${sub.grade} / ${assignment.points}` : '-'}</td>
                                        <td>
                                            <Button size="sm" variant="outline-primary" onClick={() => setGradingSubmission(sub)}>
                                                Review & Grade
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                )}
            </Card.Body>

            {/* Grading Modal */}
            <Modal show={!!gradingSubmission} onHide={() => setGradingSubmission(null)}>
                <Form onSubmit={handleGradeSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Grade Submission: {gradingSubmission?.student?.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3 p-3 bg-light rounded">
                            <label className="text-muted small">Student Answer:</label>
                            <p className="mb-2">{gradingSubmission?.content}</p>
                             {gradingSubmission?.fileUrl && (
                                <a href={gradingSubmission.fileUrl} target="_blank" rel="noreferrer">View Attached File</a>
                            )}
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Grade (out of {assignment.points})</Form.Label>
                            <Form.Control type="number" name="grade" max={assignment.points} defaultValue={gradingSubmission?.grade} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Feedback</Form.Label>
                            <Form.Control as="textarea" rows={3} name="feedback" defaultValue={gradingSubmission?.feedback} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Grade</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Card>
    );
};

export default TeacherLMS;
