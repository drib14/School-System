import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStorage, ACADEMIC_DATA } from '../../context/StorageContext';

const ReportsPage = () => {
    const { getItems, STORAGE_KEYS } = useStorage();
    const enrollments = getItems(STORAGE_KEYS.ENROLLMENTS);
    const finance = getItems(STORAGE_KEYS.FINANCE); // Assuming this exists or mocked

    // Mock Data Processors
    const departmentData = ACADEMIC_DATA.departments.map(dept => {
        return {
            name: dept,
            value: enrollments.filter(e => e.department === dept).length
        };
    }).filter(d => d.value > 0);

    // Mock Revenue Data (since finance might be empty)
    const revenueData = [
        { name: 'Jan', amount: 50000 },
        { name: 'Feb', amount: 75000 },
        { name: 'Mar', amount: 60000 },
        { name: 'Apr', amount: 90000 },
        { name: 'May', amount: 120000 },
        { name: 'Jun', amount: 150000 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Reports & Analytics</h4>
                <div>
                    <Button variant="outline-primary" className="me-2"><i className="fas fa-download me-2"></i> Export PDF</Button>
                    <Button variant="outline-success"><i className="fas fa-file-excel me-2"></i> Export CSV</Button>
                </div>
            </div>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100 text-center p-3">
                        <h6 className="text-muted">Total Enrolled</h6>
                        <h2 className="fw-bold mb-0">{enrollments.length}</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100 text-center p-3">
                        <h6 className="text-muted">Total Revenue</h6>
                        <h2 className="fw-bold mb-0">$545k</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100 text-center p-3">
                        <h6 className="text-muted">Attendance Rate</h6>
                        <h2 className="fw-bold mb-0">94%</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100 text-center p-3">
                        <h6 className="text-muted">New Applicants</h6>
                        <h2 className="fw-bold mb-0">45</h2>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Revenue Trends</h6></Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#0FB4A9" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white"><h6 className="mb-0 fw-bold">Enrollment Distribution</h6></Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentData.length ? departmentData : [{name: 'No Data', value: 1}]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReportsPage;
