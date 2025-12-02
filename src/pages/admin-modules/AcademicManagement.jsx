import React, { useState } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';

const AcademicManagement = () => {
    const [programs, setPrograms] = useState([
        { id: 1, name: 'BS Computer Science', code: 'BSCS', years: 4 },
        { id: 2, name: 'BS Information Tech', code: 'BSIT', years: 4 },
        { id: 3, name: 'Senior High - STEM', code: 'SHS-STEM', years: 2 },
    ]);
    const [showModal, setShowModal] = useState(false);

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Academic Programs</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Add Program</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Program Name</th>
                                <th>Code</th>
                                <th>Duration (Years)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.map(p => (
                                <tr key={p.id}>
                                    <td className="fw-bold">{p.name}</td>
                                    <td>{p.code}</td>
                                    <td>{p.years} Years</td>
                                    <td><Badge bg="success">Active</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form>
                    <Modal.Header closeButton><Modal.Title>Add Program</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Program Name</Form.Label>
                            <Form.Control placeholder="e.g. BS Nursing" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Code</Form.Label>
                            <Form.Control placeholder="BSN" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AcademicManagement;
