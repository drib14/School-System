import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';
import api from '../../api/axios';

const EventsAdmin = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/announcements');
            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.post('/announcements', {
                title: formData.get('title'),
                content: formData.get('content'),
                priority: formData.get('priority')
            });
            setShowModal(false);
            fetchEvents();
        } catch (error) {
            alert('Failed to create event');
        }
    };

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Events & Announcements</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}><FiPlus /> Create Event</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Details</th>
                                    <th>Date Created</th>
                                    <th>Priority</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev._id}>
                                        <td className="fw-bold">{ev.title}</td>
                                        <td>{ev.content}</td>
                                        <td>{new Date(ev.createdAt).toLocaleDateString()}</td>
                                        <td><Badge bg={ev.priority === 'High' ? 'danger' : 'info'}>{ev.priority}</Badge></td>
                                        <td>
                                            <Button size="sm" variant="outline-danger"><FiTrash2 /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleCreateEvent}>
                    <Modal.Header closeButton><Modal.Title>New Event / Announcement</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Event Title</Form.Label>
                            <Form.Control name="title" required placeholder="e.g., Sports Fest 2024" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Details / Content</Form.Label>
                            <Form.Control as="textarea" rows={3} name="content" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Select name="priority">
                                <option value="Normal">Normal</option>
                                <option value="High">High (Urgent)</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Publish</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default EventsAdmin;
