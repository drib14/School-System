import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FiCoffee, FiShoppingCart } from 'react-icons/fi';

const menuItems = [
    { id: 1, name: 'Chicken Rice Meal', price: 120, category: 'Meals', img: '🍗' },
    { id: 2, name: 'Spaghetti', price: 85, category: 'Meals', img: '🍝' },
    { id: 3, name: 'Burger & Fries', price: 150, category: 'Snacks', img: '🍔' },
    { id: 4, name: 'Iced Coffee', price: 60, category: 'Drinks', img: '☕' },
    { id: 5, name: 'Fruit Salad', price: 45, category: 'Dessert', img: '🥗' },
];

const StudentCanteen = () => {
    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Canteen Pre-Order</h2>
                <Button variant="primary">
                    <FiShoppingCart className="me-2" /> My Cart <Badge bg="light" text="dark" className="ms-1">0</Badge>
                </Button>
            </div>

            <Row>
                {menuItems.map(item => (
                    <Col lg={3} md={4} sm={6} key={item.id} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <div className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10" style={{ height: '150px', fontSize: '4rem' }}>
                                {item.img}
                            </div>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="fw-bold mb-0">{item.name}</h5>
                                    <Badge bg="secondary">{item.category}</Badge>
                                </div>
                                <h5 className="text-primary fw-bold">₱{item.price.toFixed(2)}</h5>
                                <Button variant="outline-primary" className="w-100 mt-3">Add to Cart</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default StudentCanteen;
