import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const CoursesPage = () => {
    const { getItems, saveItem, updateItem, STORAGE_KEYS } = useStorage();
    const courses = getItems(STORAGE_KEYS.COURSES);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        saveItem(STORAGE_KEYS.COURSES, { ...data, id: Date.now().toString(), status: 'Active' });
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Curriculum & Courses</h4>
                <Button variant="primary" className="btn-primary-custom" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i> Add Course
                </Button>
            </div>

            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Code</th>
                            <th>Course Title</th>
                            <th>Units</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                             <tr><td colspan="5" className="text-center py-4 text-muted">No courses found.</td></tr>
                        ) : (
                            courses.map(c => (
                                <tr key={c.id}>
                                    <td className="ps-4 fw-bold text-primary-custom">{c.code}</td>
                                    <td>{c.title}</td>
                                    <td>{c.units}</td>
                                    <td>{c.type}</td>
                                    <td><Badge bg="success" className="badge-custom">Active</Badge></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Add New Course</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}><Form.Control placeholder="Course Code (e.g. MATH101)" {...register('code', {required:true})} /></Col>
                            <Col md={12}><Form.Control placeholder="Course Title" {...register('title', {required:true})} /></Col>
                            <Col md={6}><Form.Control type="number" placeholder="Units" {...register('units', {required:true})} /></Col>
                            <Col md={6}>
                                <Form.Select {...register('type')}>
                                    <option>Major</option>
                                    <option>Minor</option>
                                    <option>Elective</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Save Course</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default CoursesPage;
