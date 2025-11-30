import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/logo.png';

const LandingPage = () => {
    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <Navbar bg="white" expand="lg" className="shadow-sm py-3 sticky-top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
                        <img src={logo} alt="EduCore Logo" width="40" height="40" className="d-inline-block align-top" />
                        <span className="fw-bold text-primary-custom fs-4">EduCore University</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center gap-3">
                            <Nav.Link href="#features" className="fw-medium">Features</Nav.Link>
                            <Nav.Link href="#programs" className="fw-medium">Programs</Nav.Link>
                            <Nav.Link href="#about" className="fw-medium">About</Nav.Link>
                            <Link to="/login">
                                <Button variant="outline-primary" className="btn-outline-custom px-4">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" className="btn-primary-custom px-4">Enroll Now</Button>
                            </Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <section className="py-5 text-center text-lg-start" style={{ background: 'linear-gradient(135deg, #0FB4A9 0%, #0A7A87 100%)', color: 'white' }}>
                <Container className="py-5">
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <h1 className="display-4 fw-bold mb-4">Shaping the Future of Education</h1>
                            <p className="lead mb-4 opacity-90">
                                EduCore University provides a world-class learning environment with cutting-edge technology and comprehensive academic programs from Kindergarten to College.
                            </p>
                            <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                                <Link to="/register">
                                    <Button variant="light" size="lg" className="text-primary-custom fw-bold px-5">Get Started</Button>
                                </Link>
                                <Button variant="outline-light" size="lg" className="px-4">Learn More</Button>
                            </div>
                        </Col>
                        <Col lg={6} className="text-center">
                            <img src={logo} alt="University Banner" className="img-fluid drop-shadow" style={{ maxHeight: '400px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features */}
            <section id="features" className="py-5">
                <Container className="py-5">
                    <div className="text-center mb-5">
                        <h6 className="text-primary-custom fw-bold text-uppercase letter-spacing-1">Why Choose Us</h6>
                        <h2 className="fw-bold">Excellence in Every Aspect</h2>
                    </div>
                    <Row className="g-4">
                        {[
                            { icon: 'fa-graduation-cap', title: 'Quality Education', desc: 'Accredited programs designed for global competitiveness.' },
                            { icon: 'fa-chalkboard-teacher', title: 'Expert Faculty', desc: 'Learn from industry practitioners and seasoned educators.' },
                            { icon: 'fa-laptop-code', title: 'Modern Facilities', desc: 'State-of-the-art labs, libraries, and digital learning tools.' },
                            { icon: 'fa-users', title: 'Vibrant Community', desc: 'A diverse and inclusive environment for holistic growth.' }
                        ].map((feature, idx) => (
                            <Col md={6} lg={3} key={idx}>
                                <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift">
                                    <div className="mb-3 text-primary-custom">
                                        <i className={`fas ${feature.icon} fa-3x`}></i>
                                    </div>
                                    <h5 className="fw-bold mb-2">{feature.title}</h5>
                                    <p className="text-muted small mb-0">{feature.desc}</p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <footer className="bg-white border-top py-5 mt-auto">
                <Container>
                    <Row className="g-4">
                        <Col md={4}>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <img src={logo} alt="Logo" width="32" />
                                <h5 className="fw-bold mb-0 text-primary-custom">EduCore</h5>
                            </div>
                            <p className="text-muted small">
                                Empowering students to become leaders of tomorrow through excellence in education and character formation.
                            </p>
                        </Col>
                        <Col md={2}>
                            <h6 className="fw-bold mb-3">Quick Links</h6>
                            <ul className="list-unstyled small text-muted">
                                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Admissions</a></li>
                                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Programs</a></li>
                                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Portal</a></li>
                            </ul>
                        </Col>
                        <Col md={3}>
                            <h6 className="fw-bold mb-3">Contact Us</h6>
                            <ul className="list-unstyled small text-muted">
                                <li className="mb-2"><i className="fas fa-map-marker-alt me-2"></i> 123 Education Ave, City</li>
                                <li className="mb-2"><i className="fas fa-phone me-2"></i> +1 234 567 8900</li>
                                <li className="mb-2"><i className="fas fa-envelope me-2"></i> admissions@educore.edu</li>
                            </ul>
                        </Col>
                        <Col md={3}>
                            <h6 className="fw-bold mb-3">Follow Us</h6>
                            <div className="d-flex gap-3">
                                <a href="#" className="text-primary-custom fs-5"><i className="fab fa-facebook"></i></a>
                                <a href="#" className="text-primary-custom fs-5"><i className="fab fa-twitter"></i></a>
                                <a href="#" className="text-primary-custom fs-5"><i className="fab fa-instagram"></i></a>
                                <a href="#" className="text-primary-custom fs-5"><i className="fab fa-linkedin"></i></a>
                            </div>
                        </Col>
                    </Row>
                    <hr className="my-4" />
                    <div className="text-center text-muted small">
                        &copy; 2024 EduCore University. All Rights Reserved.
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default LandingPage;
