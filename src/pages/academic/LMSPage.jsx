import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const LMSPage = () => {
    const { currentUser } = useStorage();
    const isStudent = currentUser.role === 'Student';
    const [showModal, setShowModal] = useState(false);
    // Mock classes
    const [classes, setClasses] = useState([{id: 1, name: 'Mathematics 101', section: 'Section A', teacher: 'Mr. Anderson'}]);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        setClasses([...classes, { ...data, id: Date.now(), teacher: currentUser.lastName }]);
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Learning Management System</h4>
                {!isStudent && (
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus me-2"></i> Create Classroom
                    </Button>
                )}
            </div>
            <Row className="g-4">
                {classes.map(c => (
                    <Col md={4} key={c.id}>
                        <Card className="shadow-sm border-0 h-100">
                            <div className="bg-primary-custom text-white p-4 rounded-top">
                                <h5 className="mb-0 fw-bold">{c.name}</h5>
                                <small className="opacity-75">{c.section}</small>
                            </div>
                            <Card.Body>
                                <p className="text-muted small mb-3">Teacher: {c.teacher}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <Badge bg="info">Active</Badge>
                                    <Button size="sm" variant="outline-primary">Enter Class</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Create Classroom</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Class Name</Form.Label>
                            <Form.Control {...register('name', {required:true})} placeholder="e.g. Physics 101" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Section</Form.Label>
                            <Form.Control {...register('section', {required:true})} placeholder="e.g. Section B" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default LMSPage;
