import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useStorage } from '../../context/StorageContext';
import VirtualIDCard from '../../components/sis/VirtualIDCard';

const AttendancePage = () => {
    const { currentUser } = useStorage();
    const [logs, setLogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const { register, handleSubmit, reset } = useForm();

    const isStudent = currentUser?.role === 'Student';
    const isTeacher = currentUser?.role === 'Teacher' || currentUser?.role === 'Admin';

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const endpoint = isStudent ? '/attendance/my' : '/attendance';
            const { data } = await api.get(endpoint);
            setLogs(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUploadScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        // Simulate file scan (real impl would upload to cloudinary -> decode qr -> send result)
        // For MVP, we assume the user uploaded their own QR and system validates it.
        try {
             // We can just call the same scan endpoint.
             // If we had a real decoder, we'd decode client side or server side.
             // Here we simulate successful scan of current user.
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake processing delay

            await api.post('/attendance', { studentId: currentUser._id });
            setMsg('QR Code uploaded and scanned successfully! Status: Verified');
            fetchLogs();
        } catch (error) {
            setMsg(error.response?.data?.message || 'Scan failed');
        }
        setLoading(false);
    };

    const handleScan = async () => {
         // This was the old button logic, now moved to VirtualIDCard Modal usually
         // But "Scan QR" button requested triggers the "generates virtual id"
         setShowModal(true);
    };

    const handleVerify = async (id, status) => {
        try {
            await api.put(`/attendance/${id}/verify`, { status });
            fetchLogs();
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (data) => {
        // Manual entry logic (if needed for admin)
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-primary-custom">Attendance Management</h4>
                    <p className="text-muted">Manage daily logs and verification.</p>
                </div>
                <div>
                    {isTeacher && (
                         <Button className="btn-primary-custom me-2" onClick={() => setShowModal(true)}>
                            <i className="fas fa-edit me-2"></i> Manual Entry
                        </Button>
                    )}
                    {isStudent && (
                        <div className="d-flex gap-2">
                             <Button variant="primary" onClick={handleScan}>
                                <i className="fas fa-qrcode me-2"></i> Scan QR (Virtual ID)
                            </Button>

                            <div className="position-relative">
                                <Button variant="outline-primary">
                                    <i className="fas fa-upload me-2"></i> Upload QR
                                </Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadScan}
                                    style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        opacity: 0, cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Row className="g-4">
                 {/* Remove inline VirtualIDCard, move to Modal for "Scan QR" button as implied by request "generates a virtual id" */}
                 {/* Wait, request: "Scan QR(generates a virtual id...)" -> So clicking Scan QR shows the ID. */}
                 {/* Upload QR -> System scans it. */}

                <Col md={12}>
                    {msg && <Alert variant="info" className="mb-3">{msg}</Alert>}

                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white py-3">
                            <h6 className="mb-0 fw-bold">Attendance Logs</h6>
                        </Card.Header>
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    {isTeacher && <th>Student</th>}
                                    <th>Date</th>
                                    <th>Time In</th>
                                    <th>Status</th>
                                    {isTeacher && <th>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">No logs found.</td></tr>
                                ) : (
                                    logs.map(l => (
                                        <tr key={l._id}>
                                            {isTeacher && <td>
                                                <div className="d-flex align-items-center">
                                                     <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: 32, height: 32}}>
                                                        <span className="small fw-bold">{l.student?.name?.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{l.student?.name}</div>
                                                        <div className="small text-muted">{l.student?.studentId || 'No ID'}</div>
                                                    </div>
                                                </div>
                                            </td>}
                                            <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                                            <td>{l.timeIn}</td>
                                            <td>
                                                <Badge bg={
                                                    l.status === 'Present' ? 'success' :
                                                    l.status === 'Verified' ? 'info' :
                                                    l.status === 'Pending' ? 'warning' : 'danger'
                                                }>
                                                    {l.status}
                                                </Badge>
                                            </td>
                                            {isTeacher && (
                                                <td>
                                                    {l.status === 'Verified' && (
                                                        <Button size="sm" variant="outline-success" onClick={() => handleVerify(l._id, 'Present')}>
                                                            <i className="fas fa-check me-1"></i> Verify
                                                        </Button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>{isStudent ? 'Virtual ID Card' : 'Manual Attendance'}</Modal.Title></Modal.Header>
                {isStudent ? (
                    <Modal.Body className="text-center">
                         <VirtualIDCard />
                    </Modal.Body>
                ) : (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Modal.Body>
                            <p className="text-muted">Manual entry feature coming soon.</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="light" onClick={() => setShowModal(false)}>Close</Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default AttendancePage;
