import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import api from '../../api/axios';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                // Fetch Teachers and Admins? Just Teachers for now as "Staff"
                const { data } = await api.get('/users?role=Teacher');
                setStaff(data);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        fetchStaff();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading Staff...</div>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>HR & Staff Directory</h4>
                <Button variant="primary" className="btn-primary-custom">
                    <i className="fas fa-plus me-2"></i> Add Staff
                </Button>
            </div>

            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">No staff found.</td></tr>
                        ) : (
                            staff.map(s => (
                                <tr key={s._id}>
                                    <td className="ps-4 fw-bold">{s.idNumber || s.teacherId || '-'}</td>
                                    <td>{s.name}</td>
                                    <td>{s.email}</td>
                                    <td>{s.role}</td>
                                    <td><Badge bg="info">Active</Badge></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default StaffPage;
