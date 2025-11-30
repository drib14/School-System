import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const LibraryPage = () => {
    const { getItems, saveItem, STORAGE_KEYS, currentUser } = useStorage();
    const books = getItems(STORAGE_KEYS.LIBRARY); // Assuming LIBRARY key exists or I need to add it
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const isStudent = currentUser.role === 'Student';

    const onSubmit = (data) => {
        saveItem(STORAGE_KEYS.LIBRARY, { ...data, id: Date.now().toString(), status: 'Available' });
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Library Management</h4>
                {!isStudent && (
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus me-2"></i> Add Book
                    </Button>
                )}
            </div>
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text className="bg-white"><i className="fas fa-search"></i></InputGroup.Text>
                        <Form.Control placeholder="Search catalog..." />
                        <Button variant="outline-primary">Search</Button>
                    </InputGroup>
                </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>ISBN</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                             <tr>
                                <td>978-3-16-148410-0</td>
                                <td>Clean Code</td>
                                <td>Robert C. Martin</td>
                                <td><Badge bg="success">Available</Badge></td>
                                <td><Button size="sm" variant="outline-primary">Borrow</Button></td>
                            </tr>
                        ) : (
                            books.map(b => (
                                <tr key={b.id}>
                                    <td>{b.isbn}</td>
                                    <td>{b.title}</td>
                                    <td>{b.author}</td>
                                    <td><Badge bg="success">{b.status}</Badge></td>
                                    <td><Button size="sm" variant="outline-primary">Borrow</Button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Add New Book</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}><Form.Control placeholder="Title" {...register('title', {required:true})} /></Col>
                            <Col md={12}><Form.Control placeholder="Author" {...register('author', {required:true})} /></Col>
                            <Col md={12}><Form.Control placeholder="ISBN" {...register('isbn', {required:true})} /></Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Save Book</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default LibraryPage;
