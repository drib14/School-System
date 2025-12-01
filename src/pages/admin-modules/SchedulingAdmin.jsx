import React from 'react';
import { Container, Card, Table, Button, Badge } from 'react-bootstrap';
import { FiPlus, FiEdit } from 'react-icons/fi';

const SchedulingAdmin = () => {
    // Mock Data
    const schedules = [
        { id: 1, course: 'CS101', section: 'A', day: 'Mon/Wed', time: '08:30 - 10:00', room: 'Lab 1', instructor: 'Mr. Anderson' },
        { id: 2, course: 'CS102', section: 'A', day: 'Tue/Thu', time: '10:30 - 12:00', room: 'Lab 2', instructor: 'Mr. Anderson' },
        { id: 3, course: 'MATH101', section: 'A', day: 'Fri', time: '09:00 - 12:00', room: 'Rm 305', instructor: 'Ms. Frizzle' },
    ];

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Class Scheduling</h2>
                <Button variant="primary"><FiPlus /> Add Schedule</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive className="align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Course</th>
                                <th>Section</th>
                                <th>Schedule</th>
                                <th>Room</th>
                                <th>Instructor</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(s => (
                                <tr key={s.id}>
                                    <td className="fw-bold">{s.course}</td>
                                    <td><Badge bg="info">{s.section}</Badge></td>
                                    <td>{s.day} <span className="text-muted small">({s.time})</span></td>
                                    <td>{s.room}</td>
                                    <td>{s.instructor}</td>
                                    <td>
                                        <Button size="sm" variant="outline-primary"><FiEdit /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SchedulingAdmin;
