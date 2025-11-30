import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';
import logo from '../../assets/img/logo.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useStorage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login(email, password);
        setLoading(false);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
            // If verification needed, maybe redirect to verify?
             if (res.message.includes('verification')) {
                 // Store email temporarily to pre-fill verification
                 localStorage.setItem('tempEmail', email);
                 navigate('/verify');
             }
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Card className="shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        {/* <img src={logo} alt="Logo" width="60" className="mb-3" /> */}
                         <div className="bg-primary-custom text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60, fontSize: 24}}>
                            <i className="fas fa-graduation-cap"></i>
                        </div>
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
                        <Button variant="primary" type="submit" className="w-100 btn-primary-custom py-2" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p className="text-muted small">Don't have an account? <Link to="/register" className="text-primary-custom fw-bold">Register</Link></p>
                         <p className="text-muted small"><Link to="/forgot-password" className="text-muted">Forgot Password?</Link></p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default LoginPage;
