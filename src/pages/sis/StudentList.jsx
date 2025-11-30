import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';
import StudentModal from '../../components/sis/StudentModal';

const StudentList = () => {
    const { users, saveItem } = useStorage();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);

    const students = users.filter(u => u.role === 'Student' &&
        (u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.id.includes(searchTerm))
    );

    const handleEdit = (student) => {
        setEditingStudent(student);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingStudent(null);
        setShowModal(true);
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Student Information System</h4>
                <Button variant="primary" className="btn-primary-custom" onClick={handleAdd}>
                    <i className="fas fa-plus me-2"></i> Add Student
                </Button>
            </div>

            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text className="bg-white"><i className="fas fa-search"></i></InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr><td colspan="5" className="text-center py-4 text-muted">No students found.</td></tr>
                        ) : (
                            students.map(s => (
                                <tr key={s.id}>
                                    <td className="ps-4 fw-bold text-primary-custom">{s.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="user-avatar me-3" style={{width: 32, height: 32, fontSize: '0.8rem'}}>
                                                {s.firstName[0]}
                                            </div>
                                            {s.firstName} {s.lastName}
                                        </div>
                                    </td>
                                    <td>{s.email}</td>
                                    <td>
                                        <Badge bg={s.status === 'Active' ? 'success' : 'warning'} className="badge-custom">
                                            {s.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button size="sm" variant="light" className="text-primary-custom me-2" onClick={() => handleEdit(s)}>
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <StudentModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                student={editingStudent}
            />
        </div>
    );
};

export default StudentList;
