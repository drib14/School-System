import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import api from '../../api/axios';

const StudentEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch announcements/events
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/announcements'); // Reusing announcements for now
                setEvents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Campus Events</h2>

            {loading ? <Spinner animation="border" /> : (
                <Row>
                    {events.length === 0 ? <Col>No upcoming events.</Col> :
                        events.map(event => (
                            <Col md={6} lg={4} key={event._id} className="mb-4">
                                <Card className="h-100 shadow-sm border-0">
                                    <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                                        <div className="fw-bold d-flex align-items-center">
                                            <FiCalendar className="me-2" />
                                            {new Date(event.createdAt).toLocaleDateString()} {/* Mock date */}
                                        </div>
                                        <Badge bg="light" text="primary">{event.priority}</Badge>
                                    </div>
                                    <Card.Body>
                                        <h5 className="fw-bold mb-3">{event.title}</h5>
                                        <p className="text-muted">{event.content}</p>
                                        <div className="d-flex align-items-center text-muted small mt-auto pt-3 border-top">
                                            <FiMapPin className="me-2" />
                                            <span>Campus Main Hall</span> {/* Mock location */}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    }
                </Row>
            )}
        </Container>
    );
};

export default StudentEvents;
