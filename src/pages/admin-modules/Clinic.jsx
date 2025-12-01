import React, { useState } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { FiPlus, FiActivity } from 'react-icons/fi';

const Clinic = () => {
    const [visits, setVisits] = useState([
        { id: 1, student: 'Alice Smith', date: '2023-11-20', reason: 'Headache', treatment: 'Paracetamol', status: 'Resolved' },
        { id: 2, student: 'Bob Jones', date: '2023-11-21', reason: 'Fever', treatment: 'Sent Home', status: 'Follow-up' },
    ]);
    const [showModal, setShowModal] = useState(false);

    const handleAddVisit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newVisit = {
            id: visits.length + 1,
            student: formData.get('student'),
            date: new Date().toISOString().split('T')[0],
            reason: formData.get('reason'),
            treatment: formData.get('treatment'),
            status: 'New'
        };
        setVisits([newVisit, ...visits]);
        setShowModal(false);
    };

    return (
        <Container fluid className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Clinic & Health Records</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> New Visit Log</Button>
            </div>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="bg-success text-white shadow-sm border-0">
                        <Card.Body>
                            <h3 className="fw-bold mb-0">98%</h3>
                            <small>Health Compliance</small>
                        </Card.Body>
                    </Card>
                </Col>
                 <Col md={4}>
                    <Card className="bg-warning text-dark shadow-sm border-0">
                        <Card.Body>
                            <h3 className="fw-bold mb-0">5</h3>
                            <small>Active Cases</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white fw-bold">Recent Visits</Card.Header>
                <Card.Body>
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Student Name</th>
                                <th>Date</th>
                                <th>Reason / Symptoms</th>
                                <th>Action / Treatment</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visits.map(v => (
                                <tr key={v.id}>
                                    <td className="fw-bold">{v.student}</td>
                                    <td>{v.date}</td>
                                    <td>{v.reason}</td>
                                    <td>{v.treatment}</td>
                                    <td><Badge bg={v.status === 'Resolved' ? 'success' : 'warning'}>{v.status}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleAddVisit}>
                    <Modal.Header closeButton><Modal.Title>Log Clinic Visit</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Student Name</Form.Label>
                            <Form.Control name="student" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Symptoms / Reason</Form.Label>
                            <Form.Control name="reason" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Treatment Given</Form.Label>
                            <Form.Control as="textarea" name="treatment" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" type="submit">Save Log</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Clinic;
