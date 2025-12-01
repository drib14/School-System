import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const ReportsPage = () => {
    // Mock Data for Analytics
    const enrollmentData = [
        { name: '2020', students: 400 },
        { name: '2021', students: 450 },
        { name: '2022', students: 580 },
        { name: '2023', students: 620 },
        { name: '2024', students: 800 },
    ];

    const financeData = [
        { month: 'Jan', income: 50000, expense: 20000 },
        { month: 'Feb', income: 45000, expense: 25000 },
        { month: 'Mar', income: 60000, expense: 22000 },
        { month: 'Apr', income: 55000, expense: 30000 },
        { month: 'May', income: 70000, expense: 28000 },
    ];

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Reports & Analytics</h2>

            <Row className="mb-4">
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold">Enrollment Trends (5 Years)</Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={enrollmentData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="students" fill="#0FB4A9" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold">Financial Overview (YTD)</Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={financeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                                        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Card className="shadow-sm border-0 text-center p-3 mb-3">
                        <h1 className="fw-bold text-primary">95%</h1>
                        <p className="text-muted">Attendance Rate</p>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 text-center p-3 mb-3">
                        <h1 className="fw-bold text-success">88%</h1>
                        <p className="text-muted">Pass Rate</p>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 text-center p-3 mb-3">
                        <h1 className="fw-bold text-warning">12</h1>
                        <p className="text-muted">Pending Issues</p>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ReportsPage;
