import React from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { FiSend } from 'react-icons/fi';

const TeacherCommunication = () => {
    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Class Communication</h2>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Class</Form.Label>
                            <Form.Select>
                                <option>Science G7-A</option>
                                <option>Math G8-B</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control as="textarea" rows={4} placeholder="Announcement for students..." />
                        </Form.Group>
                        <Button variant="primary"><FiSend className="me-2"/> Send Announcement</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TeacherCommunication;
