import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';
import logo from '../../assets/img/logo.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useStorage();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const res = login(email, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Card className="shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <img src={logo} alt="Logo" width="60" className="mb-3" />
                        <h2 className="fw-bold text-primary-custom">EduCore</h2>
                        <p className="text-muted">Sign in to your account</p>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 btn-primary-custom py-2">
                            Login
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p className="text-muted small">Don't have an account? <Link to="/register" className="text-primary-custom fw-bold">Register</Link></p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default LoginPage;
