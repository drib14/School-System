import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const ExamsPage = () => {
    const [exams, setExams] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        setExams([...exams, { ...data, id: Date.now(), status: 'Scheduled' }]);
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Examinations</h4>
                <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i> Schedule Exam
                </Button>
            </div>
            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Exam Title</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.length === 0 ? (
                            <tr><td colspan="4" className="text-center py-5 text-muted">No exams scheduled.</td></tr>
                        ) : (
                            exams.map(e => (
                                <tr key={e.id}>
                                    <td className="fw-bold">{e.title}</td>
                                    <td>{e.subject}</td>
                                    <td>{e.date}</td>
                                    <td><Badge bg="warning">{e.status}</Badge></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Schedule Exam</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Exam Title</Form.Label>
                                    <Form.Control {...register('title', {required:true})} placeholder="Midterm Exam" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control {...register('subject', {required:true})} placeholder="MATH101" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control type="date" {...register('date', {required:true})} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Schedule</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ExamsPage;
