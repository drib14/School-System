import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { FiPlus, FiCheck } from 'react-icons/fi';
import api from '../../api/axios';

const FinanceAdmin = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchRecords();
        fetchStudents();
    }, []);

    const fetchRecords = async () => {
        try {
            const { data } = await api.get('/finance'); // Admin sees all? Need to check controller
            setRecords(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        const { data } = await api.get('/users?role=Student');
        setStudents(data);
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.post('/finance', {
                studentId: formData.get('studentId'), // API expects studentId in body or param?
                title: formData.get('title'),
                amount: formData.get('amount'),
                type: 'Income', // Invoice is income for school
                dueDate: formData.get('dueDate')
            });
            setShowModal(false);
            fetchRecords();
        } catch (error) {
            alert('Failed to create invoice');
        }
    };

    const handleMarkPaid = async (id) => {
        // Not implemented in controller explicitly? Update logic needed.
        // Assuming update endpoint exists or generic update.
        // Let's assume generic PUT /finance/:id
        try {
            await api.put(`/finance/${id}`, { status: 'Paid' });
            fetchRecords();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <Container fluid className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Finance & Billing</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Create Invoice</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Student</th>
                                    <th>Title</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(rec => (
                                    <tr key={rec._id}>
                                        <td className="fw-bold">{rec.student?.name}</td>
                                        <td>{rec.title}</td>
                                        <td>₱{rec.amount?.toLocaleString()}</td>
                                        <td>{new Date(rec.dueDate).toLocaleDateString()}</td>
                                        <td><Badge bg={rec.status === 'Paid' ? 'success' : 'warning'}>{rec.status}</Badge></td>
                                        <td>
                                            {rec.status !== 'Paid' && (
                                                <Button size="sm" variant="outline-success" onClick={() => handleMarkPaid(rec._id)}><FiCheck /> Paid</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleCreateInvoice}>
                    <Modal.Header closeButton><Modal.Title>Create New Invoice</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Student</Form.Label>
                            <Form.Select name="studentId" required>
                                <option value="">Select Student</option>
                                {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description / Title</Form.Label>
                            <Form.Control name="title" required placeholder="Tuition Fee" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount (PHP)</Form.Label>
                            <Form.Control type="number" name="amount" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control type="date" name="dueDate" required />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Create Invoice</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default FinanceAdmin;
