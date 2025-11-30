import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import api from '../../api/axios';
import StudentModal from '../../components/sis/StudentModal';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/users?role=Student');
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
        setLoading(false);
    };

    const filteredStudents = students.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.studentId && u.studentId.includes(searchTerm)) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (student) => {
        setEditingStudent(student);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingStudent(null);
        setShowModal(true);
    };

    if (loading) return <div className="p-4 text-center">Loading Students...</div>;

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
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-muted">No students found.</td></tr>
                        ) : (
                            filteredStudents.map(s => (
                                <tr key={s._id}>
                                    <td className="ps-4 fw-bold text-primary-custom">{s.idNumber || s.studentId || '-'}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="user-avatar me-3" style={{width: 32, height: 32, fontSize: '0.8rem'}}>
                                                {s.name.charAt(0)}
                                            </div>
                                            {s.name}
                                        </div>
                                    </td>
                                    <td>{s.email}</td>
                                    <td>
                                        <Badge bg="info" className="badge-custom">
                                            {s.role}
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
