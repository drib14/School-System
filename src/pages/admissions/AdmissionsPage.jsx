import React, { useState } from 'react';
import { Card, Table, Button, Badge, Nav } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';

const AdmissionsPage = () => {
    const { users, updateItem, getItems, STORAGE_KEYS } = useStorage();
    const [activeTab, setActiveTab] = useState('users');

    const pendingUsers = users.filter(u => u.status === 'Pending');

    const enrollments = getItems(STORAGE_KEYS.ENROLLMENTS);
    const pendingEnrollments = enrollments.filter(e => e.status === 'Pending Approval');

    const handleApproveUser = (id) => {
        updateItem(STORAGE_KEYS.USERS, id, { status: 'Active' });
    };

    const handleRejectUser = (id) => {
        updateItem(STORAGE_KEYS.USERS, id, { status: 'Rejected' });
    };

    const handleApproveEnrollment = (enrollment) => {
        // Approve Enrollment
        updateItem(STORAGE_KEYS.ENROLLMENTS, enrollment.id, { status: 'Active' });
        // Update User Status
        updateItem(STORAGE_KEYS.USERS, enrollment.studentId, { enrollmentStatus: 'Enrolled' });
    };

    return (
        <div className="p-4">
            <h4 className="mb-4">Admissions & Approvals</h4>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white">
                    <Nav variant="tabs" defaultActiveKey="users" onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="users" className={activeTab === 'users' ? 'fw-bold text-primary-custom' : 'text-muted'}>
                                User Applications <Badge bg="warning" text="dark" className="ms-1">{pendingUsers.length}</Badge>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="enrollments" className={activeTab === 'enrollments' ? 'fw-bold text-primary-custom' : 'text-muted'}>
                                Enrollment Requests <Badge bg="info" className="ms-1">{pendingEnrollments.length}</Badge>
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'users' && (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th>Date</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingUsers.length === 0 ? (
                                    <tr><td colspan="6" className="text-center py-5 text-muted">No pending user applications.</td></tr>
                                ) : (
                                    pendingUsers.map(u => (
                                        <tr key={u.id}>
                                            <td className="ps-4 fw-bold">{u.id}</td>
                                            <td>{u.firstName} {u.lastName}</td>
                                            <td><Badge bg="light" text="dark" className="border">{u.role}</Badge></td>
                                            <td>{u.email}</td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="text-end pe-4">
                                                <Button size="sm" variant="success" className="me-2" onClick={() => handleApproveUser(u.id)}>Approve</Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => handleRejectUser(u.id)}>Reject</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}

                    {activeTab === 'enrollments' && (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Student ID</th>
                                    <th>Program</th>
                                    <th>Year/Section</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingEnrollments.length === 0 ? (
                                    <tr><td colspan="6" className="text-center py-5 text-muted">No pending enrollment requests.</td></tr>
                                ) : (
                                    pendingEnrollments.map(e => (
                                        <tr key={e.id}>
                                            <td className="ps-4 fw-bold">{e.studentId}</td>
                                            <td>{e.program}</td>
                                            <td>{e.yearLevel} - {e.section}</td>
                                            <td>{e.paymentMethod}</td>
                                            <td>{new Date(e.dateEnrolled).toLocaleDateString()}</td>
                                            <td className="text-end pe-4">
                                                <Button size="sm" variant="info" className="me-2 text-white" onClick={() => alert('View Proof (Mock)')}>View Proof</Button>
                                                <Button size="sm" variant="success" onClick={() => handleApproveEnrollment(e)}>Validate & Approve</Button>
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
