import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportsPage = () => {
    // Mock Data for Analytics
    const enrollmentData = [
        { name: 'Kinder', students: 40 },
        { name: 'Elem', students: 120 },
        { name: 'JHS', students: 80 },
        { name: 'SHS', students: 60 },
        { name: 'College', students: 150 },
    ];

    const attendanceData = [
        { name: 'Mon', present: 380, absent: 20 },
        { name: 'Tue', present: 390, absent: 10 },
        { name: 'Wed', present: 385, absent: 15 },
        { name: 'Thu', present: 375, absent: 25 },
        { name: 'Fri', present: 360, absent: 40 },
    ];

    return (
        <div className="p-4">
            <h4 className="fw-bold text-primary-custom mb-4">Reports & Analytics</h4>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 text-center py-4 h-100">
                        <h2 className="fw-bold text-primary-custom">450</h2>
                        <span className="text-muted">Total Students</span>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 text-center py-4 h-100">
                        <h2 className="fw-bold text-success">95%</h2>
                        <span className="text-muted">Avg. Attendance</span>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 text-center py-4 h-100">
                        <h2 className="fw-bold text-info">32</h2>
                        <span className="text-muted">Total Teachers</span>
                    </Card>
                </Col>
                 <Col md={3}>
                    <Card className="shadow-sm border-0 text-center py-4 h-100">
                        <h2 className="fw-bold text-warning">₱ 2.5M</h2>
                        <span className="text-muted">Collections (YTD)</span>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm border-0 p-3 h-100">
                        <h6 className="fw-bold mb-3">Enrollment by Department</h6>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={enrollmentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="students" fill="#0FB4A9" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col md={6}>
                     <Card className="shadow-sm border-0 p-3 h-100">
                        <h6 className="fw-bold mb-3">Weekly Attendance Trend</h6>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="present" stackId="a" fill="#0FB4A9" />
                                    <Bar dataKey="absent" stackId="a" fill="#FF8042" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReportsPage;
