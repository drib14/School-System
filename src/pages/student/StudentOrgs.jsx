import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FiUsers } from 'react-icons/fi';

const StudentOrgs = () => {
    const orgs = [
        { name: 'Student Council', category: 'Governance', members: 15 },
        { name: 'Computer Society', category: 'Academic', members: 40 },
        { name: 'Glee Club', category: 'Arts', members: 20 },
    ];

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Student Organizations</h2>
            <Row>
                {orgs.map((org, idx) => (
                    <Col md={4} key={idx} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="text-center">
                                <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                                    <FiUsers size={30} className="text-primary" />
                                </div>
                                <h5 className="fw-bold">{org.name}</h5>
                                <Badge bg="info" className="mb-3">{org.category}</Badge>
                                <p className="text-muted">{org.members} Members</p>
                                <Button variant="outline-primary" size="sm">Join Organization</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default StudentOrgs;
