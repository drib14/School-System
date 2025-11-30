import React from 'react';
import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';

const ProfilePage = () => {
    const { currentUser } = useStorage();

    return (
        <div className="p-4">
            <h4 className="mb-4">My Profile</h4>
            <Row className="g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 text-center p-4">
                        <div className="user-avatar mx-auto mb-3" style={{width: 100, height: 100, fontSize: '2.5rem'}}>
                            {currentUser.name?.charAt(0)}
                        </div>
                        <h4 className="fw-bold mb-1">{currentUser.name}</h4>
                        <p className="text-muted mb-3">{currentUser.email}</p>
                        <Badge bg="primary" className="px-3 py-2">{currentUser.role}</Badge>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold">Essential Credentials</Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between py-3">
                                    <span className="text-muted">System ID</span>
                                    <span className="fw-bold">{currentUser.idNumber || currentUser.studentId || currentUser.teacherId || '-'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between py-3">
                                    <span className="text-muted">Verified Status</span>
                                    {currentUser.isVerified ? <span className="text-success fw-bold"><i className="fas fa-check-circle me-1"></i> Verified</span> : <span className="text-warning">Pending</span>}
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between py-3">
                                    <span className="text-muted">Date Joined</span>
                                    <span className="fw-bold">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                                </ListGroup.Item>

                                {currentUser.role === 'Student' && (
                                    <>
                                        <ListGroup.Item className="d-flex justify-content-between py-3">
                                            <span className="text-muted">Program/Course</span>
                                            <span className="fw-bold">{currentUser.course || 'N/A'}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between py-3">
                                            <span className="text-muted">Year Level</span>
                                            <span className="fw-bold">{currentUser.yearLevel || 'N/A'}</span>
                                        </ListGroup.Item>
                                    </>
                                )}

                                {currentUser.role === 'Teacher' && (
                                    <ListGroup.Item className="d-flex justify-content-between py-3">
                                        <span className="text-muted">Department</span>
                                        <span className="fw-bold">{currentUser.department || 'General Faculty'}</span>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
