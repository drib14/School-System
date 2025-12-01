import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Spinner, Button, Form, Alert, Tab, Nav } from 'react-bootstrap';
import { FiBook, FiCheckCircle, FiClock, FiFileText, FiUpload, FiChevronLeft } from 'react-icons/fi';
import useMyCourses from '../../hooks/useMyCourses';
import api from '../../api/axios';

const StudentLMS = () => {
    const { courses, loading: coursesLoading } = useMyCourses();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);

    // View state: 'list' (courses), 'course' (assignments list), 'assignment' (detail)
    // Actually, let's do: Desktop (Split), Mobile (Drilldown).
    // For simplicity, let's do Drilldown for all sizes for now, or Split View.
    // Let's do Split View on Desktop, Drilldown on Mobile.

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignments(selectedCourse._id);
        }
    }, [selectedCourse]);

    const fetchAssignments = async (courseId) => {
        setLoadingAssignments(true);
        try {
            const { data } = await api.get(`/lms/assignments?courseId=${courseId}`);
            setAssignments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingAssignments(false);
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4 fw-bold text-primary">Learning Management System</h2>

            <Row>
                {/* Course List Sidebar */}
                <Col lg={3} md={4} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3">My Courses</Card.Header>
                        <ListGroup variant="flush">
                            {coursesLoading ? (
                                <div className="p-3 text-center"><Spinner size="sm" /></div>
                            ) : courses.map(course => (
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
                                        <small className="text-muted">{course.name}</small>
                                    </div>
                                    <FiBook />
                                </ListGroup.Item>
                            ))}
                            {!coursesLoading && courses.length === 0 && (
                                <div className="p-3 text-muted text-center">No courses found.</div>
                            )}
                        </ListGroup>
                    </Card>
                </Col>

                {/* Main Content Area */}
                <Col lg={9} md={8}>
                    {selectedCourse ? (
                        <CourseContent course={selectedCourse} assignments={assignments} loading={loadingAssignments} refreshAssignments={() => fetchAssignments(selectedCourse._id)} />
                    ) : (
                        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted bg-light rounded" style={{ minHeight: '400px' }}>
                            <FiBook size={48} className="mb-3 opacity-50" />
                            <h4>Select a course to view contents</h4>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

const CourseContent = ({ course, assignments, loading, refreshAssignments }) => {
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    if (selectedAssignment) {
        return (
            <AssignmentDetail
                assignment={selectedAssignment}
                onBack={() => setSelectedAssignment(null)}
                onSubmitSuccess={refreshAssignments}
            />
        );
    }

    return (
        <Card className="shadow-sm border-0 h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h3 className="mb-1">{course.name}</h3>
                        <p className="text-muted mb-0">{course.code} &bull; {course.teacher?.name || 'Instructor'}</p>
                    </div>
                </div>

                <h5 className="mb-3 fw-bold">Assignments & Tasks</h5>
                {loading ? (
                    <Spinner animation="border" variant="primary" />
                ) : assignments.length === 0 ? (
                    <Alert variant="info">No active assignments for this course.</Alert>
                ) : (
                    <Row>
                        {assignments.map(assign => (
                            <Col md={12} key={assign._id} className="mb-3">
                                <Card className="border shadow-sm h-100" onClick={() => setSelectedAssignment(assign)} style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <Card.Body className="d-flex align-items-center">
                                        <div className="bg-light p-3 rounded-circle me-3 text-primary">
                                            <FiFileText size={24} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{assign.title}</h6>
                                            <small className="text-muted">Due: {new Date(assign.dueDate).toLocaleDateString()} &bull; {assign.points} pts</small>
                                        </div>
                                        <Button variant="outline-primary" size="sm">View</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card.Body>
        </Card>
    );
};

const AssignmentDetail = ({ assignment, onBack, onSubmitSuccess }) => {
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const [fileUrl, setFileUrl] = useState('');

    useEffect(() => {
        fetchSubmission();
    }, [assignment]);

    const fetchSubmission = async () => {
        try {
            const { data } = await api.get(`/lms/my-submission/${assignment._id}`);
            setSubmission(data);
            if (data) {
                setContent(data.content || '');
                setFileUrl(data.fileUrl || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/lms/submissions', {
                assignmentId: assignment._id,
                content,
                fileUrl
            });
            await fetchSubmission();
            alert('Assignment submitted successfully!');
            onSubmitSuccess();
        } catch (error) {
            alert('Failed to submit assignment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <Button variant="link" className="p-0 mb-3 text-decoration-none" onClick={onBack}>
                    <FiChevronLeft /> Back to Course
                </Button>

                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-start">
                        <h3 className="fw-bold">{assignment.title}</h3>
                        <Badge bg={submission ? (submission.status === 'Graded' ? 'success' : 'info') : 'secondary'}>
                            {submission ? submission.status : 'Not Submitted'}
                        </Badge>
                    </div>
                    <p className="text-muted mb-2">Due: {new Date(assignment.dueDate).toLocaleString()} &bull; {assignment.points} Points</p>
                    <hr />
                    <div className="p-3 bg-light rounded mb-4">
                        <h5>Description</h5>
                        <p className="mb-0">{assignment.description || 'No description provided.'}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <h5 className="mb-3">Your Work</h5>
                    {submission && submission.grade !== undefined && (
                         <Alert variant="success" className="d-flex align-items-center">
                             <FiCheckCircle className="me-2" size={20} />
                             <div>
                                 <strong>Graded: </strong> {submission.grade} / {assignment.points}
                                 {submission.feedback && <div className="mt-1 small">Feedback: {submission.feedback}</div>}
                             </div>
                         </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Text Response / Links</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Type your answer or paste Google Doc link here..."
                                disabled={submission?.status === 'Graded'}
                            />
                        </Form.Group>

                        {/* Mock File Upload */}
                        <Form.Group className="mb-4">
                             <Form.Label>Attach File (URL)</Form.Label>
                             <div className="d-flex gap-2">
                                <Form.Control
                                    type="text"
                                    placeholder="https://..."
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    disabled={submission?.status === 'Graded'}
                                />
                                <Button variant="outline-secondary" disabled>
                                    <FiUpload />
                                </Button>
                             </div>
                             <Form.Text className="text-muted">Simulated file upload. Paste a URL to your file.</Form.Text>
                        </Form.Group>

                        {submission?.status !== 'Graded' && (
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" disabled={submitting} size="lg">
                                    {submitting ? 'Submitting...' : (submission ? 'Resubmit Assignment' : 'Turn In')}
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>
            </Card.Body>
        </Card>
    );
};

export default StudentLMS;
