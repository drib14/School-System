import React, { useState } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FiPlus, FiTruck } from 'react-icons/fi';

const Transport = () => {
    const [routes, setRoutes] = useState([
        { id: 1, route: 'Route A - Downtown', bus: 'Bus 101', driver: 'Mike T.', status: 'Active' },
        { id: 2, route: 'Route B - North Hills', bus: 'Bus 102', driver: 'Sarah L.', status: 'Active' },
    ]);
    const [showModal, setShowModal] = useState(false);

    return (
        <Container fluid className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Transport Management</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Add Route</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Route Name</th>
                                <th>Bus Number</th>
                                <th>Driver</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routes.map(r => (
                                <tr key={r.id}>
                                    <td className="fw-bold">{r.route}</td>
                                    <td>{r.bus}</td>
                                    <td>{r.driver}</td>
                                    <td><Badge bg="success">{r.status}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Add Transport Route</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Route Name</Form.Label>
                            <Form.Control placeholder="e.g. Route C" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bus Number</Form.Label>
                            <Form.Control placeholder="Bus 103" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setShowModal(false)}>Save</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Transport;
