import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';

const VerificationPage = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { verify } = useStorage();
    const navigate = useNavigate();

    useEffect(() => {
        const tempEmail = localStorage.getItem('tempEmail');
        if (tempEmail) setEmail(tempEmail);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await verify(email, code);
        setLoading(false);

        if (res.success) {
            localStorage.removeItem('tempEmail');
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
                        <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60, fontSize: 24}}>
                            <i className="fas fa-check"></i>
                        </div>
                        <h2 className="fw-bold text-success">Verify Account</h2>
                        <p className="text-muted">Enter the 6-digit code sent to your email.</p>
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
                            <Form.Label>Verification Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                required
                                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem' }}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100 py-2" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default VerificationPage;
