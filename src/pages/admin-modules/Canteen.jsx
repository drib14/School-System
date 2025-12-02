import React, { useState } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';

const Canteen = () => {
    const [menu, setMenu] = useState([
        { id: 1, name: 'Chicken Rice', price: 120, stock: 50 },
        { id: 2, name: 'Spaghetti', price: 85, stock: 30 },
    ]);
    const [showModal, setShowModal] = useState(false);

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Canteen Inventory</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Add Item</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Item Name</th>
                                <th>Price</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menu.map(m => (
                                <tr key={m.id}>
                                    <td className="fw-bold">{m.name}</td>
                                    <td>₱{m.price}</td>
                                    <td>{m.stock}</td>
                                    <td><Badge bg={m.stock > 10 ? 'success' : 'danger'}>{m.stock > 10 ? 'Available' : 'Low Stock'}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form>
                    <Modal.Header closeButton><Modal.Title>Add Menu Item</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Item Name</Form.Label>
                            <Form.Control />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Initial Stock</Form.Label>
                            <Form.Control type="number" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary">Save Item</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Canteen;
