import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form } from 'react-bootstrap';
import { useStorage } from '../../context/StorageContext';

const GradesPage = () => {
    const { users, saveItem, getItems, STORAGE_KEYS } = useStorage();
    const students = users.filter(u => u.role === 'Student');
    const grades = getItems(STORAGE_KEYS.GRADES);

    const getGrade = (studentId) => {
        return grades.find(g => g.studentId === studentId)?.grade || '-';
    };

    const handleGradeChange = (studentId, grade) => {
        // Simple update: remove old, add new (inefficient but works for prototype)
        // Ideally should use updateItem with a composite key, but storage context is simple.
        // We'll just push to a list and read the last one for now or filter.
        saveItem(STORAGE_KEYS.GRADES, { id: Date.now().toString(), studentId, grade, subject: 'MATH101' });
        // Force re-render would require state update, which useStorage doesn't fully expose reactively for custom items yet
        // In a real app, useStorage would expose `grades` state.
        // For this prototype, we'll reload or rely on local state.
        window.location.reload(); // Brute force refresh for prototype
    };

    return (
        <div className="p-4">
            <h4 className="mb-4">Gradebook (MATH101)</h4>
            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Student ID</th>
                            <th>Name</th>
                            <th>Current Grade</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id}>
                                <td className="ps-4 fw-bold">{s.id}</td>
                                <td>{s.firstName} {s.lastName}</td>
                                <td className="fw-bold text-primary-custom">{getGrade(s.id)}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button size="sm" variant="outline-success" onClick={() => handleGradeChange(s.id, '90')}>A</Button>
                                        <Button size="sm" variant="outline-primary" onClick={() => handleGradeChange(s.id, '85')}>B</Button>
                                        <Button size="sm" variant="outline-warning" onClick={() => handleGradeChange(s.id, '75')}>C</Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => handleGradeChange(s.id, '60')}>F</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default GradesPage;
