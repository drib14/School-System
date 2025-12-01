import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { FiClock, FiFileText } from 'react-icons/fi';
import api from '../../api/axios';
import useMyCourses from '../../hooks/useMyCourses';

const StudentExams = () => {
    const { courses } = useMyCourses(); // Reuse to get my courses if needed, but endpoint handles it better if we pass courseId?
    // Actually, let's fetch ALL exams for my courses.
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    // Taking Exam State
    const [activeExam, setActiveExam] = useState(null);
    const [answers, setAnswers] = useState({}); // { qIdx: optionIdx }
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            // Fetch exams for all my courses.
            // Simplified: Fetch all active exams I have access to.
            // Currently backend requires courseId or fetches all.
            // I'll fetch all.
            const { data } = await api.get('/exams');
            // Filter client side to active for now if backend sends all
            setExams(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = (exam) => {
        setActiveExam(exam);
        setAnswers({});
        setResult(null);
    };

    const handleSubmit = async () => {
        if (!activeExam) return;
        // Format answers
        const answerArray = Object.keys(answers).map(key => ({
            questionIndex: parseInt(key),
            selectedOption: answers[key]
        }));

        try {
            const { data } = await api.post(`/exams/${activeExam._id}/submit`, { answers: answerArray });
            setResult(data);
            setActiveExam(null);
            alert(`Exam Submitted! Score: ${data.score}/${data.totalPoints}`);
        } catch (error) {
            alert('Failed to submit exam');
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Exams & Quizzes</h2>

            {loading ? <Spinner animation="border" /> : (
                <Row>
                    {exams.length === 0 ? <Col>No exams available.</Col> :
                        exams.map(exam => (
                            <Col md={6} lg={4} key={exam._id} className="mb-4">
                                <Card className="h-100 shadow-sm border-0">
                                    <Card.Body>
                                        <Badge bg="primary" className="mb-2">{exam.course?.code}</Badge>
                                        <h5 className="fw-bold">{exam.title}</h5>
                                        <p className="text-muted small mb-3">
                                            {new Date(exam.startDate).toLocaleString()} <br/>
                                            Duration: {exam.duration} mins
                                        </p>
                                        <Button
                                            variant="outline-primary"
                                            className="w-100"
                                            onClick={() => handleStartExam(exam)}
                                            disabled={!exam.isActive}
                                        >
                                            Take Exam
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    }
                </Row>
            )}

            {/* Exam Modal */}
            <Modal show={!!activeExam} onHide={() => setActiveExam(null)} size="lg" backdrop="static">
                <Modal.Header>
                    <Modal.Title>{activeExam?.title}</Modal.Title>
                    <div className="ms-auto"><Badge bg="warning" text="dark"><FiClock /> {activeExam?.duration} mins</Badge></div>
                </Modal.Header>
                <Modal.Body>
                    {activeExam?.questions.map((q, idx) => (
                        <Card key={idx} className="mb-3 border-0 bg-light p-3">
                            <h6 className="fw-bold mb-3">{idx + 1}. {q.questionText} <span className="text-muted small">({q.points} pts)</span></h6>
                            {q.options.map((opt, oIdx) => (
                                <Form.Check
                                    key={oIdx}
                                    type="radio"
                                    name={`q-${idx}`}
                                    label={opt}
                                    id={`q-${idx}-${oIdx}`}
                                    onChange={() => setAnswers({...answers, [idx]: oIdx})}
                                    checked={answers[idx] === oIdx}
                                    className="mb-2"
                                />
                            ))}
                        </Card>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setActiveExam(null)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>Submit Exam</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StudentExams;
