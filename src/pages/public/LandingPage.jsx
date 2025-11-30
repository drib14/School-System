import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/logo.png';

const LandingPage = () => {
    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
            <Navbar bg="white" expand="lg" className="shadow-sm py-3">
                <Container>
                    <Navbar.Brand href="#" className="d-flex align-items-center fw-bold text-primary-custom">
                        {/* <img src={logo} alt="Logo" width="30" height="30" className="me-2" /> */}
                        <div className="bg-primary-custom text-white rounded-circle d-inline-flex align-items-center justify-content-center me-2" style={{width: 30, height: 30, fontSize: 14}}>
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        EduCore University
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            <Nav.Link href="#about">About</Nav.Link>
                            <Nav.Link href="#admissions">Admissions</Nav.Link>
                            <Nav.Link href="#programs">Programs</Nav.Link>
                            <Nav.Link href="#contact">Contact</Nav.Link>
                            <Link to="/login">
                                <Button variant="outline-primary" className="ms-3 rounded-pill px-4">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" className="btn-primary-custom ms-2 rounded-pill px-4">Enroll Now</Button>
                            </Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <header className="py-5 text-center bg-white border-bottom">
                <Container className="py-5">
                    <h1 className="display-4 fw-bold text-primary-custom mb-3">Shaping the Future of Education</h1>
                    <p className="lead text-muted mb-4" style={{ maxWidth: '700px', margin: '0 auto' }}>
                        Join a world-class institution dedicated to academic excellence, innovation, and holistic development.
                    </p>
                    <Link to="/register">
                        <Button size="lg" className="btn-primary-custom rounded-pill px-5 py-3 shadow">Start Your Journey</Button>
                    </Link>
                </Container>
            </header>

            {/* Features */}
            <section className="py-5" id="programs">
                <Container>
                    <Row className="g-4">
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm p-3 hover-card">
                                <Card.Body className="text-center">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 70, height: 70}}>
                                        <i className="fas fa-microscope fs-3 text-success"></i>
                                    </div>
                                    <h5 className="fw-bold">STEM & Research</h5>
                                    <p className="text-muted">Cutting-edge laboratories and research opportunities.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm p-3 hover-card">
                                <Card.Body className="text-center">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 70, height: 70}}>
                                        <i className="fas fa-palette fs-3 text-warning"></i>
                                    </div>
                                    <h5 className="fw-bold">Arts & Humanities</h5>
                                    <p className="text-muted">Cultivating creativity and critical thinking.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm p-3 hover-card">
                                <Card.Body className="text-center">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 70, height: 70}}>
                                        <i className="fas fa-laptop-code fs-3 text-primary"></i>
                                    </div>
                                    <h5 className="fw-bold">Technology</h5>
                                    <p className="text-muted">Advanced computer science and IT curriculum.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            <footer className="bg-dark text-white py-4 text-center mt-auto">
                <Container>
                    <small className="opacity-50">&copy; {new Date().getFullYear()} EduCore University. All rights reserved.</small>
                </Container>
            </footer>
        </div>
    );
};

export default LandingPage;
