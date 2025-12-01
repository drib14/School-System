import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import api from '../../api/axios';

const TeacherGradebook = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({}); // Map studentId -> gradeObj
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) fetchClassData();
    }, [selectedCourse]);

    const fetchCourses = async () => {
        const { data } = await api.get('/courses');
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]);
    };

    const fetchClassData = async () => {
        setLoading(true);
        try {
            // Fetch Students
            const query = `?program=${encodeURIComponent(selectedCourse.program)}&yearLevel=${encodeURIComponent(selectedCourse.yearLevel)}&section=${encodeURIComponent(selectedCourse.section || '')}&status=Active`;
            const { data: enrollments } = await api.get(`/enrollments${query}`);
            setStudents(enrollments);

            // Fetch Existing Grades
            const { data: existingGrades } = await api.get(`/grades?subject=${selectedCourse.code}`);
            // Map to object
            const gradeMap = {};
            existingGrades.forEach(g => {
                gradeMap[g.student._id || g.student] = g;
            });
            setGrades(gradeMap);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (studentId, field, value) => {
        const current = grades[studentId] || { writtenWork: 0, performanceTask: 0, quarterlyAssessment: 0 };
        const updated = { ...current, [field]: parseFloat(value) || 0 };

        // Calculate Final (Simplified 20/60/20 or similar)
        // Let's say: 30% WW, 50% PT, 20% QA
        const raw = (updated.writtenWork * 0.3) + (updated.performanceTask * 0.5) + (updated.quarterlyAssessment * 0.2);
        updated.finalGrade = Math.round(raw); // Simplified transmutation

        setGrades({ ...grades, [studentId]: updated });
    };

    const saveGrades = async () => {
        try {
            // Bulk save not implemented in API usually, so loop (not efficient but works for now)
            const promises = students.map(e => {
                const sId = e.student._id;
                const g = grades[sId];
                if (!g) return null;
                return api.post('/grades', {
                    studentId: sId,
                    subject: selectedCourse.code,
                    quarter: 1, // Defaulting to 1st quarter
                    writtenWork: g.writtenWork,
                    performanceTask: g.performanceTask,
                    quarterlyAssessment: g.quarterlyAssessment,
                    finalGrade: g.finalGrade
                });
            });
            await Promise.all(promises);
            alert('Grades Saved!');
        } catch (error) {
            alert('Error saving grades');
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="fw-bold text-primary mb-4">Gradebook</h2>

            <Row className="mb-4">
                <Col md={4}>
                    <Form.Select
                        value={selectedCourse?._id || ''}
                        onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                    >
                        {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.section}</option>)}
                    </Form.Select>
                </Col>
                <Col md={8} className="text-end">
                    <Button variant="success" onClick={saveGrades}>Save All Changes</Button>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table responsive hover className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Student</th>
                                    <th>Written Work (30%)</th>
                                    <th>Perf. Task (50%)</th>
                                    <th>Quarterly (20%)</th>
                                    <th>Final Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(e => {
                                    const sId = e.student._id;
                                    const g = grades[sId] || { writtenWork: '', performanceTask: '', quarterlyAssessment: '', finalGrade: '-' };
                                    return (
                                        <tr key={sId}>
                                            <td className="fw-bold">{e.student.name}</td>
                                            <td><Form.Control type="number" value={g.writtenWork} onChange={ev => handleGradeChange(sId, 'writtenWork', ev.target.value)} style={{width: '100px'}} /></td>
                                            <td><Form.Control type="number" value={g.performanceTask} onChange={ev => handleGradeChange(sId, 'performanceTask', ev.target.value)} style={{width: '100px'}} /></td>
                                            <td><Form.Control type="number" value={g.quarterlyAssessment} onChange={ev => handleGradeChange(sId, 'quarterlyAssessment', ev.target.value)} style={{width: '100px'}} /></td>
                                            <td className="fw-bold text-primary">{g.finalGrade}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TeacherGradebook;
