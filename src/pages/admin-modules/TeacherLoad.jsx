import React from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';

const TeacherLoad = () => {
    // Mock Data
    const loads = [
        { teacher: 'Mr. Anderson', subject: 'Science', sections: ['G7-A', 'G7-B', 'G8-A'], totalHours: 18 },
        { teacher: 'Ms. Frizzle', subject: 'Math', sections: ['G9-A', 'G10-A'], totalHours: 12 },
    ];

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Teacher Loads</h2>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Teacher</th>
                                <th>Subject Department</th>
                                <th>Assigned Sections</th>
                                <th>Total Units/Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loads.map((l, idx) => (
                                <tr key={idx}>
                                    <td className="fw-bold">{l.teacher}</td>
                                    <td>{l.subject}</td>
                                    <td>
                                        {l.sections.map(s => <Badge bg="secondary" className="me-1" key={s}>{s}</Badge>)}
                                    </td>
                                    <td>{l.totalHours} Hrs</td>
                                    <td><Badge bg="success">Regular</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TeacherLoad;
