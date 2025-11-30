import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useStorage } from '../../context/StorageContext';

const LibraryPage = () => {
    const { currentUser } = useStorage();
    const [books, setBooks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const isStudent = currentUser?.role === 'Student';

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const { data } = await api.get('/library');
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/library', data);
            setShowModal(false);
            reset();
            fetchBooks();
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleBorrow = async (id) => {
        try {
            await api.post(`/library/${id}/borrow`);
            setMsg('Book borrowed successfully!');
            fetchBooks();
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
             setMsg(error.response?.data?.message || 'Failed to borrow');
             setTimeout(() => setMsg(''), 3000);
        }
    }

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-primary-custom">Library Management</h4>
                {!isStudent && (
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus me-2"></i> Add Book
                    </Button>
                )}
            </div>

            {msg && <Alert variant="info">{msg}</Alert>}

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
                <Table hover responsive className="mb-0 align-middle">
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
                             <tr><td colSpan="5" className="text-center py-5 text-muted">No books found.</td></tr>
                        ) : (
                            books.map(b => (
                                <tr key={b._id}>
                                    <td>{b.isbn}</td>
                                    <td className="fw-bold">{b.title}</td>
                                    <td>{b.author}</td>
                                    <td>
                                        <Badge bg={b.status === 'Available' ? 'success' : 'warning'}>
                                            {b.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {b.status === 'Available' && (
                                            <Button size="sm" variant="outline-primary" onClick={() => handleBorrow(b._id)}>
                                                Borrow
                                            </Button>
                                        )}
                                        {b.status === 'Borrowed' && isStudent && b.borrowedBy === currentUser._id && (
                                             <span className="text-muted small">Due: {new Date(b.dueDate).toLocaleDateString()}</span>
                                        )}
                                    </td>
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
                        <Button type="submit" className="btn-primary-custom" disabled={loading}>Save Book</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default LibraryPage;
