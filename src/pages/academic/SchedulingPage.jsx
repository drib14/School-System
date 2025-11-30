import React, { useState } from 'react';
import { Card, Button, Modal, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const SchedulingPage = () => {
    // Mock Schedule Storage
    const [schedules, setSchedules] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        setSchedules([...schedules, { ...data, id: Date.now() }]);
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Class Scheduling</h4>
                <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i> Create Schedule
                </Button>
            </div>

            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Subject</th>
                            <th>Time</th>
                            <th>Days</th>
                            <th>Room</th>
                            <th>Teacher</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length === 0 ? (
                            <tr><td colspan="6" className="text-center py-5 text-muted">No schedules created yet.</td></tr>
                        ) : (
                            schedules.map(s => (
                                <tr key={s.id}>
                                    <td className="fw-bold">{s.subject}</td>
                                    <td>{s.startTime} - {s.endTime}</td>
                                    <td>{s.days}</td>
                                    <td>{s.room}</td>
                                    <td>{s.teacher}</td>
                                    <td><Badge bg="success">Active</Badge></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Create Class Schedule</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Subject Code</Form.Label>
                                    <Form.Control {...register('subject', {required:true})} placeholder="e.g. MATH101" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Start Time</Form.Label>
                                    <Form.Control type="time" {...register('startTime', {required:true})} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>End Time</Form.Label>
                                    <Form.Control type="time" {...register('endTime', {required:true})} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Days</Form.Label>
                                    <Form.Select {...register('days')}>
                                        <option>Mon / Wed / Fri</option>
                                        <option>Tue / Thu</option>
                                        <option>Saturday</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Room</Form.Label>
                                    <Form.Control {...register('room')} placeholder="Rm 301" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Teacher</Form.Label>
                                    <Form.Control {...register('teacher')} placeholder="Mr. Smith" />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Save Schedule</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default SchedulingPage;
