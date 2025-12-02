import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TeacherAnalytics = () => {
    const data = [
        { name: 'Week 1', attendance: 95, participation: 80 },
        { name: 'Week 2', attendance: 92, participation: 85 },
        { name: 'Week 3', attendance: 88, participation: 75 },
        { name: 'Week 4', attendance: 94, participation: 90 },
    ];

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Class Analytics</h2>
            <Row>
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold">Attendance vs Participation</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="attendance" fill="#0FB4A9" name="Attendance %" />
                                    <Bar dataKey="participation" fill="#1A5F9E" name="Participation Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 mb-4 bg-light">
                        <Card.Body>
                            <h5>Class Average</h5>
                            <h2 className="fw-bold text-success">88.5%</h2>
                            <p className="text-muted">Top 10% of school</p>
                        </Card.Body>
                    </Card>
                    <Card className="shadow-sm border-0 bg-light">
                        <Card.Body>
                            <h5>At Risk Students</h5>
                            <h2 className="fw-bold text-danger">3</h2>
                            <p className="text-muted">Needs intervention</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TeacherAnalytics;
