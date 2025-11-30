import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { useStorage } from '../../context/StorageContext';
import logo from '../../assets/img/logo.png';

const VirtualIDCard = () => {
    const { currentUser } = useStorage();

    if (!currentUser) return null;

    return (
        <Card className="shadow-lg border-0 mx-auto" style={{ maxWidth: '350px', borderRadius: '15px', overflow: 'hidden' }}>
            <div className="bg-primary-custom p-3 text-center text-white">
                <div className="d-flex align-items-center justify-content-center mb-2">
                     <div className="bg-white text-primary-custom rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: 30, height: 30, fontSize: 14}}>
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    <h5 className="mb-0 fw-bold">EduCore University</h5>
                </div>
                <small className="text-white-50">Student Identification</small>
            </div>
            <Card.Body className="text-center p-4">
                <div className="mb-3">
                    <img
                        src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.name}&background=0FB4A9&color=fff`}
                        alt="Profile"
                        className="rounded-circle border border-3 border-light shadow-sm"
                        style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '-60px' }}
                    />
                </div>
                <h4 className="fw-bold mb-1">{currentUser.name}</h4>
                <p className="text-muted mb-3">{currentUser.studentId || 'ID: Pending'}</p>
                <Badge bg="info" className="mb-3 px-3 py-2 rounded-pill">{currentUser.course || 'General Student'}</Badge>

                <div className="my-4 border rounded p-3 bg-light d-inline-block">
                    <QRCodeSVG value={currentUser._id || "temp"} size={120} />
                </div>

                <div className="small text-muted text-start mt-2">
                    <div className="d-flex justify-content-between mb-1">
                        <span>Role:</span>
                        <span className="fw-bold">{currentUser.role}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                        <span>Email:</span>
                        <span className="fw-bold">{currentUser.email}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span>Valid Thru:</span>
                        <span className="fw-bold">2024-2025</span>
                    </div>
                </div>
            </Card.Body>
            <Card.Footer className="bg-light text-center py-3">
                <small className="text-muted d-block mb-2">Scan this code for attendance</small>
                {/* <Button size="sm" variant="outline-primary" className="rounded-pill px-4">Download ID</Button> */}
            </Card.Footer>
        </Card>
    );
};

export default VirtualIDCard;
