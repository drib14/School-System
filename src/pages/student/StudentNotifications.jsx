import React from 'react';
import { Container, Card, ListGroup, Badge } from 'react-bootstrap';
import { FiBell, FiInfo } from 'react-icons/fi';

const StudentNotifications = () => {
    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Notifications</h2>
            <Card className="shadow-sm border-0">
                <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex align-items-center p-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary"><FiBell /></div>
                        <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold">Enrollment Verified</h6>
                            <p className="mb-0 text-muted small">Your enrollment for First Semester has been approved.</p>
                        </div>
                        <small className="text-muted">2 hours ago</small>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center p-3">
                        <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3 text-warning"><FiInfo /></div>
                        <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold">System Maintenance</h6>
                            <p className="mb-0 text-muted small">Scheduled maintenance on Sunday at 2:00 AM.</p>
                        </div>
                        <small className="text-muted">1 day ago</small>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Container>
    );
};

export default StudentNotifications;
