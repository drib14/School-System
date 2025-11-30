import React from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';

const StaffPage = () => {
    const { users } = useStorage();
    const staff = users.filter(u => u.role === 'Teacher');

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
                            <tr><td colspan="5" className="text-center py-4">No staff found.</td></tr>
                        ) : (
                            staff.map(s => (
                                <tr key={s.id}>
                                    <td className="ps-4 fw-bold">{s.id}</td>
                                    <td>{s.firstName} {s.lastName}</td>
                                    <td>{s.email}</td>
                                    <td>{s.role}</td>
                                    <td><Badge bg="info">{s.status}</Badge></td>
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
