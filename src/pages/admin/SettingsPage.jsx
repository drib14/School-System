import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { FiMonitor, FiDatabase, FiLock, FiGlobe, FiSave } from 'react-icons/fi';
import api from '../../api/axios';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        schoolName: '',
        currentTerm: '',
        enrollmentOpen: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setSettings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings', settings);
            alert('Settings Saved');
        } catch (error) {
            alert('Failed to save settings');
        }
    };

    if (loading) return <Spinner animation="border" />;

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
                            <Form onSubmit={handleSave}>
                                <Form.Group className="mb-3">
                                    <Form.Label>School Name</Form.Label>
                                    <Form.Control
                                        value={settings.schoolName}
                                        onChange={e => setSettings({...settings, schoolName: e.target.value})}
                                    />
                                </Form.Group>
                                <Button variant="primary" size="sm" className="w-100" type="submit">Update Profile</Button>
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
                            <Form onSubmit={handleSave}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Semester/Term</Form.Label>
                                    <Form.Select
                                        value={settings.currentTerm}
                                        onChange={e => setSettings({...settings, currentTerm: e.target.value})}
                                    >
                                        <option>1st Semester</option>
                                        <option>2nd Semester</option>
                                        <option>Summer</option>
                                    </Form.Select>
                                </Form.Group>
                                <Button variant="info" size="sm" className="w-100 text-white" type="submit">Save Configuration</Button>
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
                                <span>Allow Enrollment</span>
                                <Form.Check
                                    type="switch"
                                    checked={settings.enrollmentOpen}
                                    onChange={e => {
                                        const newVal = e.target.checked;
                                        setSettings(prev => ({...prev, enrollmentOpen: newVal}));
                                        // Save immediately
                                        api.put('/settings', { ...settings, enrollmentOpen: newVal });
                                    }}
                                />
                            </div>
                            <hr />
                            <Button variant="danger" size="sm" className="w-100">Perform Backup</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SettingsPage;
