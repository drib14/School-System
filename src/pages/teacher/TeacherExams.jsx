import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Modal, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiFileText } from 'react-icons/fi';
import api from '../../api/axios';

const TeacherExams = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [examsRes, coursesRes] = await Promise.all([
                api.get('/exams'),
                api.get('/courses')
            ]);
            setExams(examsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            courseId: formData.get('courseId'),
            title: formData.get('title'),
            description: formData.get('description'),
            duration: formData.get('duration'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            questions
        };

        try {
            await api.post('/exams', payload);
            setShowModal(false);
            fetchData();
            alert('Exam Created Successfully!');
        } catch (error) {
            alert('Failed to create exam');
        }
    };

    return (
        <Container fluid className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Exam Management</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Create Exam</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map(exam => (
                                    <tr key={exam._id}>
                                        <td className="fw-bold">{exam.title}</td>
                                        <td>{exam.course?.code}</td>
                                        <td>{new Date(exam.startDate).toLocaleDateString()}</td>
                                        <td>{exam.duration} mins</td>
                                        <td><Badge bg={exam.isActive ? 'success' : 'secondary'}>{exam.isActive ? 'Active' : 'Draft'}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton><Modal.Title>Create New Exam</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Course</Form.Label>
                                    <Form.Select name="courseId" required>
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.section}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control name="title" required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4}><Form.Control type="datetime-local" name="startDate" required label="Start" /></Col>
                            <Col md={4}><Form.Control type="datetime-local" name="endDate" required label="End" /></Col>
                            <Col md={4}><Form.Control type="number" name="duration" placeholder="Minutes" required /></Col>
                        </Row>

                        <hr />
                        <h5 className="mb-3">Questions</h5>
                        {questions.map((q, qIdx) => (
                            <Card key={qIdx} className="mb-3 bg-light border-0 p-3">
                                <Form.Group className="mb-2">
                                    <Form.Label>Question {qIdx + 1}</Form.Label>
                                    <Form.Control
                                        value={q.questionText}
                                        onChange={e => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                                        placeholder="Enter question text"
                                        required
                                    />
                                </Form.Group>
                                <Row>
                                    {q.options.map((opt, oIdx) => (
                                        <Col md={6} key={oIdx} className="mb-2">
                                            <Form.Control
                                                value={opt}
                                                onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                placeholder={`Option ${oIdx + 1}`}
                                                required
                                            />
                                        </Col>
                                    ))}
                                </Row>
                                <Form.Group className="mt-2">
                                    <Form.Label>Correct Option (0-3)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0" max="3"
                                        value={q.correctAnswer}
                                        onChange={e => handleQuestionChange(qIdx, 'correctAnswer', parseInt(e.target.value))}
                                    />
                                </Form.Group>
                            </Card>
                        ))}
                        <Button variant="outline-secondary" onClick={handleAddQuestion}><FiPlus /> Add Question</Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Publish Exam</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default TeacherExams;
