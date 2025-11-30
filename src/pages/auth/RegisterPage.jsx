import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';
import logo from '../../assets/img/logo.png';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', role: 'Student'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useStorage();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const res = register(formData);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(res.message);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Card className="shadow-lg border-0" style={{ maxWidth: '600px', width: '100%' }}>
                <Card.Body className="p-4 p-md-5">
                    <div className="text-center mb-4">
                        <img src={logo} alt="Logo" width="60" className="mb-3" />
                        <h2 className="fw-bold text-primary-custom">Create Account</h2>
                        <p className="text-muted">Join the EduCore community</p>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Registration successful! Redirecting to login...</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control name="firstName" onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control name="lastName" onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control type="email" name="email" onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                             <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control type="tel" name="phone" onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Role</Form.Label>
                                    <Form.Select name="role" onChange={handleChange}>
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Parent">Parent</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button variant="primary" type="submit" className="w-100 btn-primary-custom py-2 mt-4">
                            Register
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p className="text-muted small">Already have an account? <Link to="/login" className="text-primary-custom fw-bold">Login</Link></p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegisterPage;
