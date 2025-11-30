import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Nav } from 'react-bootstrap';
import api from '../../api/axios';

const AdmissionsPage = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('enrollments');

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const { data } = await api.get('/enrollments?status=Pending Approval');
            setEnrollments(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleApproveEnrollment = async (id) => {
        try {
            await api.put(`/enrollments/${id}`, { status: 'Active' });
            fetchEnrollments();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Admissions...</div>;

    return (
        <div className="p-4">
            <h4 className="mb-4">Admissions & Approvals</h4>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white">
                    <Nav variant="tabs" defaultActiveKey="enrollments" onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="enrollments" className={activeTab === 'enrollments' ? 'fw-bold text-primary-custom' : 'text-muted'}>
                                Enrollment Requests <Badge bg="info" className="ms-1">{enrollments.length}</Badge>
                            </Nav.Link>
                        </Nav.Item>
                        {/* Removed User Applications tab as auth is now immediate */}
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'enrollments' && (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Student</th>
                                    <th>Program</th>
                                    <th>Year/Section</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No pending enrollment requests.</td></tr>
                                ) : (
                                    enrollments.map(e => (
                                        <tr key={e._id}>
                                            <td className="ps-4 fw-bold">
                                                <div>{e.student?.name}</div>
                                                <small className="text-muted">{e.student?.email}</small>
                                            </td>
                                            <td>{e.program}</td>
                                            <td>{e.yearLevel} - {e.section}</td>
                                            <td>{e.paymentMethod}</td>
                                            <td>{new Date(e.dateEnrolled).toLocaleDateString()}</td>
                                            <td className="text-end pe-4">
                                                <Button size="sm" variant="info" className="me-2 text-white" onClick={() => alert('View Proof (Mock)')}>View Proof</Button>
                                                <Button size="sm" variant="success" onClick={() => handleApproveEnrollment(e._id)}>Validate & Approve</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdmissionsPage;
