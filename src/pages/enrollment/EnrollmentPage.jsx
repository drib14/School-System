import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Badge, Table, Spinner } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const EnrollmentPage = () => {
    const { currentUser } = useStorage();
    const navigate = useNavigate();

    const [existingEnrollment, setExistingEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);

    const [step, setStep] = useState(1);
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [sections, setSections] = useState([]);

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedProg, setSelectedProg] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState(''); // ID
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        fetchMyEnrollment();
        fetchDepartments();
    }, []);

    const fetchMyEnrollment = async () => {
        try {
            const { data } = await api.get('/enrollments');
            if (data.length > 0) {
                setExistingEnrollment(data[data.length - 1]);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/academic/departments');
            setDepartments(data);
        } catch (error) { console.error(error); }
    };

    const handleDeptChange = async (e) => {
        const deptId = e.target.value;
        setSelectedDept(deptId);
        setSelectedProg('');
        setSections([]);
        try {
            const { data } = await api.get(`/academic/programs?departmentId=${deptId}`);
            setPrograms(data);
        } catch (error) { console.error(error); }
    };

    const handleProgChange = (e) => {
        setSelectedProg(e.target.value);
        setSelectedSection('');
    };

    const handleYearChange = async (e) => {
        const year = e.target.value;
        setSelectedYear(year);
        if (selectedProg) {
            try {
                const { data } = await api.get(`/academic/sections?programId=${selectedProg}&yearLevel=${encodeURIComponent(year)}`);
                setSections(data);
            } catch (error) { console.error(error); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Find Names for legacy string support
        const progObj = programs.find(p => p._id === selectedProg);
        const sectObj = sections.find(s => s._id === selectedSection);

        const payload = {
            program: progObj?.name,
            yearLevel: selectedYear,
            section: sectObj?.name,
            sectionRef: selectedSection,
            paymentMethod,
            status: 'Pending Approval'
        };

        try {
            await api.post('/enrollments', payload);
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Enrollment failed');
        }
    };

    if (loading) return <div className="p-4 text-center"><Spinner animation="border" /></div>;

    if (existingEnrollment) {
        return (
            <div className="p-4">
                <Card className={`shadow-sm border-top border-4 ${existingEnrollment.status === 'Active' ? 'border-success' : 'border-warning'}`}>
                    <Card.Body className="text-center p-5">
                        <h2 className="fw-bold">{existingEnrollment.status}</h2>
                        <p className="lead text-muted">
                            Program: {existingEnrollment.program} <br/>
                            Section: {existingEnrollment.section}
                        </p>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h4 className="mb-4">Online Enrollment</h4>
            <Card className="shadow-sm border-0 p-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Department</Form.Label>
                                <Form.Select value={selectedDept} onChange={handleDeptChange} required>
                                    <option value="">Select Department...</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {selectedDept && (
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Program</Form.Label>
                                    <Form.Select value={selectedProg} onChange={handleProgChange} required>
                                        <option value="">Select Program...</option>
                                        {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        )}
                        {selectedProg && (
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Year Level</Form.Label>
                                    <Form.Select value={selectedYear} onChange={handleYearChange} required>
                                        <option value="">Select Year...</option>
                                        <option>Grade 1</option> <option>Grade 2</option>
                                        <option>Grade 7</option> <option>Grade 8</option>
                                        <option>Grade 11</option> <option>Grade 12</option>
                                        <option>1st Year</option> <option>2nd Year</option>
                                        <option>3rd Year</option> <option>4th Year</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        )}
                        {selectedYear && (
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Section (Slots)</Form.Label>
                                    <Form.Select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} required>
                                        <option value="">Select Section...</option>
                                        {sections.map(s => (
                                            <option key={s._id} value={s._id} disabled={s.enrolledCount >= s.capacity}>
                                                {s.name} ({s.enrolledCount}/{s.capacity} Slots)
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        )}
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Payment Method</Form.Label>
                                <Form.Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required>
                                    <option value="">Select...</option>
                                    <option>Cash</option>
                                    <option>Bank</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={12} className="mt-4">
                            <Button type="submit" className="w-100" disabled={!selectedSection}>Enroll</Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default EnrollmentPage;
