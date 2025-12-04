import React from 'react';
import { Container, Row, Col, Card, Form, Button, Accordion } from 'react-bootstrap';
import { FiHelpCircle, FiMessageSquare } from 'react-icons/fi';

const StudentHelp = () => {
    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Help & Support</h2>
            <Row>
                <Col md={6}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white fw-bold">Frequently Asked Questions</Card.Header>
                        <Card.Body>
                            <Accordion flush>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>How do I reset my password?</Accordion.Header>
                                    <Accordion.Body>Go to Settings &gt; Security to change your password. If lost, contact Admin.</Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Where can I see my grades?</Accordion.Header>
                                    <Accordion.Body>Navigate to Academic &gt; Grades & Report Card.</Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold">Contact Support</Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control placeholder="e.g. Login Issue" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control as="textarea" rows={4} />
                                </Form.Group>
                                <Button variant="primary" className="w-100">Send Message</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StudentHelp;
