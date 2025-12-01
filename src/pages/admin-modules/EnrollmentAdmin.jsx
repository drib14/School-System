import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Tab, Tabs, Spinner, Alert } from 'react-bootstrap';
import { FiCheck, FiX, FiFileText } from 'react-icons/fi';
import api from '../../api/axios';

const EnrollmentAdmin = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending Approval');

    useEffect(() => {
        fetchEnrollments();
    }, [filter]);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/enrollments?status=${encodeURIComponent(filter)}`);
            setEnrollments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this enrollment?`)) return;
        try {
            await api.put(`/enrollments/${id}`, { status });
            fetchEnrollments();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Enrollment Management</h2>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white pt-3">
                    <Tabs activeKey={filter} onSelect={(k) => setFilter(k)} className="mb-0 border-bottom-0">
                        <Tab eventKey="Pending Approval" title="Pending" />
                        <Tab eventKey="Active" title="Enrolled / Active" />
                        <Tab eventKey="Rejected" title="Rejected" />
                    </Tabs>
                </Card.Header>
                <Card.Body>
                    {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                        <Table hover responsive className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Student</th>
                                    <th>Program / Year</th>
                                    <th>Section</th>
                                    <th>Date Applied</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-4 text-muted">No enrollments found in this category.</td></tr>
                                ) : enrollments.map(e => (
                                    <tr key={e._id}>
                                        <td className="fw-bold">
                                            <div>{e.student?.name || 'Unknown'}</div>
                                            <small className="text-muted">{e.student?.email}</small>
                                        </td>
                                        <td>{e.program}<br/><small className="text-muted">{e.yearLevel}</small></td>
                                        <td>{e.section || 'N/A'}</td>
                                        <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                                        <td>{e.paymentMethod}</td>
                                        <td>
                                            <Badge bg={
                                                e.status === 'Active' ? 'success' :
                                                e.status === 'Rejected' ? 'danger' : 'warning'
                                            }>{e.status}</Badge>
                                        </td>
                                        <td className="text-end">
                                            {e.status === 'Pending Approval' && (
                                                <>
                                                    <Button size="sm" variant="success" className="me-2" onClick={() => handleUpdateStatus(e._id, 'Active')}>
                                                        <FiCheck /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(e._id, 'Rejected')}>
                                                        <FiX /> Reject
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EnrollmentAdmin;
