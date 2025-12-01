import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const FinancePage = () => {
    const [finance, setFinance] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        fetchFinance();
        fetchStudents();
    }, []);

    const fetchFinance = async () => {
        try {
            const { data } = await api.get('/finance');
            setFinance(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/users?role=Student');
            setStudents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (data) => {
        try {
            await api.post('/finance', {
                studentId: data.student,
                title: 'Miscellaneous Invoice', // Or add field for title
                amount: data.amount,
                dueDate: new Date() // Or add field
            });
            setShowModal(false);
            reset();
            fetchFinance();
        } catch (error) {
            console.error(error);
            alert('Failed to create invoice');
        }
    };

    const totalRevenue = finance
        .filter(f => f.type === 'Income' && f.status === 'Paid')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingAmount = finance
        .filter(f => f.status === 'Pending')
        .reduce((acc, curr) => acc + curr.amount, 0);

    if (loading) return <div className="p-4 text-center">Loading Finance Data...</div>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Finance & Billing</h4>
                <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i> Create Invoice
                </Button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <Card className="bg-primary-custom text-white h-100">
                        <Card.Body>
                            <h6 className="opacity-75">Total Revenue</h6>
                            <h2>₱ {totalRevenue.toLocaleString()}</h2>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className="bg-danger text-white h-100">
                        <Card.Body>
                            <h6 className="opacity-75">Pending</h6>
                            <h2>₱ {pendingAmount.toLocaleString()}</h2>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white">
                    <h6 className="mb-0 fw-bold">Recent Transactions</h6>
                </Card.Header>
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Student</th>
                            <th>Title</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finance.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-muted">No records found.</td></tr>
                        ) : (
                            finance.map(f => (
                                <tr key={f._id}>
                                    <td>{f.student?.name || 'Unknown'}</td>
                                    <td>{f.title}</td>
                                    <td className="fw-bold">₱ {f.amount.toLocaleString()}</td>
                                    <td>{new Date(f.dueDate).toLocaleDateString()}</td>
                                    <td>
                                        <Badge bg={f.status === 'Paid' ? 'success' : 'warning'}>
                                            {f.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Create Invoice</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Student Name</Form.Label>
                                    <Form.Select {...register('student', {required:true})}>
                                        <option value="">Select Student...</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control type="number" {...register('amount', {required:true})} />
                                </Form.Group>
                            </Col>
                        </Row>
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

export default FinancePage;
