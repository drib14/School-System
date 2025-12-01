import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.idNumber && u.idNumber.includes(searchTerm));
        const matchesRole = filterRole === 'All' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleStatusChange = async (id, isActive) => {
        // TODO: Implement status toggle API
        console.log('Status change logic here');
    };

    if (loading) return <div className="p-4 text-center">Loading Users...</div>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>User Management</h4>
                <Button className="btn-primary-custom" onClick={handleAdd}>
                    <i className="fas fa-user-plus me-2"></i> Add User
                </Button>
            </div>

            <Card className="shadow-sm mb-4 border-0">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={8}>
                            <InputGroup>
                                <InputGroup.Text className="bg-white"><i className="fas fa-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                                <option value="Parent">Parent</option>
                            </Form.Select>
                        </Col>
                    </Row>
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
                            <th>Status</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u._id}>
                                <td className="ps-4 fw-bold">{u.idNumber || '-'}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td><Badge bg="light" text="dark" className="border">{u.role}</Badge></td>
                                <td>
                                    <Badge bg={u.isVerified ? 'success' : 'warning'}>
                                        {u.isVerified ? 'Active' : 'Pending'}
                                    </Badge>
                                </td>
                                <td className="text-end pe-4">
                                    <Button size="sm" variant="light" className="me-2" onClick={() => handleEdit(u)}>
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <UserModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                user={editingUser}
                onRefresh={fetchUsers}
            />
        </div>
    );
};

const UserModal = ({ show, handleClose, user, onRefresh }) => {
    const { register, handleSubmit, reset, setValue } = useForm();
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (user) {
            setValue('name', user.name);
            setValue('email', user.email);
            setValue('role', user.role);
            setValue('phone', user.phone || '');
        } else {
            reset({ name: '', email: '', role: 'Student', phone: '' });
        }
    }, [user, show]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (user) {
                // Update Logic
                // await api.put(`/users/${user._id}`, data);
            } else {
                await api.post('/auth/register', { ...data, password: 'password123', isVerified: true });
            }
            onRefresh();
            handleClose();
            reset();
        } catch (error) {
            console.error(error);
            alert('Failed to save user');
        }
        setLoading(false);
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{user ? 'Edit User' : 'Add User'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control {...register('name', { required: true })} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" {...register('email', { required: true })} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Role</Form.Label>
                                <Form.Select {...register('role')}>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Admin">Admin</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control {...register('phone')} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="btn-primary-custom" disabled={loading}>Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UserManagementPage;
