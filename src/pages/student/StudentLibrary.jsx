import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { FiSearch, FiBook } from 'react-icons/fi';
import api from '../../api/axios';

const StudentLibrary = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Library Catalog</h2>
                <InputGroup style={{ maxWidth: '300px' }}>
                    <InputGroup.Text className="bg-white"><FiSearch/></InputGroup.Text>
                    <Form.Control placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} />
                </InputGroup>
            </div>

            {loading ? <Spinner animation="border" /> : (
                <Row>
                    {filteredBooks.map(book => (
                        <Col lg={3} md={4} sm={6} key={book._id} className="mb-4">
                            <Card className="h-100 shadow-sm border-0">
                                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                                    <FiBook size={60} className="text-secondary opacity-25" />
                                </div>
                                <Card.Body>
                                    <h6 className="fw-bold mb-1 text-truncate">{book.title}</h6>
                                    <p className="small text-muted mb-2">{book.author}</p>
                                    <Badge bg={book.status === 'Available' ? 'success' : 'danger'}>{book.status}</Badge>
                                </Card.Body>
                                <Card.Footer className="bg-white border-0">
                                    <Button variant="outline-primary" size="sm" className="w-100" disabled={book.status !== 'Available'}>
                                        Reserve
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                    {filteredBooks.length === 0 && <p className="text-muted">No books found.</p>}
                </Row>
            )}
        </Container>
    );
};

export default StudentLibrary;
