import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const TeacherSchedule = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses'); // Controller returns teacher's courses
                setCourses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">My Teaching Schedule</h2>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Course Code</th>
                                    <th>Subject</th>
                                    <th>Section</th>
                                    <th>Schedule</th>
                                    <th>Room</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 ? <tr><td colSpan="5" className="text-center">No classes assigned.</td></tr> :
                                    courses.map(c => (
                                        <tr key={c._id}>
                                            <td className="fw-bold text-primary">{c.code}</td>
                                            <td>{c.name}</td>
                                            <td><Badge bg="info">{c.section}</Badge></td>
                                            <td>{c.schedule}</td>
                                            <td>{c.room}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TeacherSchedule;
