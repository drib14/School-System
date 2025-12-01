import React from 'react';
import { Container } from 'react-bootstrap';

const ProgramsPage = () => (
    <Container className="py-5">
        <h1 className="text-primary-custom fw-bold">Academic Programs</h1>
        <p className="lead mt-4">We offer a wide range of programs across various disciplines.</p>
        <ul>
            <li>College of Computer Studies</li>
            <li>College of Engineering</li>
            <li>College of Business</li>
            <li>College of Arts and Sciences</li>
        </ul>
    </Container>
);
export default ProgramsPage;
