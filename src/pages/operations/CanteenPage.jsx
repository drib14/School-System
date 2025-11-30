import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';

const CanteenPage = () => {
    const { currentUser } = useStorage();
    const isStudent = currentUser.role === 'Student';

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>{isStudent ? 'Canteen Menu & Ordering' : 'Canteen & POS'}</h4>
                {!isStudent && (
                    <Button className="btn-primary-custom"><i className="fas fa-cash-register me-2"></i> Open POS</Button>
                )}
                {isStudent && (
                    <Button className="btn-primary-custom"><i className="fas fa-shopping-cart me-2"></i> My Cart</Button>
                )}
            </div>
            <Row className="g-4">
                <Col md={isStudent ? 12 : 8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Menu Items</h6></Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={isStudent ? 3 : 4}>
                                    <Card className="h-100 text-center p-3 border-light shadow-sm">
                                        <div style={{fontSize: '3rem'}}>🍔</div>
                                        <h6 className="mb-1 mt-2">Burger</h6>
                                        <p className="text-primary fw-bold mb-2">₱50.00</p>
                                        <Button size="sm" variant={isStudent ? "primary" : "outline-primary"} className={isStudent ? "btn-primary-custom" : ""}>
                                            {isStudent ? 'Add to Cart' : 'Add to Order'}
                                        </Button>
                                    </Card>
                                </Col>
                                <Col md={isStudent ? 3 : 4}>
                                    <Card className="h-100 text-center p-3 border-light shadow-sm">
                                        <div style={{fontSize: '3rem'}}>🥤</div>
                                        <h6 className="mb-1 mt-2">Soda</h6>
                                        <p className="text-primary fw-bold mb-2">₱25.00</p>
                                        <Button size="sm" variant={isStudent ? "primary" : "outline-primary"} className={isStudent ? "btn-primary-custom" : ""}>
                                            {isStudent ? 'Add to Cart' : 'Add to Order'}
                                        </Button>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                {!isStudent && (
                    <Col md={4}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Current Order</h6></Card.Header>
                            <Card.Body className="d-flex align-items-center justify-content-center text-muted">
                                No items
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default CanteenPage;
