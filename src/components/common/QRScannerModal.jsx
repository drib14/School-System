import React, { useEffect, useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScannerModal = ({ show, onHide, onScan }) => {
    const [error, setError] = useState(null);

    useEffect(() => {
        let scanner;
        if (show) {
            // Small delay to ensure modal DOM is ready
            setTimeout(() => {
                scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scanner.render((decodedText) => {
                    onScan(decodedText);
                    scanner.clear();
                    onHide();
                }, (errorMessage) => {
                    // console.log(errorMessage); // Ignore scan errors
                });
            }, 300);
        }

        return () => {
            if (scanner) {
                try {
                    scanner.clear();
                } catch (e) {
                    console.error("Failed to clear scanner", e);
                }
            }
        };
    }, [show, onHide, onScan]);

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Scan Student QR Code</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                {error && <Alert variant="danger">{error}</Alert>}
                <div id="reader" style={{ width: '100%' }}></div>
                <p className="mt-3 text-muted">Position the QR code within the frame to scan.</p>
            </Modal.Body>
        </Modal>
    );
};

export default QRScannerModal;
