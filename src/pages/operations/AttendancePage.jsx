import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const AttendancePage = () => {
    const [logs, setLogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLogs([...logs, { ...data, timeIn: time, timeOut: '-', status: 'Present', id: Date.now() }]);
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Attendance Management</h4>
                <div>
                    <Button className="btn-primary-custom me-2" onClick={() => setShowModal(true)}>
                        <i className="fas fa-edit me-2"></i> Manual Entry
                    </Button>
                    <Button variant="outline-primary"><i className="fas fa-qrcode me-2"></i> Scan QR</Button>
                </div>
            </div>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white">
                    <h6 className="mb-0 fw-bold">Daily Logs</h6>
                </Card.Header>
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Student</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr><td colspan="4" className="text-center py-5 text-muted">No logs for today.</td></tr>
                        ) : (
                            logs.map(l => (
                                <tr key={l.id}>
                                    <td>{l.student}</td>
                                    <td>{l.timeIn}</td>
                                    <td>{l.timeOut}</td>
                                    <td><Badge bg="success">{l.status}</Badge></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Manual Attendance</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Student Name</Form.Label>
                            <Form.Control {...register('student', {required:true})} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Form.Select {...register('status')}>
                                <option>Present</option>
                                <option>Late</option>
                                <option>Excused</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Mark Attendance</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AttendancePage;
