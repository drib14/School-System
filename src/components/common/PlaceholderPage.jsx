import React from 'react';
import { Card } from 'react-bootstrap';

const PlaceholderPage = ({ title }) => {
    return (
        <div className="p-4">
            <h4 className="mb-4">{title}</h4>
            <Card className="shadow-sm border-0 text-center py-5">
                <Card.Body>
                    <i className="fas fa-tools fa-3x text-muted mb-3 opacity-50"></i>
                    <h5 className="text-muted">Module Under Construction</h5>
                    <p className="text-muted small">This feature is part of the full implementation plan.</p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PlaceholderPage;
