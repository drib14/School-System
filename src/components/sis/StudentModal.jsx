import React, { useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const StudentModal = ({ show, handleClose, student }) => {
    const { register, handleSubmit, reset, setValue } = useForm();
    const { register: registerUser, updateItem, STORAGE_KEYS } = useStorage();

    useEffect(() => {
        if (student) {
            setValue('firstName', student.firstName);
            setValue('lastName', student.lastName);
            setValue('email', student.email);
            setValue('phone', student.phone || '');
            setValue('status', student.status);
            setValue('id', student.id); // Hidden
        } else {
            reset({ firstName: '', lastName: '', email: '', phone: '', status: 'Active' });
        }
    }, [student, show, setValue, reset]);

    const onSubmit = (data) => {
        if (student) {
            // Update
            updateItem(STORAGE_KEYS.USERS, student.id, data);
        } else {
            // Create
            registerUser({ ...data, role: 'Student', password: 'password123' }); // Default password
        }
        handleClose();
        reset();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{student ? 'Edit Student' : 'Add New Student'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>First Name</Form.Label>
                                <Form.Control {...register('firstName', { required: true })} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control {...register('lastName', { required: true })} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" {...register('email', { required: true })} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                             <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control {...register('phone')} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select {...register('status')}>
                                    <option>Active</option>
                                    <option>Pending</option>
                                    <option>Suspended</option>
                                    <option>Graduated</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="primary" className="btn-primary-custom">Save Changes</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default StudentModal;
