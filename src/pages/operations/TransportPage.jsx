import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const TransportPage = () => {
    const { currentUser } = useStorage();
    const isStudent = currentUser.role === 'Student';
    const [showModal, setShowModal] = useState(false);
    // Mock routes for now, ideally fetch from storage
    const [routes, setRoutes] = useState([{id: 1, name: 'Route A (North)', bus: 'BUS-001', driver: 'Mike Ross'}]);

    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        setRoutes([...routes, { ...data, id: Date.now() }]);
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>{isStudent ? 'My Transport' : 'Transport & Fleet'}</h4>
                {!isStudent && (
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus me-2"></i> Add Route
                    </Button>
                )}
            </div>

            <div className="row g-4">
                <div className={isStudent ? "col-12" : "col-md-8"}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white">
                            <h6 className="mb-0 fw-bold">{isStudent ? 'My Assigned Bus' : 'Active Routes'}</h6>
                        </Card.Header>
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Route</th>
                                    <th>Bus No.</th>
                                    <th>Driver</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.name}</td>
                                        <td>{r.bus}</td>
                                        <td>{r.driver}</td>
                                        <td><Badge bg="success">On Route</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </div>

                {!isStudent && (
                    <div className="col-md-4">
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Fleet Status</h6></Card.Header>
                            <Card.Body>
                                <h3 className="fw-bold mb-0">12</h3>
                                <p className="text-muted small">Total Buses</p>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <span>Active</span>
                                    <span className="text-success fw-bold">10</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Maintenance</span>
                                    <span className="text-warning fw-bold">2</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Add New Route</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Route Name</Form.Label>
                            <Form.Control {...register('name', {required:true})} placeholder="e.g. Route B (South)" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bus Number</Form.Label>
                            <Form.Control {...register('bus', {required:true})} placeholder="e.g. BUS-002" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Driver Name</Form.Label>
                            <Form.Control {...register('driver', {required:true})} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Save Route</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default TransportPage;
