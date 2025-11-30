import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/courses', data);
            setShowModal(false);
            reset();
            fetchCourses();
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
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
                            <th>Schedule</th>
                            <th>Room</th>
                            <th>Teacher</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                             <tr><td colSpan="5" className="text-center py-4 text-muted">No courses found.</td></tr>
                        ) : (
                            courses.map(c => (
                                <tr key={c._id}>
                                    <td className="ps-4 fw-bold text-primary-custom">{c.code}</td>
                                    <td>{c.name}</td>
                                    <td>{c.schedule}</td>
                                    <td>{c.room}</td>
                                    <td>{c.teacher?.name || '-'}</td>
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
                            <Col md={12}><Form.Control placeholder="Course Name" {...register('name', {required:true})} /></Col>
                            <Col md={12}><Form.Control placeholder="Schedule (e.g. Mon/Wed 10am)" {...register('schedule')} /></Col>
                            <Col md={12}><Form.Control placeholder="Room" {...register('room')} /></Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom" disabled={loading}>Save Course</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default CoursesPage;
