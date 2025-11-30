import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useStorage } from '../../context/StorageContext';

const GradesPage = () => {
    const { currentUser } = useStorage();
    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]); // List of students for Teacher to select
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isTeacher = currentUser?.role === 'Teacher' || currentUser?.role === 'Admin';

    useEffect(() => {
        fetchGrades();
        if (isTeacher) {
            // In a real app, fetch students enrolled in teacher's class
            // For now, fetch all students? We don't have a 'getAllUsers' endpoint yet.
            // I'll create a temp endpoint or just mock it if I can't.
            // I created a 'users' route but didn't implement logic.
            // Let's implement a quick users fetch for students.
            fetchStudents();
        }
    }, []);

    const fetchGrades = async () => {
        try {
            const { data } = await api.get('/grades');
            setGrades(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        // Need an endpoint to get students.
        // I will implement GET /api/users?role=Student shortly.
        try {
             const { data } = await api.get('/users?role=Student');
             setStudents(data);
        } catch (e) {
            console.log("Error fetching students (endpoint might not exist yet)", e);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            await api.post('/grades', data);
            setShowModal(false);
            reset();
            fetchGrades();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to save grade');
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-primary-custom">Academic Grades</h4>
                    <p className="text-muted">K-12 Grading System (WW 25%, PT 50%, QA 25%)</p>
                </div>
                {isTeacher && (
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus me-2"></i> Input Grades
                    </Button>
                )}
            </div>

            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Student</th>
                            <th>Subject</th>
                            <th>Quarter</th>
                            <th className="text-center">Written Work</th>
                            <th className="text-center">Perf. Task</th>
                            <th className="text-center">Quarterly</th>
                            <th className="text-center">Initial</th>
                            <th className="text-center">Final (Transmuted)</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-5 text-muted">No grades found.</td></tr>
                        ) : (
                            grades.map(g => (
                                <tr key={g._id}>
                                    <td>
                                        <div className="fw-bold">{g.student?.name}</div>
                                        <div className="small text-muted">{g.student?.email}</div>
                                    </td>
                                    <td>{g.subject}</td>
                                    <td><Badge bg="secondary">Q{g.quarter}</Badge></td>
                                    <td className="text-center">{g.writtenWork}</td>
                                    <td className="text-center">{g.performanceTask}</td>
                                    <td className="text-center">{g.quarterlyAssessment}</td>
                                    <td className="text-center text-muted">{g.initialGrade?.toFixed(2)}</td>
                                    <td className="text-center fw-bold text-primary-custom">{g.finalGrade}</td>
                                    <td>
                                        {g.finalGrade >= 75 ?
                                            <Badge bg="success">Passed</Badge> :
                                            <Badge bg="danger">Failed</Badge>
                                        }
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>Input Grades</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Student</Form.Label>
                                    <Form.Select {...register('studentId', {required: true})}>
                                        <option value="">Select Student...</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control {...register('subject', {required: true})} placeholder="e.g. Mathematics" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Quarter</Form.Label>
                                    <div className="d-flex gap-3">
                                        {[1, 2, 3, 4].map(q => (
                                            <Form.Check
                                                key={q}
                                                type="radio"
                                                label={`Q${q}`}
                                                value={q}
                                                {...register('quarter', {required: true})}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Written Work (25%)</Form.Label>
                                    <Form.Control type="number" step="0.01" {...register('ww', {required: true, min: 0, max: 100})} placeholder="0-100" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Performance Task (50%)</Form.Label>
                                    <Form.Control type="number" step="0.01" {...register('pt', {required: true, min: 0, max: 100})} placeholder="0-100" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Quarterly Assessment (25%)</Form.Label>
                                    <Form.Control type="number" step="0.01" {...register('qa', {required: true, min: 0, max: 100})} placeholder="0-100" />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom" disabled={loading}>
                            {loading ? 'Saving...' : 'Compute & Save'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default GradesPage;
