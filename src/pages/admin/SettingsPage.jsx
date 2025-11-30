import React from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const SettingsPage = () => {
    return (
        <div className="p-4">
            <h4 className="mb-4">System Settings</h4>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form>
                        <h6 className="fw-bold mb-3">General Information</h6>
                        <Row className="g-3 mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>School Name</Form.Label>
                                    <Form.Control defaultValue="EduCore University" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Academic Year</Form.Label>
                                    <Form.Control defaultValue="2024-2025" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <hr />
                        <div className="d-flex justify-content-end">
                            <Button className="btn-primary-custom">Save Changes</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SettingsPage;
