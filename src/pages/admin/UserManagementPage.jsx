import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const UserManagementPage = () => {
    const { users, updateItem, register: registerUser, STORAGE_KEYS } = useStorage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.includes(searchTerm);
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

    const handleStatusChange = (id, newStatus) => {
        updateItem(STORAGE_KEYS.USERS, id, { status: newStatus });
    };

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
                            <tr key={u.id}>
                                <td className="ps-4 fw-bold">{u.id}</td>
                                <td>{u.firstName} {u.lastName}</td>
                                <td>{u.email}</td>
                                <td><Badge bg="light" text="dark" className="border">{u.role}</Badge></td>
                                <td>
                                    <Badge bg={u.status === 'Active' ? 'success' : u.status === 'Pending' ? 'warning' : 'danger'}>
                                        {u.status}
                                    </Badge>
                                </td>
                                <td className="text-end pe-4">
                                    <Button size="sm" variant="light" className="me-2" onClick={() => handleEdit(u)}>
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    {u.status === 'Active' ? (
                                        <Button size="sm" variant="outline-danger" onClick={() => handleStatusChange(u.id, 'Deactivated')}>
                                            <i className="fas fa-ban"></i>
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline-success" onClick={() => handleStatusChange(u.id, 'Active')}>
                                            <i className="fas fa-check"></i>
                                        </Button>
                                    )}
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
                registerUser={registerUser}
                updateItem={updateItem}
                STORAGE_KEYS={STORAGE_KEYS}
            />
        </div>
    );
};

const UserModal = ({ show, handleClose, user, registerUser, updateItem, STORAGE_KEYS }) => {
    const { register, handleSubmit, reset, setValue } = useForm();

    React.useEffect(() => {
        if (user) {
            setValue('firstName', user.firstName);
            setValue('lastName', user.lastName);
            setValue('email', user.email);
            setValue('role', user.role);
            setValue('phone', user.phone || '');
        } else {
            reset({ firstName: '', lastName: '', email: '', role: 'Student', phone: '' });
        }
    }, [user, show]);

    const onSubmit = (data) => {
        if (user) {
            updateItem(STORAGE_KEYS.USERS, user.id, data);
        } else {
            registerUser({ ...data, password: 'password123' });
        }
        handleClose();
        reset();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{user ? 'Edit User' : 'Add User'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>First Name</Form.Label>
                                <Form.Control {...register('firstName', { required: true })} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control {...register('lastName', { required: true })} />
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
                    <Button type="submit" className="btn-primary-custom">Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UserManagementPage;
