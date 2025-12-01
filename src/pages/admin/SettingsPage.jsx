import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Switch } from 'react-bootstrap';
import { FiMonitor, FiDatabase, FiLock, FiGlobe, FiSave } from 'react-icons/fi';

const SettingsPage = () => {
    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">System Settings</h2>

            <Row>
                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold d-flex align-items-center">
                            <FiMonitor className="me-2 text-primary" /> School Information
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>School Name</Form.Label>
                                    <Form.Control defaultValue="EduCore University" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Email</Form.Label>
                                    <Form.Control defaultValue="admin@educore.edu" />
                                </Form.Group>
                                <Button variant="primary" size="sm" className="w-100">Update Profile</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold d-flex align-items-center">
                            <FiGlobe className="me-2 text-info" /> Academic Configuration
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Academic Year</Form.Label>
                                    <Form.Select>
                                        <option>2024-2025</option>
                                        <option>2023-2024</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Semester</Form.Label>
                                    <Form.Select>
                                        <option>1st Semester</option>
                                        <option>2nd Semester</option>
                                        <option>Summer</option>
                                    </Form.Select>
                                </Form.Group>
                                <Button variant="info" text="white" size="sm" className="w-100 text-white">Save Configuration</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold d-flex align-items-center">
                            <FiLock className="me-2 text-danger" /> System Maintenance
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Maintenance Mode</span>
                                <Form.Check type="switch" />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Allow Student Registrations</span>
                                <Form.Check type="switch" defaultChecked />
                            </div>
                            <hr />
                            <Button variant="outline-danger" size="sm" className="w-100 mb-2">Clear System Cache</Button>
                            <Button variant="danger" size="sm" className="w-100">Perform Backup</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SettingsPage;
