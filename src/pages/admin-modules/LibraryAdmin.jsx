import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../api/axios';

const LibraryAdmin = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const { data } = await api.get('/library');
            setBooks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.post('/library', {
                title: formData.get('title'),
                author: formData.get('author'),
                isbn: formData.get('isbn')
            });
            setShowModal(false);
            fetchBooks();
        } catch (error) {
            alert('Failed to add book');
        }
    };

    return (
        <Container fluid className="p-4">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Library Management</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Add Book</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>ISBN</th>
                                    <th>Status</th>
                                    <th>Borrowed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book._id}>
                                        <td className="fw-bold">{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>{book.isbn || '-'}</td>
                                        <td><Badge bg={book.status === 'Available' ? 'success' : 'warning'}>{book.status}</Badge></td>
                                        <td>{book.borrowedBy || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleAddBook}>
                    <Modal.Header closeButton><Modal.Title>Add New Book</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Book Title</Form.Label>
                            <Form.Control name="title" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Author</Form.Label>
                            <Form.Control name="author" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>ISBN (Optional)</Form.Label>
                            <Form.Control name="isbn" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Book</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default LibraryAdmin;
