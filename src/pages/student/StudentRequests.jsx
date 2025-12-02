import React, { useState } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FiPlus, FiFileText } from 'react-icons/fi';

const StudentRequests = () => {
    const [requests, setRequests] = useState([
        { id: 1, type: 'Certificate of Enrollment', date: '2023-11-01', status: 'Completed' },
        { id: 2, type: 'Transcript of Records', date: '2023-11-20', status: 'Pending' },
    ]);
    const [showModal, setShowModal] = useState(false);

    const handleRequest = (e) => {
        e.preventDefault();
        // Mock Add
        const type = e.target.type.value;
        setRequests([...requests, { id: Date.now(), type, date: new Date().toISOString().split('T')[0], status: 'Pending' }]);
        setShowModal(false);
    };

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Document Requests</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> New Request</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Document Type</th>
                                <th>Date Requested</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r.id}>
                                    <td className="fw-bold"><FiFileText className="me-2"/>{r.type}</td>
                                    <td>{r.date}</td>
                                    <td><Badge bg={r.status === 'Completed' ? 'success' : 'warning'}>{r.status}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleRequest}>
                    <Modal.Header closeButton><Modal.Title>Request Document</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Document Type</Form.Label>
                            <Form.Select name="type">
                                <option>Certificate of Enrollment</option>
                                <option>Transcript of Records</option>
                                <option>Good Moral Character</option>
                                <option>Diploma (Certified True Copy)</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Submit Request</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default StudentRequests;
