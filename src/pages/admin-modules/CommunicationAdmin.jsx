import React, { useState } from 'react';
import { Container, Card, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { FiSend } from 'react-icons/fi';
import api from '../../api/axios';

const CommunicationAdmin = () => {
    const handleSend = async (e) => {
        e.preventDefault();
        alert('Message Sent (Mock)');
    };

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Communication Center</h2>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Tabs defaultActiveKey="email" className="mb-3">
                        <Tab eventKey="email" title="Email Blast">
                            <Form onSubmit={handleSend}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Recipients</Form.Label>
                                    <Form.Select>
                                        <option>All Students</option>
                                        <option>All Teachers</option>
                                        <option>All Parents</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control as="textarea" rows={5} required />
                                </Form.Group>
                                <Button variant="primary" type="submit"><FiSend className="me-2"/> Send Email</Button>
                            </Form>
                        </Tab>
                        <Tab eventKey="sms" title="SMS Notification">
                            <Form onSubmit={handleSend}>
                                <Form.Text className="d-block mb-3">Send urgent SMS alerts to registered numbers.</Form.Text>
                                <Form.Group className="mb-3">
                                    <Form.Label>Message (Max 160 chars)</Form.Label>
                                    <Form.Control as="textarea" rows={3} maxLength={160} />
                                </Form.Group>
                                <Button variant="warning" type="submit"><FiSend className="me-2"/> Send SMS</Button>
                            </Form>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CommunicationAdmin;
