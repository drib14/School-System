import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { FiPlus, FiUser } from 'react-icons/fi';
import api from '../../api/axios';

const HRManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await api.get('/users?role=Teacher'); // Assuming query support or filter client side
            // If api returns all, filter:
            const teachers = Array.isArray(data) ? data.filter(u => u.role === 'Teacher') : [];
            setStaff(teachers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            // Using auth/register or users create endpoint
            await api.post('/users', {
                name: formData.get('name'),
                email: formData.get('email'),
                password: 'password123', // Default
                role: 'Teacher',
                department: formData.get('department'),
                isVerified: true
            });
            setShowModal(false);
            fetchStaff();
            alert('Teacher added! Default password: password123');
        } catch (error) {
            alert('Failed to add teacher');
        }
    };

    return (
        <Container fluid className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">HR & Staff Management</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Add Teacher</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(u => (
                                    <tr key={u._id}>
                                        <td className="fw-bold">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded-circle p-2 me-2"><FiUser /></div>
                                                {u.name}
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.department || 'General'}</td>
                                        <td><Badge bg="success">Active</Badge></td>
                                        <td>
                                            <Button size="sm" variant="outline-primary">View</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleAddTeacher}>
                    <Modal.Header closeButton><Modal.Title>Add New Teacher</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control name="name" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control type="email" name="email" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Select name="department">
                                <option>Science</option>
                                <option>Math</option>
                                <option>English</option>
                                <option>History</option>
                                <option>Computer Science</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Create Account</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default HRManagement;
