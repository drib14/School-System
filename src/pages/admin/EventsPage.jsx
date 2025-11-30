import React, { useState } from 'react';
import { Card, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const EventsPage = () => {
    const { getItems, saveItem, STORAGE_KEYS, currentUser } = useStorage();
    const events = getItems(STORAGE_KEYS.EVENTS);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const isStudent = currentUser.role === 'Student';

    const onSubmit = (data) => {
        saveItem(STORAGE_KEYS.EVENTS, { ...data, id: Date.now().toString() });
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Events & Calendar</h4>
                {!isStudent && (
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="fas fa-calendar-plus me-2"></i> Create Event
                    </Button>
                )}
            </div>
            <Row className="g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small mb-3">Upcoming</h6>

                            <Card className="border-start border-4 border-primary mb-3">
                                <Card.Body className="p-3">
                                    <h6 className="fw-bold mb-1">Foundation Day</h6>
                                    <small className="text-muted">Nov 15, 2024</small>
                                </Card.Body>
                            </Card>

                            {events.map(e => (
                                <Card key={e.id} className="border-start border-4 border-info mb-3">
                                    <Card.Body className="p-3">
                                        <h6 className="fw-bold mb-1">{e.title}</h6>
                                        <small className="text-muted">{e.date}</small>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100 p-5 text-center bg-light">
                        <h5 className="text-muted">Calendar View Placeholder</h5>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Create Event</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Event Title</Form.Label>
                            <Form.Control {...register('title', {required:true})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control type="date" {...register('date', {required:true})} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} {...register('description')} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Create Event</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default EventsPage;
