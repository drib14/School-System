import React from 'react';
import { Card, Row, Col, ListGroup, ProgressBar, Badge, Button } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';

const StudentDashboard = () => {
    const { currentUser } = useStorage();

    return (
        <div>
            <Card className="bg-primary-custom text-white mb-4 border-0">
                <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold">Welcome back, {currentUser.firstName}!</h3>
                        <p className="mb-0 opacity-90">You have 3 classes today. Next class starts in 15 minutes.</p>
                    </div>
                    <div className="text-end d-none d-md-block">
                        <h2 className="mb-0">A-</h2>
                        <small className="opacity-75">GPA</small>
                    </div>
                </Card.Body>
            </Card>

            <Row className="g-4">
                <Col md={8}>
                    {/* Schedule */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">Today's Schedule</h6>
                            <Button size="sm" variant="link" className="text-decoration-none">View Full</Button>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {[
                                { time: '08:00 AM', subject: 'Mathematics 101', room: 'Rm 302', status: 'Finished' },
                                { time: '10:00 AM', subject: 'Science', room: 'Lab 2', status: 'Ongoing' },
                                { time: '01:00 PM', subject: 'History', room: 'Rm 104', status: 'Upcoming' },
                            ].map((cls, idx) => (
                                <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="fw-bold d-block">{cls.subject}</span>
                                        <small className="text-muted">{cls.time} • {cls.room}</small>
                                    </div>
                                    <Badge bg={cls.status === 'Ongoing' ? 'success' : cls.status === 'Finished' ? 'secondary' : 'primary'}>
                                        {cls.status}
                                    </Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>

                    {/* Assignments */}
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Due Assignments</h6></Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-bold">Algebra Problem Set</span>
                                    <small className="text-danger d-block">Due Today, 11:59 PM</small>
                                </div>
                                <Button size="sm" variant="outline-primary">Submit</Button>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-bold">History Essay</span>
                                    <small className="text-muted d-block">Due Tomorrow</small>
                                </div>
                                <Button size="sm" variant="outline-primary">View</Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={4}>
                    {/* Grades Widget */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Recent Grades</h6></Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="small fw-bold">Math</span>
                                    <span className="small fw-bold text-success">92%</span>
                                </div>
                                <ProgressBar variant="success" now={92} height={5} />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="small fw-bold">Science</span>
                                    <span className="small fw-bold text-info">88%</span>
                                </div>
                                <ProgressBar variant="info" now={88} height={5} />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="small fw-bold">English</span>
                                    <span className="small fw-bold text-warning">85%</span>
                                </div>
                                <ProgressBar variant="warning" now={85} height={5} />
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Announcements */}
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Announcements</h6></Card.Header>
                        <Card.Body>
                            <div className="border-start border-3 border-primary ps-3 mb-3">
                                <small className="text-muted d-block">Oct 24</small>
                                <p className="mb-0 small fw-bold">Midterm Exams Schedule Released</p>
                            </div>
                            <div className="border-start border-3 border-warning ps-3">
                                <small className="text-muted d-block">Oct 20</small>
                                <p className="mb-0 small fw-bold">Library System Maintenance</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;
