import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Badge, Table } from 'react-bootstrap';
import { useStorage, ACADEMIC_DATA } from '../../context/StorageContext';
import { useNavigate } from 'react-router-dom';

const EnrollmentPage = () => {
    const { currentUser, updateItem, saveItem, STORAGE_KEYS, getItems } = useStorage();
    const navigate = useNavigate();

    // Check existing enrollment
    const enrollments = getItems(STORAGE_KEYS.ENROLLMENTS);
    const existingEnrollment = enrollments.find(e => e.studentId === currentUser.id && (e.status === 'Active' || e.status === 'Pending Approval'));

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        department: '',
        program: '',
        yearLevel: '',
        section: '',
        paymentMethod: '',
    });
    const [fees, setFees] = useState([]);

    useEffect(() => {
        if (existingEnrollment) {
           // If pending or active, show status
        }
    }, [existingEnrollment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'department') { newData.program = ''; newData.yearLevel = ''; }
            if (name === 'program') { newData.yearLevel = ''; }
            return newData;
        });
    };

    const generateFees = () => {
        // Mock Fee Generation
        const baseTuition = 15000;
        const misc = 5000;
        const lab = formData.program.includes('Computer') || formData.program.includes('STEM') ? 3000 : 0;
        const total = baseTuition + misc + lab;

        setFees([
            { item: 'Tuition Fee', amount: baseTuition },
            { item: 'Miscellaneous Fees', amount: misc },
            { item: 'Laboratory Fee', amount: lab },
            { item: 'TOTAL', amount: total, isTotal: true }
        ]);
        setStep(2);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setStep(3);
    };

    const handleFinalSubmit = () => {
        // Generate Subjects
        let subjects = [];
        const yearKey = formData.yearLevel;
        if (ACADEMIC_DATA.subjects[yearKey]) {
            subjects = ACADEMIC_DATA.subjects[yearKey];
        } else if (yearKey.includes('Grade')) {
            subjects = ['Math', 'Science', 'English', 'History'];
        } else {
            subjects = ['Major 1', 'Major 2', 'Gen Ed 1', 'Gen Ed 2'];
        }

        const enrollmentRecord = {
            id: Date.now().toString(),
            studentId: currentUser.id,
            ...formData,
            subjects,
            status: 'Pending Approval', // Changed from Active
            dateEnrolled: new Date().toISOString(),
            fees: fees
        };

        saveItem(STORAGE_KEYS.ENROLLMENTS, enrollmentRecord);
        // Note: We do NOT set enrollmentStatus to 'Enrolled' yet.
        // We set it to 'Pending'.
        updateItem(STORAGE_KEYS.USERS, currentUser.id, { enrollmentStatus: 'Pending' });

        window.location.reload();
    };

    if (existingEnrollment) {
        return (
            <div className="p-4">
                <Card className={`shadow-sm border-top border-4 ${existingEnrollment.status === 'Active' ? 'border-success' : 'border-warning'}`}>
                    <Card.Body className="text-center p-5">
                        <div className="mb-4">
                            <i className={`fas ${existingEnrollment.status === 'Active' ? 'fa-check-circle text-success' : 'fa-clock text-warning'} fa-4x`}></i>
                        </div>
                        <h2 className={`fw-bold ${existingEnrollment.status === 'Active' ? 'text-success' : 'text-warning'}`}>
                            {existingEnrollment.status === 'Active' ? 'Officially Enrolled!' : 'Enrollment Pending'}
                        </h2>
                        <p className="lead text-muted">
                            {existingEnrollment.status === 'Active'
                                ? 'You are enrolled for the current academic year.'
                                : 'Your enrollment is under review by the Registrar.'}
                        </p>

                        {existingEnrollment.status === 'Active' && (
                            <>
                                <div className="bg-light p-4 rounded text-start d-inline-block mt-3" style={{minWidth: '300px'}}>
                                    <h5 className="fw-bold border-bottom pb-2 mb-3">Certificate of Registration</h5>
                                    <p className="mb-1"><strong>Student:</strong> {currentUser.firstName} {currentUser.lastName}</p>
                                    <p className="mb-1"><strong>Program:</strong> {existingEnrollment.program}</p>
                                    <p className="mb-1"><strong>Year/Section:</strong> {existingEnrollment.yearLevel} - {existingEnrollment.section}</p>
                                    <p className="mb-0"><strong>Status:</strong> <Badge bg="success">Enrolled</Badge></p>
                                </div>
                                <div className="mt-4">
                                    <Button variant="outline-primary" onClick={() => window.print()}>Print COR</Button>
                                </div>
                            </>
                        )}
                         {existingEnrollment.status === 'Pending Approval' && (
                             <Alert variant="info" className="mt-3">
                                 Please allow 1-2 business days for validation of your payment and requirements.
                             </Alert>
                        )}
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h4 className="mb-4">Online Enrollment</h4>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="progress" style={{height: '2px'}}>
                    <div className="progress-bar bg-primary-custom" role="progressbar" style={{width: `${step * 33}%`}}></div>
                </div>
                <div className="d-flex justify-content-between mt-2 text-muted small">
                    <span className={step >= 1 ? 'text-primary-custom fw-bold' : ''}>1. Academic Info</span>
                    <span className={step >= 2 ? 'text-primary-custom fw-bold' : ''}>2. Assessment</span>
                    <span className={step >= 3 ? 'text-primary-custom fw-bold' : ''}>3. Payment & Req</span>
                </div>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white">
                    <h5 className="mb-0">
                        {step === 1 && 'Select Program'}
                        {step === 2 && 'Fee Assessment'}
                        {step === 3 && 'Payment & Requirements'}
                    </h5>
                </Card.Header>
                <Card.Body className="p-4">

                    {step === 1 && (
                        <Form onSubmit={(e) => { e.preventDefault(); generateFees(); }}>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Department</Form.Label>
                                        <Form.Select name="department" value={formData.department} onChange={handleChange} required>
                                            <option value="">Select Department...</option>
                                            {ACADEMIC_DATA.departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {formData.department && (
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Program / Strand</Form.Label>
                                            <Form.Select name="program" value={formData.program} onChange={handleChange} required>
                                                <option value="">Select Program...</option>
                                                {ACADEMIC_DATA.programs[formData.department]?.map(p => <option key={p} value={p}>{p}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                )}
                                {formData.program && (
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Year Level</Form.Label>
                                            <Form.Select name="yearLevel" value={formData.yearLevel} onChange={handleChange} required>
                                                <option value="">Select Year...</option>
                                                {(ACADEMIC_DATA.yearLevels[formData.program] || ACADEMIC_DATA.yearLevels['Junior High School']).map(y => <option key={y} value={y}>{y}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                )}
                                {formData.yearLevel && (
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Section</Form.Label>
                                            <Form.Select name="section" value={formData.section} onChange={handleChange} required>
                                                <option value="">Select Section...</option>
                                                {ACADEMIC_DATA.sections.map(s => <option key={s} value={s}>{s}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                )}
                                <Col md={12} className="mt-4">
                                    <Button type="submit" className="btn-primary-custom w-100" disabled={!formData.section}>Next: View Fees</Button>
                                </Col>
                            </Row>
                        </Form>
                    )}

                    {step === 2 && (
                         <div>
                            <Table bordered hover>
                                <thead className="bg-light">
                                    <tr>
                                        <th>Fee Item</th>
                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fees.map((f, i) => (
                                        <tr key={i} className={f.isTotal ? 'fw-bold bg-light' : ''}>
                                            <td>{f.item}</td>
                                            <td className="text-end">₱{f.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className="d-flex gap-2 mt-4">
                                <Button variant="light" onClick={() => setStep(1)} className="w-50">Back</Button>
                                <Button onClick={() => setStep(3)} className="btn-primary-custom w-50">Proceed to Payment</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <Form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }}>
                            <Alert variant="warning" className="small">
                                <i className="fas fa-info-circle me-2"></i>
                                Please upload proof of payment (Bank Transfer / GCash). Enrollment will be processed upon verification.
                            </Alert>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Payment Method</Form.Label>
                                        <Form.Select name="paymentMethod" required onChange={handleChange}>
                                            <option value="">Select Method...</option>
                                            <option>Bank Deposit (BDO)</option>
                                            <option>GCash</option>
                                            <option>Cashier (On-site)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Upload Proof of Payment</Form.Label>
                                        <Form.Control type="file" required />
                                        <Form.Text className="text-muted">JPG, PNG, PDF allowed.</Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Upload Report Card (Form 138)</Form.Label>
                                        <Form.Control type="file" required />
                                    </Form.Group>
                                </Col>
                                 <Col md={12} className="mt-4">
                                    <div className="d-flex gap-2">
                                        <Button variant="light" onClick={() => setStep(2)} className="w-50">Back</Button>
                                        <Button type="submit" className="btn-primary-custom w-50">Submit Enrollment</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    )}

                </Card.Body>
            </Card>
        </div>
    );
};

export default EnrollmentPage;
