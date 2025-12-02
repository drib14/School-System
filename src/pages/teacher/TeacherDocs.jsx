import React from 'react';
import { Container, Card, Table, Button, Badge } from 'react-bootstrap';
import { FiDownload, FiFileText } from 'react-icons/fi';

const TeacherDocs = () => {
    const docs = [
        { name: 'Class Roster - Science G7', date: '2023-11-20', type: 'PDF' },
        { name: 'DepEd Memo #102', date: '2023-11-15', type: 'PDF' },
    ];

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Documents & Forms</h2>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Date Uploaded</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docs.map((d, i) => (
                                <tr key={i}>
                                    <td className="fw-bold"><FiFileText className="me-2"/>{d.name}</td>
                                    <td>{d.date}</td>
                                    <td><Button size="sm" variant="outline-primary"><FiDownload /> Download</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TeacherDocs;
