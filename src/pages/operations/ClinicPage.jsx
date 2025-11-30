import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useStorage } from '../../context/StorageContext';

const ClinicPage = () => {
    const { currentUser } = useStorage();
    const isStudent = currentUser.role === 'Student';
    const [records, setRecords] = useState([{id: 1, student: 'Student A', complaint: 'Headache', nurse: 'Nurse Joy', date: 'Oct 20, 2024'}]);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
        setRecords([...records, { ...data, id: Date.now(), nurse: currentUser.lastName, date: new Date().toLocaleDateString() }]);
        setShowModal(false);
        reset();
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>{isStudent ? 'My Health Record' : 'Health & Clinic'}</h4>
                {!isStudent && (
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus me-2"></i> New Record
                    </Button>
                )}
                {isStudent && (
                    <Button variant="outline-primary"><i className="fas fa-calendar-plus me-2"></i> Request Appointment</Button>
                )}
            </div>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white">
                    <h6 className="mb-0 fw-bold">{isStudent ? 'Visit History' : 'Recent Visits'}</h6>
                </Card.Header>
                <Table hover responsive className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Student</th>
                            <th>Complaint</th>
                            <th>Attended By</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(r => (
                            <tr key={r.id}>
                                <td>{isStudent ? 'You' : r.student}</td>
                                <td>{r.complaint}</td>
                                <td>{r.nurse}</td>
                                <td>{r.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Add Medical Record</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Student Name</Form.Label>
                            <Form.Control {...register('student', {required:true})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Complaint / Diagnosis</Form.Label>
                            <Form.Control as="textarea" rows={3} {...register('complaint', {required:true})} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="btn-primary-custom">Save Record</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ClinicPage;
