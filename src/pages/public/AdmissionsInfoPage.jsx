import React from 'react';
import { Container } from 'react-bootstrap';

const AdmissionsInfoPage = () => (
    <Container className="py-5">
        <h1 className="text-primary-custom fw-bold">Admissions</h1>
        <p className="lead mt-4">Join us today! Our admission process is simple and straightforward.</p>
        <ul>
            <li>Fill out the online application.</li>
            <li>Submit required documents.</li>
            <li>Pay the admission fee.</li>
        </ul>
    </Container>
);
export default AdmissionsInfoPage;
