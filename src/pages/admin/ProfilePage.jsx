import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FiUser, FiMail, FiHash, FiShield, FiBriefcase } from 'react-icons/fi';
import api from '../../api/axios';
import { useStorage } from '../../context/StorageContext';

const ProfilePage = () => {
    const { currentUser, setCurrentUser } = useStorage(); // We might update context
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setProfile(data);
                // Optional: Update local storage if needed
                // setCurrentUser(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                setProfile(currentUser); // Fallback
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [currentUser]);

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (!profile) return <div className="text-center p-5">Profile not found.</div>;

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">My Profile</h2>

            <Row>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm border-0 text-center p-4 h-100">
                        <div className="mx-auto mb-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px', fontSize: '3rem', color: 'var(--bs-primary)' }}>
                            {profile.name.charAt(0)}
                        </div>
                        <h4 className="fw-bold">{profile.name}</h4>
                        <p className="text-muted mb-2">{profile.role}</p>
                        <Badge bg={profile.isVerified ? 'success' : 'warning'}>
                            {profile.isVerified ? 'Verified Account' : 'Pending Verification'}
                        </Badge>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3">Account Details</Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col sm={4} className="text-muted d-flex align-items-center"><FiHash className="me-2"/> System ID</Col>
                                <Col sm={8} className="fw-bold">{profile.idNumber || 'N/A'}</Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={4} className="text-muted d-flex align-items-center"><FiMail className="me-2"/> Email Address</Col>
                                <Col sm={8} className="fw-bold">{profile.email}</Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={4} className="text-muted d-flex align-items-center"><FiShield className="me-2"/> Role / Access</Col>
                                <Col sm={8} className="fw-bold">{profile.role}</Col>
                            </Row>
                            {profile.role === 'Teacher' && (
                                <>
                                    <hr />
                                    <Row className="mb-3">
                                        <Col sm={4} className="text-muted d-flex align-items-center"><FiBriefcase className="me-2"/> Department</Col>
                                        <Col sm={8} className="fw-bold">{profile.department || 'General'}</Col>
                                    </Row>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
