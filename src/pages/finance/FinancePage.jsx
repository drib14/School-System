import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const FinancePage = () => {
    // Mock data
    const [invoices, setInvoices] = useState([
        { id: 'INV-001', student: 'John Doe', amount: 1500, status: 'Paid', date: '2023-10-01' },
        { id: 'INV-002', student: 'Jane Smith', amount: 1500, status: 'Pending', date: '2023-10-05' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        setInvoices([{ ...data, id: `INV-${Date.now()}`, status: 'Pending', date: new Date().toLocaleDateString() }, ...invoices]);
        setShowModal(false);
        reset();
    };

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
                            <h2>$125,000</h2>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className="bg-danger text-white h-100">
                        <Card.Body>
                            <h6 className="opacity-75">Pending</h6>
                            <h2>$12,500</h2>
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
                            <th className="ps-4">Invoice ID</th>
                            <th>Student</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(i => (
                            <tr key={i.id}>
                                <td className="ps-4 text-muted">{i.id}</td>
                                <td>{i.student}</td>
                                <td className="fw-bold">${i.amount}</td>
                                <td>{i.date}</td>
                                <td><Badge bg={i.status === 'Paid' ? 'success' : 'warning'}>{i.status}</Badge></td>
                            </tr>
                        ))}
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
                                    <Form.Control {...register('student', {required:true})} />
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
