import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';

const SettingsPage = () => {
    return (
        <div className="p-4">
            <h4 className="mb-4">Settings</h4>
            <Row className="g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="text-center p-4">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60}}>
                                <i className="fas fa-lock fs-4 text-primary"></i>
                            </div>
                            <h5 className="fw-bold">Security</h5>
                            <p className="text-muted small">Change password and security questions.</p>
                            <Button variant="outline-primary" className="w-100 mt-2">Manage</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="text-center p-4">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60}}>
                                <i className="fas fa-bell fs-4 text-warning"></i>
                            </div>
                            <h5 className="fw-bold">Notifications</h5>
                            <p className="text-muted small">Manage email and push notifications.</p>
                            <Button variant="outline-primary" className="w-100 mt-2">Configure</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="text-center p-4">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60}}>
                                <i className="fas fa-palette fs-4 text-success"></i>
                            </div>
                            <h5 className="fw-bold">Appearance</h5>
                            <p className="text-muted small">Customize theme and layout preferences.</p>
                            <Button variant="outline-primary" className="w-100 mt-2">Customize</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SettingsPage;
