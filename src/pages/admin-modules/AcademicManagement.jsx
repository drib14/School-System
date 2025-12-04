import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Tab, Tabs, Spinner, Row, Col } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';
import api from '../../api/axios';

const AcademicManagement = () => {
    const [key, setKey] = useState('departments');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Dependencies for dropdowns
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        fetchData();
        // Always fetch dependencies
        api.get('/academic/departments').then(res => setDepartments(res.data)).catch(console.error);
        api.get('/academic/programs').then(res => setPrograms(res.data)).catch(console.error);
    }, [key]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/academic/${key}`);
            setData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());

        try {
            await api.post(`/academic/${key}`, payload);
            setShowModal(false);
            fetchData();
            alert('Created successfully!');
        } catch (error) {
            alert('Failed to create');
        }
    };

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Academic Structure</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Add {key.slice(0, -1)}</Button>
            </div>

            <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
                <Tab eventKey="departments" title="Departments">
                    {/* Table for Departments */}
                    <DataTable data={data} columns={['name', 'code', 'description']} loading={loading} />
                </Tab>
                <Tab eventKey="programs" title="Programs">
                    {/* Table for Programs */}
                    <DataTable data={data} columns={['name', 'code', 'department.name']} loading={loading} />
                </Tab>
                <Tab eventKey="sections" title="Sections">
                    {/* Table for Sections */}
                    <DataTable data={data} columns={['name', 'program.name', 'yearLevel', 'enrolledCount', 'capacity']} loading={loading} />
                </Tab>
            </Tabs>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleCreate}>
                    <Modal.Header closeButton><Modal.Title>Create New {key.slice(0, -1)}</Modal.Title></Modal.Header>
                    <Modal.Body>
                        {key === 'departments' && (
                            <>
                                <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control name="name" required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Code</Form.Label><Form.Control name="code" required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control name="description" /></Form.Group>
                            </>
                        )}
                        {key === 'programs' && (
                            <>
                                <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control name="name" required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Code</Form.Label><Form.Control name="code" required /></Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Department</Form.Label>
                                    <Form.Select name="department" required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </>
                        )}
                        {key === 'sections' && (
                            <>
                                <Form.Group className="mb-3"><Form.Label>Section Name</Form.Label><Form.Control name="name" required placeholder="A, Block 1" /></Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Program</Form.Label>
                                    <Form.Select name="program" required>
                                        <option value="">Select Program</option>
                                        {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Year Level</Form.Label><Form.Control name="yearLevel" required placeholder="1st Year" /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Capacity</Form.Label><Form.Control type="number" name="capacity" defaultValue={40} /></Form.Group>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

const DataTable = ({ data, columns, loading }) => {
    if (loading) return <Spinner animation="border" />;
    return (
        <Card className="shadow-sm border-0">
            <Table hover responsive>
                <thead className="bg-light">
                    <tr>
                        {columns.map(c => <th key={c} className="text-capitalize">{c.split('.')[0]}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? <tr><td colSpan={columns.length} className="text-center">No data found.</td></tr> :
                        data.map((item, idx) => (
                            <tr key={idx}>
                                {columns.map(col => {
                                    // Handle nested properties like 'department.name'
                                    const val = col.split('.').reduce((obj, key) => obj?.[key], item);
                                    return <td key={col}>{val}</td>;
                                })}
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </Card>
    );
};

export default AcademicManagement;
